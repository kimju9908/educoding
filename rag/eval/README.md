# Retrieval 골든셋 평가

`run_eval.py`는 실제 Elasticsearch 인덱스와 BGE-m3 모델로 `service/main.py`의
`retrieve()`를 직접 호출해서, `golden_set.jsonl`에 적어둔 질문들이 기대한 레슨 청크를
상위 K개 안에서 찾아내는지 확인합니다. Claude는 호출하지 않으므로 API 키가 필요 없고,
순수하게 검색 품질만 검증합니다.

```bash
cd rag
source .venv/bin/activate
python eval/run_eval.py
```

각 케이스는 다음 중 하나를 기대합니다.

- `expect_chunk_id`: 이 id의 청크가 top-K 안에 있어야 함
- `expect_low_score`: (오프토픽 질문 등) top score가 낮아야 함 -- 임계값 미만이면 서비스가
  "관련된 학습 자료를 찾지 못했습니다"로 답하도록

## 이 과정에서 실제로 잡은 버그

골든셋을 처음 작성해서 돌렸을 때 2건의 FAIL이 나왔고, 둘 다 원인이 달랐습니다.

1. **`python-for-range` (골든셋 라벨링 오류)** -- "파이썬 for문에서 range 함수는 어떻게
   쓰나요?"의 기대값을 `python-01-10-24`(반복문 전체를 요약하는 "주요 키워드 정리" 섹션)로
   잘못 잡아서 실패했습니다. 실제로는 `python-01-10-07`("for 변수 in range(...)" 문법 설명)이
   이 질문에 훨씬 더 정확한 정답이었고, 검색 엔진은 처음부터 맞게 동작하고 있었습니다. →
   골든셋 쪽을 수정.

2. **`off-topic-no-match` (실제 서비스 버그)** -- "오늘 저녁 메뉴 추천해줘"라는 완전히
   무관한 질문이 자바 `HashMap` "커피 메뉴 만들기" 예제를 **0.737** 점수로 끌어왔습니다.
   "메뉴"라는 단어 하나가 겹친다는 이유만으로요. 당시 코드는 ES가 0건을 반환할 때만
   "찾지 못했습니다" 폴백을 썼고, 점수가 얼마든 상위 K개를 그대로 Claude에 넘겼습니다.
   골든셋의 실제 정답 케이스들 점수는 전부 0.81~0.89에 몰려 있어서, 0.74짜리 히트는
   명백히 노이즈였습니다. → `service/main.py`의 `retrieve()`에 `RAG_MIN_SCORE`
   (기본 0.75) 임계값을 추가해서, 이 점수 미만의 히트는 Claude에게 전달되기 전에
   걸러내도록 고쳤습니다 (`service/.env.example` 참고).

두 건 모두 고친 뒤 `python eval/run_eval.py`를 다시 돌려서 12/12 통과를 확인했습니다.
