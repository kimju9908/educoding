package com.kh.totalproject.service;

import com.kh.totalproject.constant.ChatRole;
import com.kh.totalproject.constant.rag.RagProperties;
import com.kh.totalproject.dto.request.AskChatbotRequest;
import com.kh.totalproject.dto.request.CitedSource;
import com.kh.totalproject.dto.request.RagAskRequest;
import com.kh.totalproject.dto.response.ChatbotAnswerResponse;
import com.kh.totalproject.dto.response.ChatbotSourceResponse;
import com.kh.totalproject.entity.ChatMessage;
import com.kh.totalproject.repository.ChatMessageRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * RagChatbotService의 대화 상태 저장/복원 경로를 검증합니다. RestTemplate과
 * ChatMessageRepository를 모두 Mockito로 대체하므로 실제 RAG 서비스나 DB는 필요 없습니다 --
 * "저장한 citationNumber/chunkId가 그대로 다음 요청에 실리는가"를 검증하는 데이터 전달
 * 테스트이며, Claude가 실제로 올바른 과거 자료를 고르는지는 여기서 다루지 않습니다 (그건
 * rag/README.md에 기록된 실제 스택 3턴 라이브 테스트가 검증한 부분입니다).
 */
@ExtendWith(MockitoExtension.class)
class RagChatbotServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private ChatMessageRepository chatMessageRepository;

    private RagChatbotService service;

    @BeforeEach
    void setUp() {
        RagProperties ragProperties = new RagProperties("http://127.0.0.1:5051", null, null, null);
        service = new RagChatbotService(restTemplate, ragProperties, chatMessageRepository);
    }

    private void stubRagResponse(String answer, List<ChatbotSourceResponse> sources) {
        when(restTemplate.exchange(
                anyString(), eq(HttpMethod.POST), any(HttpEntity.class), eq(ChatbotAnswerResponse.class)
        )).thenReturn(ResponseEntity.ok(new ChatbotAnswerResponse(answer, sources)));
    }

    private ChatbotSourceResponse source(String chunkId) {
        return new ChatbotSourceResponse(
                chunkId, "java", "04. 객체 지향 프로그래밍", "02. 메소드와 필드",
                "메소드의 선언", 3, "/study/java/04/02?headingIndex=3", 0.88
        );
    }

    @SuppressWarnings("unchecked")
    private RagAskRequest capturedRagAskRequest() {
        ArgumentCaptor<HttpEntity<RagAskRequest>> captor = ArgumentCaptor.forClass(HttpEntity.class);
        verify(restTemplate).exchange(anyString(), eq(HttpMethod.POST), captor.capture(), eq(ChatbotAnswerResponse.class));
        return captor.getValue().getBody();
    }

    // ---- 저장: 답변의 sources가 citationNumber + chunkId로 저장되는가 --------------------

    @Test
    void savesAssistantTurnWithCitationNumbersMatchingSourceOrder() {
        stubRagResponse("메소드는 [1][2]처럼 선언합니다.", List.of(source("chunk-a"), source("chunk-b")));

        service.ask(new AskChatbotRequest("질문", "java", "session-1"));

        ArgumentCaptor<ChatMessage> captor = ArgumentCaptor.forClass(ChatMessage.class);
        verify(chatMessageRepository, org.mockito.Mockito.times(2)).save(captor.capture());
        ChatMessage assistantRow = captor.getAllValues().get(1);

        assertThat(assistantRow.getRole()).isEqualTo(ChatRole.ASSISTANT);
        assertThat(assistantRow.getSourcesJson())
                .isEqualTo("[{\"citationNumber\":1,\"chunkId\":\"chunk-a\"},{\"citationNumber\":2,\"chunkId\":\"chunk-b\"}]");
    }

    @Test
    void userTurnIsSavedWithoutSources() {
        stubRagResponse("답변", List.of(source("chunk-a")));

        service.ask(new AskChatbotRequest("질문", "java", "session-1"));

        ArgumentCaptor<ChatMessage> captor = ArgumentCaptor.forClass(ChatMessage.class);
        verify(chatMessageRepository, org.mockito.Mockito.times(2)).save(captor.capture());
        ChatMessage userRow = captor.getAllValues().get(0);

        assertThat(userRow.getRole()).isEqualTo(ChatRole.USER);
        assertThat(userRow.getSourcesJson()).isNull();
    }

    @Test
    void assistantTurnWithNoSourcesIsStoredWithNullSourcesJsonNotAnEmptyArray() {
        stubRagResponse("관련 자료를 찾지 못했습니다.", List.of());

        service.ask(new AskChatbotRequest("질문", "java", "session-1"));

        ArgumentCaptor<ChatMessage> captor = ArgumentCaptor.forClass(ChatMessage.class);
        verify(chatMessageRepository, org.mockito.Mockito.times(2)).save(captor.capture());
        assertThat(captor.getAllValues().get(1).getSourcesJson()).isNull();
    }

    // ---- 복원: 저장된 sources가 다음 요청의 history에 그대로 실리는가 ----------------------

    @Test
    void storedSourcesAreReplayedIntoTheNextRequestsHistoryUnchanged() {
        ChatMessage userRow = ChatMessage.builder()
                .role(ChatRole.USER).content("자바에서 메소드는 어떻게 선언하나요?").build();
        ChatMessage assistantRow = ChatMessage.builder()
                .role(ChatRole.ASSISTANT).content("메소드는 [1]처럼 선언합니다.")
                .sourcesJson("[{\"citationNumber\":1,\"chunkId\":\"chunk-a\"}]").build();
        // 리포지토리는 최신순(DESC)으로 반환 -- 서비스가 Collections.reverse()로 시간순으로
        // 뒤집으므로(제자리 변경), List.of()의 불변 리스트가 아니라 변경 가능한 리스트를 줘야 한다
        // -- 실제 JPA 리포지토리가 돌려주는 리스트는 가변이라, 이건 production 코드가 아니라
        // 이 테스트의 mock 데이터 준비 방식에 대한 요구사항일 뿐이다.
        when(chatMessageRepository.findBySessionIdOrderByIdDesc(eq("session-1"), any(Pageable.class)))
                .thenReturn(new ArrayList<>(List.of(assistantRow, userRow)));
        stubRagResponse("답", List.of());

        service.ask(new AskChatbotRequest("그럼 반환값이 없을 때는요?", "java", "session-1"));

        RagAskRequest sent = capturedRagAskRequest();
        assertThat(sent.history()).hasSize(2);
        assertThat(sent.history().get(0).content()).isEqualTo("자바에서 메소드는 어떻게 선언하나요?");
        assertThat(sent.history().get(0).sources()).isEmpty();
        assertThat(sent.history().get(1).content()).isEqualTo("메소드는 [1]처럼 선언합니다.");
        assertThat(sent.history().get(1).sources()).containsExactly(new CitedSource(1, "chunk-a"));
    }

    @Test
    void pastAssistantTurnsWithTheSameCitationNumberButDifferentChunkIdsStayDistinct() {
        ChatMessage questionA = ChatMessage.builder().role(ChatRole.USER).content("질문A").build();
        ChatMessage answerA = ChatMessage.builder()
                .role(ChatRole.ASSISTANT).content("답변A [1]")
                .sourcesJson("[{\"citationNumber\":1,\"chunkId\":\"chunk-A\"}]").build();
        ChatMessage questionB = ChatMessage.builder().role(ChatRole.USER).content("질문B").build();
        ChatMessage answerB = ChatMessage.builder()
                .role(ChatRole.ASSISTANT).content("답변B [1]")
                .sourcesJson("[{\"citationNumber\":1,\"chunkId\":\"chunk-B\"}]").build();
        // DESC: 가장 최근 것부터 (가변 리스트로 -- 위 설명과 동일한 이유)
        when(chatMessageRepository.findBySessionIdOrderByIdDesc(eq("session-1"), any(Pageable.class)))
                .thenReturn(new ArrayList<>(List.of(answerB, questionB, answerA, questionA)));
        stubRagResponse("답", List.of());

        service.ask(new AskChatbotRequest("질문C", "java", "session-1"));

        RagAskRequest sent = capturedRagAskRequest();
        assertThat(sent.history()).hasSize(4);
        // 시간순으로: 질문A, 답변A([1]=chunk-A), 질문B, 답변B([1]=chunk-B)
        assertThat(sent.history().get(1).sources()).containsExactly(new CitedSource(1, "chunk-A"));
        assertThat(sent.history().get(3).sources()).containsExactly(new CitedSource(1, "chunk-B"));
        // 번호는 같지만(둘 다 1) 서로 다른 턴에 속한 서로 다른 자료라는 게 섞이지 않고 유지된다
        assertThat(sent.history().get(1).sources().get(0).chunkId())
                .isNotEqualTo(sent.history().get(3).sources().get(0).chunkId());
    }

    @Test
    void endToEndRoundTripForwardsAPastCitationAndPersistsTheNewOne() {
        // 과거 턴이 chunk-B를 [1]로 인용했다고 가정하고, 이번 턴의 RAG 응답도 (RAG 서비스가
        // chunk_id로 다시 조회해 확인했다고 치고) 같은 chunk-B를 돌려준 상황을 흉내낸다.
        // 이 테스트는 "그 응답이 그대로 저장되고 다음 턴에 또 실릴 데이터 흐름"만 검증하는 것이며,
        // Claude가 실제로 chunk-B를 고르는 판단 자체는 검증 대상이 아니다.
        ChatMessage priorAssistant = ChatMessage.builder()
                .role(ChatRole.ASSISTANT).content("답변 [1]")
                .sourcesJson("[{\"citationNumber\":1,\"chunkId\":\"chunk-B\"}]").build();
        when(chatMessageRepository.findBySessionIdOrderByIdDesc(eq("session-1"), any(Pageable.class)))
                .thenReturn(List.of(priorAssistant));
        stubRagResponse("그 자료는 [1]에 나온 대로입니다.", List.of(source("chunk-B")));

        ChatbotAnswerResponse response = service.ask(
                new AskChatbotRequest("방금 답변의 [1]번 자료 더 설명해줘", "java", "session-1")
        );

        // (1) 과거 턴의 인용이 그대로 history로 전달됨
        RagAskRequest sent = capturedRagAskRequest();
        assertThat(sent.history().get(0).sources()).containsExactly(new CitedSource(1, "chunk-B"));

        // (2) 이번 턴 응답의 출처도 그대로 반환됨
        assertThat(response.sources()).hasSize(1);
        assertThat(response.sources().get(0).chunkId()).isEqualTo("chunk-B");

        // (3) 이번 턴 답변도 같은 매핑으로 다시 저장됨(다음 턴을 위해)
        ArgumentCaptor<ChatMessage> captor = ArgumentCaptor.forClass(ChatMessage.class);
        verify(chatMessageRepository, org.mockito.Mockito.times(2)).save(captor.capture());
        assertThat(captor.getAllValues().get(1).getSourcesJson())
                .isEqualTo("[{\"citationNumber\":1,\"chunkId\":\"chunk-B\"}]");
    }

    // ---- 하위 호환: 출처 없는 기존 기록, sessionId 없는 요청 --------------------------------

    @Test
    void legacyHistoryRowWithoutSourcesJsonIsTreatedAsNoSourcesNotAnError() {
        ChatMessage legacyAssistantRow = ChatMessage.builder()
                .role(ChatRole.ASSISTANT).content("예전 답변").sourcesJson(null).build();
        when(chatMessageRepository.findBySessionIdOrderByIdDesc(eq("session-1"), any(Pageable.class)))
                .thenReturn(List.of(legacyAssistantRow));
        stubRagResponse("답", List.of());

        service.ask(new AskChatbotRequest("질문", "java", "session-1"));

        RagAskRequest sent = capturedRagAskRequest();
        assertThat(sent.history()).hasSize(1);
        assertThat(sent.history().get(0).sources()).isEmpty();
    }

    @Test
    void requestWithoutSessionIdNeverTouchesTheRepository() {
        stubRagResponse("답", List.of(source("chunk-a")));

        service.ask(new AskChatbotRequest("질문", "java", null));

        verify(chatMessageRepository, never()).save(any());
        verify(chatMessageRepository, never()).findBySessionIdOrderByIdDesc(any(), any());
        RagAskRequest sent = capturedRagAskRequest();
        assertThat(sent.history()).isEmpty();
    }
}
