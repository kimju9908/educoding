"""LangGraph version of the agentic RAG loop.

Graph shape -- a classic bounded ReAct loop:

    START -> agent --[tool call requested?]--> tools -> agent -> ... -> END
                 \\--[no]--------------------------------------------> END

`agent` calls Claude (with search_study_material bound as a tool); `tools`
actually runs the search and feeds the results back in. This replaced a
hand-rolled while-loop that lived directly in main.py -- see
rag/README.md's "도구 호출 (에이전틱 RAG)" section for why each of the
following exists, found by running the hand-rolled version against the real
stack before this rewrite:

- the FIRST `agent` call forces the search tool (tool_choice). The system
  prompt alone ("search before answering") wasn't reliable -- Claude
  sometimes skipped the tool on a follow-up question and answered from
  conversation history instead, citing a stale [1] with no sources attached.
- the LAST allowed `agent` call forces tool_choice="none", so a model that
  keeps calling the tool instead of answering still returns something
  grounded in whatever was found so far, instead of hanging.
- citation numbers (`cited`) are assigned once per chunk and stay stable
  across repeated searches in the same request.

Porting the hand-rolled version to this graph re-triggered that exact bug: by
default, langchain-anthropic's `bind_tools` unconditionally drops a forced
tool_choice ("any" or a named tool) whenever the model has `thinking` enabled
-- it warns "Tool calls are not guaranteed" and silently falls back to auto,
citing an Anthropic API constraint. That constraint doesn't actually hold for
CLAUDE_MODEL's default (claude-sonnet-5): calling the raw `anthropic` SDK
directly with `tool_choice={"type": "any"}` and thinking enabled works fine.
`build_graph` below works around langchain-anthropic's defensive drop by
binding the forced-tool call to a second, thinking-disabled `ChatAnthropic`
instance -- its only job is picking a search query, not reasoning about the
final answer, so losing thinking there doesn't cost much.
"""
import logging
from typing import Annotated, List, Optional, TypedDict

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage
from langgraph.graph import END, StateGraph
from langgraph.graph.message import add_messages

from retrieval import (
    ChatTurn,
    MAX_HISTORY_TURNS,
    SEARCH_TOOL,
    build_system_prompt,
    format_search_result,
    ordered_hits_from_cited,
    resolve_tool_language,
    search_or_lookup,
)

logger = logging.getLogger("rag.chatbot")


class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    agent_calls: int


def _render_assistant_turn(turn: ChatTurn) -> str:
    """An assistant turn's stored text has citations like [2] in it, but nothing
    ties [2] back to an actual chunk once that turn scrolls into history -- so a
    follow-up like "아까 [2]번 자료 더 설명해줘" has nothing to resolve against.
    Appending this turn's own citation->chunk_id mapping lets Claude look it up
    for real (via SEARCH_TOOL's chunk_id param) instead of guessing from the
    surrounding text. See build_system_prompt for how Claude is told to read it
    and why it won't confuse this turn's [2] with a different turn's [2].
    """
    if not turn.sources:
        return turn.content
    mapping = ", ".join(f"{s.citationNumber}={s.chunkId}" for s in turn.sources)
    return f"{turn.content}\n\n[이전 답변 자료 매핑: {mapping}]"


def _history_to_messages(history: List[ChatTurn]):
    messages = []
    for turn in history[-MAX_HISTORY_TURNS:]:
        if turn.role == "user":
            messages.append(HumanMessage(content=turn.content))
        elif turn.role == "assistant":
            messages.append(AIMessage(content=_render_assistant_turn(turn)))
    return messages


def build_graph(claude_api_key: str, model_name: str, max_tool_iterations: int, language_hint: Optional[str]):
    base_kwargs = dict(model=model_name, api_key=claude_api_key, max_tokens=2000)
    model = ChatAnthropic(**base_kwargs, thinking={"type": "adaptive"})
    tool_name = SEARCH_TOOL["name"]

    # langchain-anthropic silently drops a forced tool_choice ("any"/named tool)
    # whenever `thinking` is enabled on the model -- it warns "Tool calls are not
    # guaranteed" and falls back to auto, regardless of what the underlying model
    # actually supports (verified directly against the Anthropic API: claude-sonnet-5
    # accepts tool_choice="any" with thinking on just fine). That silent fallback
    # reintroduced the exact bug phase 3 fixed: a follow-up question skipping the
    # search entirely and answering from history alone. The forced call's whole job
    # is picking a search query, not reasoning about the final answer, so it uses a
    # second, thinking-disabled model instance instead -- that keeps the force real.
    model_without_thinking = ChatAnthropic(**base_kwargs)
    model_forced = model_without_thinking.bind_tools([SEARCH_TOOL], tool_choice={"type": "tool", "name": tool_name})
    model_auto = model.bind_tools([SEARCH_TOOL])
    # NOT tool_choice="none" (a bare string): bind_tools only special-cases "any" and
    # "auto" as string shortcuts, so a plain "none" string is treated as a TOOL NAME to
    # force (`{"type": "tool", "name": "none"}`) -- which then trips the same
    # thinking-drops-forced-tool_choice fallback as model_forced above, for the wrong
    # reason. The real "don't call any tool" value is the dict form.
    model_no_more_tools = model.bind_tools([SEARCH_TOOL], tool_choice={"type": "none"})

    cited: dict = {}

    def agent_node(state: AgentState):
        calls = state["agent_calls"]
        if calls == max_tool_iterations - 1:
            bound_model = model_no_more_tools
        elif calls == 0:
            bound_model = model_forced
        else:
            bound_model = model_auto
        response = bound_model.invoke(state["messages"])
        return {"messages": [response], "agent_calls": calls + 1}

    def tools_node(state: AgentState):
        last_message = state["messages"][-1]
        results = []
        for call in last_message.tool_calls:
            args = call.get("args") or {}
            query = args.get("query") or None
            chunk_id = args.get("chunk_id") or None
            language = resolve_tool_language(args, language_hint)
            hits = search_or_lookup(query, language, chunk_id)
            results.append(ToolMessage(
                content=format_search_result(hits, cited),
                tool_call_id=call["id"],
            ))
        return {"messages": results}

    def route_after_agent(state: AgentState):
        last_message = state["messages"][-1]
        if isinstance(last_message, AIMessage) and last_message.tool_calls:
            return "tools"
        return END

    graph = StateGraph(AgentState)
    graph.add_node("agent", agent_node)
    graph.add_node("tools", tools_node)
    graph.set_entry_point("agent")
    graph.add_conditional_edges("agent", route_after_agent, {"tools": "tools", END: END})
    graph.add_edge("tools", "agent")

    return graph.compile(), cited


def run(question: str, language: Optional[str], history: List[ChatTurn], claude_api_key: str,
        model_name: str, max_tool_iterations: int):
    """Runs one turn of the agent graph. `language` is only a fallback used when a
    search_study_material call doesn't specify its own language.
    """
    app, cited = build_graph(claude_api_key, model_name, max_tool_iterations, language)

    messages = [SystemMessage(content=build_system_prompt())]
    messages.extend(_history_to_messages(history))
    messages.append(HumanMessage(content=question))

    final_state = app.invoke(
        {"messages": messages, "agent_calls": 0},
        config={"recursion_limit": max_tool_iterations * 2 + 2},
    )

    answer = final_state["messages"][-1].text
    return answer, ordered_hits_from_cited(cited)
