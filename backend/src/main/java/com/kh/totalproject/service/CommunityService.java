/* 커뮤니티에 해당하는 모든 요청을 처리하는 서비스 계층
*  각 게시판의 CRUD 에서 Create, Update, 각 게시판 전체글 Read 에 해당하는 로직은 각각 상속받는 하위 클래스를 참조하여
*  직접 하위계층의 Repository 로 접근을 하며 Delete 에 해당하는 로직은 부모클래스의 board_id 를 참조하여 삭제
*  comment 와 reaction 는 조회를 제외하고 CUD 동작은 부모게시판의 id 를 참조받아 작업 수행 */

package com.kh.totalproject.service;

import co.elastic.clients.elasticsearch.ElasticsearchClient;
import co.elastic.clients.elasticsearch._types.ElasticsearchException;
import co.elastic.clients.elasticsearch._types.Result;
import co.elastic.clients.elasticsearch.core.*;
import com.google.firebase.database.DatabaseException;
import com.kh.totalproject.constant.BoardType;
import com.kh.totalproject.constant.Reaction;
import com.kh.totalproject.constant.Status;
import com.kh.totalproject.dto.request.BoardRequest;
import com.kh.totalproject.dto.request.CommentRequest;
import com.kh.totalproject.dto.response.BoardReactionResponse;
import com.kh.totalproject.dto.response.BoardResponse;
import com.kh.totalproject.dto.response.CommentResponse;
import com.kh.totalproject.dto.response.UserResponse;
import com.kh.totalproject.entity.*;
import com.kh.totalproject.exception.*;
import com.kh.totalproject.repository.*;
import com.kh.totalproject.util.SecurityUtil;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class CommunityService {
    private final CodingBoardRepository codingBoardRepository;
    private final CourseBoardRepository courseBoardRepository;
    private final StudyBoardRepository studyBoardRepository;
    private final TeamBoardRepository teamBoardRepository;
    private final UserRepository userRepository;
    private final BoardRepository boardRepository;
    private final CommentRepository commentRepository;
    private final BoardReactionRepository boardReactionRepository;
    private final CustomBoardRepository customBoardRepository;
    private final ElasticsearchClient elasticsearchClient;
    private final EntityManager entityManager;

    // 게시글 생성 서비스 getCurrentUserIdOrThrow 를 통해서 Context 헤더로 들어온 Access 토큰을 처리
    public Boolean createPost(BoardRequest boardRequest, String boardType) {
        Long userKey = SecurityUtil.getCurrentUserIdOrThrow();
        User user = userRepository.findById(userKey)
                .orElseThrow(() -> new EntityNotFoundException("해당 유저를 찾을 수 없습니다"));
        // setName 으로 닉네임을 변수값으로 지정
        boardRequest.setName(user.getNickname());
        // Enum -> String 타입변환
        BoardType type = BoardType.fromString(boardType);
        // 엔티티화 한후 저장
        Board boardEntity = createBoardEntity(boardRequest, user, type);
        // 저장을 미리 해주지 않으면 Elasticsearch 에서 NullPointException 에러 발생 가능
        boardEntity = boardRepository.save(boardEntity);
        // 생성된 게시글 저장 return true
        // SQL 에 저장이 됐다면, 엘라스틱서치에도 똑같이 필요한 필드 저장
        saveToElasticsearch(boardEntity);
        return true;
    }

    // 각 게시판별 엔티티 생성 스위치문
    private Board createBoardEntity(BoardRequest boardRequest, User user, BoardType type) {
        return switch (type) {
            case CODING -> boardRequest.toCreateCodingPost(user);
            case COURSE -> boardRequest.toCreateCoursePost(user);
            case STUDY -> boardRequest.toCreateStudyPost(user);
            case TEAM -> boardRequest.toCreateTeamPost(user);
        };
    }

    // 엘라스틱 서치에 저장하는 로직
    private void saveToElasticsearch(Board boardEntity) {
        try {
            Map<String, Object> document = new HashMap<>();
            document.put("boardId", boardEntity.getId());
            document.put("userKey", boardEntity.getUser().getUserKey());
            document.put("title", boardEntity.getTitle());
            document.put("content", boardEntity.getContent());
            document.put("boardType", boardEntity.getBoardType().toString());

            IndexRequest<Map<String, Object>> indexRequest = IndexRequest.of(i -> i
                    .index("board_index")
                    .id(boardEntity.getId().toString())  // boardId를 문서 ID로 사용
                    .document(document));

            elasticsearchClient.index(indexRequest);
        } catch (IOException ex) {
            throw new ElasticException("엘라스틱 서치 관련 에러 발생");
        }
    }

    public Boolean modifyPost(BoardRequest boardRequest, String boardType) {
        Long userKey = SecurityUtil.getCurrentUserIdOrThrow();
        User user = userRepository.findById(userKey)
                .orElseThrow(() -> new EntityNotFoundException("해당 유저를 찾을 수 없습니다"));
        BoardType type = BoardType.fromString(boardType);
        Board existingBoard = findByBoardId(boardRequest, type);

        if (!existingBoard.getUser().getUserKey().equals(user.getUserKey())) {
            throw new AccessDeniedException("이 글을 수정할 권한이 없습니다");
        }

        Board updatedBoard = updateBoard(boardRequest, existingBoard, user, type);
        boolean isBoardSaved = saveBoardEntity(updatedBoard);

        if (isBoardSaved) {
            updateElasticsearch(updatedBoard);
        } else {
            throw new DatabaseException("엘라스틱 서치 관련 에러 발생");
        }

        return true;
    }

    // 게시글 삭제 서비스 로직
    public Boolean deletePost(Long id) {
        Long userKey = SecurityUtil.getCurrentUserIdOrThrow();
        User user = userRepository.findById(userKey)
                .orElseThrow(() -> new EntityNotFoundException("해당 유저를 찾을 수 없습니다"));
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("삭제할 게시글이 존재하지 않습니다"));
        // 삭제 권한 검증
        if (!board.getUser().getUserId().equals(user.getUserId())) {
            throw new AccessDeniedException("이 글을 삭제 할 권한이 없습니다");
        }
        boardRepository.deleteById(id);
        deleteFromElasticsearch(id);
        return true;
    }

    // 엘라스틱서치에서 id 참조 받아 삭제하는 로직
    private void deleteFromElasticsearch(Long boardId) {
        try {
            DeleteRequest request = DeleteRequest.of(d -> d
                    .index("board_index")
                    .id(boardId.toString())
            );
            DeleteResponse response = elasticsearchClient.delete(request);
            if (response.result() == Result.Deleted) {
                log.info("Elasticsearch 에서 삭제 성공 {}", boardId);
            } else {
                log.warn("Elasticsearch 에서 삭제 실패 {}", boardId);
            }
        } catch (IOException ex) {
            throw new ElasticException("엘라스틱 관련 에러 발생");
        }
    }

    // BoardId 로 해당하는 글을 찾는 메서드
    private Board findByBoardId(BoardRequest boardRequest, BoardType type) {
        return switch (type) {
            case CODING -> codingBoardRepository.findById(boardRequest.getBoardId())
                    .orElseThrow(() -> new EntityNotFoundException("해당하는 게시글을 찾을 수 없습니다."));
            case COURSE -> courseBoardRepository.findById(boardRequest.getBoardId())
                    .orElseThrow(() -> new EntityNotFoundException("해당하는 게시글을 찾을 수 없습니다."));
            case STUDY -> studyBoardRepository.findById(boardRequest.getBoardId())
                    .orElseThrow(() -> new EntityNotFoundException("해당하는 게시글을 찾을 수 없습니다."));
            case TEAM -> teamBoardRepository.findById(boardRequest.getBoardId())
                    .orElseThrow(() -> new EntityNotFoundException("해당하는 게시글을 찾을 수 없습니다."));
        };
    }

    private Board updateBoard(BoardRequest boardRequest, Board existingBoard, User user, BoardType type) {
        // 게시글 타입에 따라 수정된 게시글 생성
        Board updatedBoard = switch (type) {
            case CODING -> boardRequest.toModifyCodingPost(user, (CodingBoard) existingBoard);
            case COURSE -> boardRequest.toModifyCoursePost(user, (CourseBoard) existingBoard);
            case STUDY -> boardRequest.toModifyStudyPost(user, (StudyBoard) existingBoard);
            case TEAM -> boardRequest.toModifyTeamPost(user, (TeamBoard) existingBoard);
        };

        // 기존의 좋아요/싫어요/조회수 카운트를 유지
        updatedBoard.setCommentCnt(existingBoard.getCommentCnt());
        updatedBoard.setLikeCnt(existingBoard.getLikeCnt());
        updatedBoard.setDislikeCnt(existingBoard.getDislikeCnt());
        updatedBoard.setViewCnt(existingBoard.getViewCnt());

        // 기존의 BoardReaction 엔티티를 수정된 게시글에 반영
        updatedBoard.setBoardReactions(new ArrayList<>(existingBoard.getBoardReactions()));  // List 타입으로 변환

        // 반응 상태를 갱신
        updateLikeDislikeCounts(updatedBoard);

        return updatedBoard;
    }
    
    // 엔티티에 저장하는 로직
    private Boolean saveBoardEntity(Board boardEntity) {
        try {
            if (boardEntity instanceof CodingBoard) {
                codingBoardRepository.save((CodingBoard) boardEntity);
            } else if (boardEntity instanceof CourseBoard) {
                courseBoardRepository.save((CourseBoard) boardEntity);
            } else if (boardEntity instanceof StudyBoard) {
                studyBoardRepository.save((StudyBoard) boardEntity);
            } else if (boardEntity instanceof TeamBoard) {
                teamBoardRepository.save((TeamBoard) boardEntity);
            } else {
                return false;
            }

            updateElasticsearchForSave(boardEntity);
            return true;
        } catch (DataAccessException ex) {
            throw new DatabaseException("데이터 베이스 관련 에러");
        }
    }

    // 엘라스틱에 저장되는 로직
    private void updateElasticsearchForSave(Board boardEntity) {
        try {
            Map<String, Object> document = new HashMap<>();
            document.put("title", boardEntity.getTitle());
            document.put("content", boardEntity.getContent());
            document.put("boardType", boardEntity.getBoardType().toString());

            IndexRequest<Map<String, Object>> indexRequest = IndexRequest.of(i -> i
                    .index("board_index")
                    .id(boardEntity.getId().toString())
                    .document(document));

            elasticsearchClient.index(indexRequest);
        } catch (IOException ex) {
            throw new ElasticException("엘라스틱 입출력 관련 에러 발생");
        }
    }

    // board 에서 가져온 데이터를 저장
    private void updateElasticsearch(Board updatedBoard) {
        try {
            Map<String, Object> document = new HashMap<>();
            document.put("boardId", updatedBoard.getId());
            document.put("title", updatedBoard.getTitle());
            document.put("content", updatedBoard.getContent());
            document.put("boardType", updatedBoard.getBoardType().toString());

            UpdateRequest<Map<String, Object>, Map<String, Object>> updateRequest = UpdateRequest.of(u -> u
                    .index("board_index")
                    .id(updatedBoard.getId().toString())
                    .doc(document)
            );

            UpdateResponse<Map<String, Object>> updateResponse = elasticsearchClient.update(updateRequest, Map.class);
            log.info("Elasticsearch 문서 업데이트 성공: {}, 결과: {}", updatedBoard.getId(), updateResponse.result());
        } catch (ElasticsearchException e) {
            if (e.status() == 404) {
                log.warn("Elasticsearch 에서 문서를 찾을 수 없습니다. 새로 생성합니다: {}", updatedBoard.getId());
                saveToElasticsearch(updatedBoard);
            } else {
                log.error("Elasticsearch 업데이트 실패: {}", updatedBoard.getId(), e);
            }
        } catch (IOException e) {
            log.error("Elasticsearch 업데이트 중 예외 발생: {}", updatedBoard.getId(), e);
        }
    }

    // 각 게시판에서 필터, 정렬, 검색 등등을 하나로 묶어 통합적인 로직, Criteria 동적쿼리 API 를 사용
    public Page<BoardResponse> listAllByBoardTypeWithSort(int page, int size, String boardType,
                                                          String sortBy, String order,
                                                          String status, String enumFilter, String search) {
        if (sortBy == null || sortBy.isEmpty()) {
            sortBy = "createdAt";
        }
        if (order == null || order.isEmpty()) {
            order = "DESC";
        }
        BoardType type = BoardType.fromString(boardType);

        Pageable pageable = PageRequest.of(page - 1, size);
        Status statusEnum = (status != null && !status.isEmpty()) ? Status.valueOf(status.toUpperCase()) : null;

        Page<Object[]> resultPage = customBoardRepository.findAllWithDynamicFilters(type, statusEnum, sortBy, order, enumFilter, search, pageable);

        // Object[]를 BoardResponse 로 변환
        List<BoardResponse> boardResponses = resultPage.getContent().stream()
                .map(objects -> {
                    Board board = (Board) objects[0];  // Board 엔티티
                    int commentCnt = ((Long) objects[1]).intValue();  // 댓글 개수
                    int likeCnt = ((Long) objects[2]).intValue();  // 좋아요 개수
                    int dislikeCnt = ((Integer) objects[3]).intValue();  // 조회수 개수

                    return BoardResponse.of(board, commentCnt, likeCnt, dislikeCnt);  // BoardResponse 반환
                })
                .collect(Collectors.toList());
        return new PageImpl<>(boardResponses, pageable, resultPage.getTotalElements());
    }


    // 단순 조회수 올리기 서비스
    public Boolean listOneByIdCheck(long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("해당 글을 찾을 수 없습니다."));

        increaseViewCnt(board); // 조회수 증가
        return true;
    }

    // 각 게시판 별 단일 글을 불러오는 서비스
    public BoardResponse listOneById(long id) {
        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("해당 글을 찾을 수 없습니다."));

        // 댓글 수 및 작성자 글 수 가져오기
        int commentCnt = commentRepository.countByBoardId(id);
        int postCntByUser = (int) boardRepository.countByUserUserKey(board.getUser().getUserKey());

        // 게시판 타입에 따라 적절한 응답 생성
        return switch (board.getBoardType()) {
            case CODING -> {
                CodingBoard codingBoard = (CodingBoard) board;
                yield BoardResponse.ofOneCodingPost(codingBoard, postCntByUser, commentCnt, codingBoard.getLikeCnt(), codingBoard.getDislikeCnt());
            }
            case COURSE -> {
                CourseBoard courseBoard = (CourseBoard) board;
                yield BoardResponse.ofOneCoursePost(courseBoard, postCntByUser, commentCnt, courseBoard.getLikeCnt(), courseBoard.getDislikeCnt());
            }
            case STUDY -> {
                StudyBoard studyBoard = (StudyBoard) board;
                yield BoardResponse.ofOneStudyPost(studyBoard, postCntByUser, commentCnt, studyBoard.getLikeCnt(), studyBoard.getDislikeCnt());
            }
            case TEAM -> {
                TeamBoard teamBoard = (TeamBoard) board;
                yield BoardResponse.ofOneTeamPost(teamBoard, postCntByUser, commentCnt, teamBoard.getLikeCnt(), teamBoard.getDislikeCnt());
            }
        };
    }

    // 각 게시판 별 조회수 증가값 저장
    private void increaseViewCnt(Board board) {
        board.setViewCnt(board.getViewCnt() + 1);
        if (board instanceof CodingBoard) {
            codingBoardRepository.save((CodingBoard) board);
        } else if (board instanceof CourseBoard) {
            courseBoardRepository.save((CourseBoard) board);
        } else if (board instanceof StudyBoard) {
            studyBoardRepository.save((StudyBoard) board);
        } else if (board instanceof TeamBoard) {
            teamBoardRepository.save((TeamBoard) board);
        }
    }

    // 게시글 접근시 게시글내 해당하는 댓글도 같이 통신
    public Page<CommentResponse> listComment(Long boardId, int page, int size, String sortBy, String order) {
        // 정렬시 기본값 설정, 페이지에 처음 접근할때
        if (sortBy == null || sortBy.isEmpty()) {
            sortBy = "createdAt";  // 기본적으로 최신순
        }
        if (order == null || order.isEmpty()) {
            order = "ASC";  // 기본적으로 오름차순
        }
        Sort sort = Sort.by(Sort.Direction.fromString(order), sortBy);
        Pageable pageable = PageRequest.of(page - 1, size, sort);
        Page<Comment> comments = commentRepository.findByBoardId(boardId, pageable);
        return comments.map(CommentResponse::ofAllComment);
    }

    // 게시글 내 댓글 생성
    public Boolean addComment(CommentRequest commentRequest) {
        Long userKey = SecurityUtil.getCurrentUserIdOrThrow();
        log.info("객체를 통해 들어온 BoardId값 {}", commentRequest.getBoardId());
        log.info("검증을 통해 들어온 userKey {}", userKey);
        User user = userRepository.findById(userKey)
                .orElseThrow(() -> new EntityNotFoundException("해당 유저를 찾을 수 없습니다."));
        Board board = boardRepository.findById(commentRequest.getBoardId())
                .orElseThrow(() -> new EntityNotFoundException("해당 게시글을 찾을 수 없습니다 "));
        log.info("Repository 검증 후 UserKey: {} 와 BoardId: {}", user, board);
        Comment comment = commentRequest.toAddComment(user, board);
        commentRepository.save(comment);
        return true;
    }

    // 게시글 내 댓글 수정
    public Boolean modifyComment(CommentRequest commentRequest) {
        Long userKey = SecurityUtil.getCurrentUserIdOrThrow();
        User user = userRepository.findById(userKey)
                .orElseThrow(() -> new EntityNotFoundException("해당 유저를 찾을 수 없습니다."));
        Board board = boardRepository.findById(commentRequest.getBoardId())
                .orElseThrow(() -> new EntityNotFoundException("해당 게시글을 찾을 수 없습니다 "));
        Comment existingComment = commentRepository.findById(commentRequest.getCommentId())
                .orElseThrow(() -> new EntityNotFoundException("해당 댓글을 찾을 수 없습니다."));
        if (!user.getUserKey().equals(existingComment.getUser().getUserKey())) {
            throw new AccessDeniedException("해당 유저는 댓글을 수정 할 권한이 없습니다.");
        }
        // 기존에 존재하는 데이터와 비교해, 바뀐 값이면 수정, 아니면 기존의 데이터 사용
        Comment comment = commentRequest.toUpdateComment(user, board, existingComment);
        commentRepository.save(comment);
        return true;
    }

    // 게시글 내 댓글 삭제 구현
    public Boolean deleteComment(Long id) {
        Long userKey = SecurityUtil.getCurrentUserIdOrThrow();
        User user = userRepository.findById(userKey)
                .orElseThrow(() -> new EntityNotFoundException("해당 유저를 찾을 수 없습니다."));
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("해당 댓글을 찾을 수 없습니다."));
        if (!comment.getUser().getUserId().equals(user.getUserId())) {
            throw new AccessDeniedException("해당 댓글을 삭제할 권한이 없습니다.");
        }
        commentRepository.deleteById(id);
        return true;
        }

    public void toggleReaction(Long boardId, Long userId, Reaction reactionType) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new EntityNotFoundException("해당 게시글을 찾을 수 없습니다."));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("해당 유저를 찾을 수 없습니다."));

        Optional<BoardReaction> existingReaction = boardReactionRepository.findByBoardAndUser(board, user);

        if (existingReaction.isPresent()) {
            BoardReaction reaction = existingReaction.get();
            if (reaction.getReaction() == reactionType) {
                // 같은 반응을 다시 누르면 반응 삭제
                boardReactionRepository.delete(reaction);
                board.getBoardReactions().remove(reaction);
            } else {
                // 다른 반응을 클릭한 경우 (예: 좋아요 -> 싫어요)
                reaction.setReaction(reactionType);
                boardReactionRepository.save(reaction);  // 반응 수정
            }
        } else {
            // 새로운 반응 추가
            BoardReaction newReaction = BoardReaction.builder()
                    .board(board)
                    .user(user)
                    .reaction(reactionType)
                    .build();
            board.getBoardReactions().add(newReaction);
            boardReactionRepository.save(newReaction);  // 새 반응 저장
        }

        // 좋아요/싫어요 수 갱신
        updateLikeDislikeCounts(board);  // 이 부분에서 중복 호출을 방지하려면
        // 반응을 수정한 후에 다시 카운트를 업데이트해야 합니다.

        // 게시글 상태를 반영
        boardRepository.save(board);  // 반영된 결과를 DB에 저장
    }

    // 좋아요/싫어요 수 갱신
    private void updateLikeDislikeCounts(Board board) {
        // 좋아요와 싫어요 카운트를 갱신
        int likeCount = (int) board.getBoardReactions().stream().filter(reaction -> reaction.getReaction() == Reaction.LIKE).count();
        int dislikeCount = (int) board.getBoardReactions().stream().filter(reaction -> reaction.getReaction() == Reaction.DISLIKE).count();

        // 게시글의 좋아요/싫어요 수 업데이트
        board.setLikeCnt(likeCount);
        board.setDislikeCnt(dislikeCount);
    }


    // 사용자 좋아요 싫어요 클릭시 확인 Status 구현
    public BoardReactionResponse getReactionStatus(Long boardId, Long userId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new EntityNotFoundException("해당 게시글을 찾을 수 없습니다."));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("해당 유저를 찾을 수 없습니다."));

        Reaction userReaction = board.getUserReaction(user);
        int likeCnt = board.getLikeCnt();
        int dislikeCnt = board.getDislikeCnt();


        return new BoardReactionResponse(userReaction, likeCnt, dislikeCnt);
    }
    // Top Writer 10명 사이드바 구현 JPQL 사용하여 복합 쿼리 생성 list 0 번에유저, 1번에 글작성 횟수
    public List<BoardResponse> getTopWriterBoard() {
        // Pageable 사용해 0페이지 10개 제한 (10명)
        Pageable topTen = PageRequest.of(0, 10);
        // Repository JPQL 결과 반환후에 List 안에 결과 할당 (닉네임, 프로필 사진, 글 생성 갯수)
        List<Object[]> results = boardRepository.findTopUsersByPostCount(topTen);

        return results.stream()
                .map(result -> BoardResponse.ofTopWriterBoard(
                        ((Long) result[0]).intValue(), // UserKey
                        (String) result[1],         // 닉네임
                        (String) result[2],         // 프로필 사진
                        ((Long) result[3]).intValue() // 게시글 개수
                ))
                .collect(Collectors.toList());
    }

    // 주간 인기글 로직 JPQL 사용해 복합쿼리 생성 List 0 번에 게시글, 1번에 프로필사진, 2번에 유저 닉네임
    public List<BoardResponse> getWeeklyPopularPost() {
        Pageable topFive = PageRequest.of(0, 5);

        // 저번주 월요일과 일요일 LocalDateTime 으로 변환
        LocalDateTime startDate = WeeklyTimeCalculator.getStartOfLastWeek();
        LocalDateTime endDate = WeeklyTimeCalculator.getEndOfLastWeek();

        List<Object[]> results = boardRepository.findWeeklyPopularPosts(startDate, endDate, topFive);

        return results.stream()
                .map(result -> BoardResponse.ofWeeklyPopularPost(
                        (Board) result[0],           // 게시글 제목, 내용
                        (String) result[1],          // 닉네임
                        (String) result[2],           // 프로필 사진 URL
                        (int) result[3],                // 조회수
                        (int) result[4],                // 댓글
                        (int) result[5]                 // 좋아요
                ))
                .collect(Collectors.toList());
    }

    public List<BoardResponse> getSimilarPost(Long boardId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new EntityNotFoundException("게시글을 찾을 수 없습니다."));
        try {
            String title = board.getTitle();
            String content = board.getContent();
            log.info("제목과 내용 전달 값: {}, {}", title, content);

            SearchRequest searchRequest = SearchRequest.of(s -> s.index("board_index")
                    .query(q -> q
                            .bool(b -> b
                                    .should(sh -> sh
                                            .match(m -> m
                                                    .field("title")
                                                    .query(title)
                                                    .fuzziness("AUTO"))
                                    )
                                    .should(sh -> sh
                                            .match(m -> m
                                                    .field("content")
                                                    .query(content)
                                                    .fuzziness("AUTO"))
                                    )
                                    .mustNot(mn -> mn
                                            .term(t -> t
                                                    .field("boardId")
                                                    .value(boardId)))
                            )
                    )
                    .size(5));

            log.info("Board Id 를 참조해 게시글 데이터 파싱: {}", searchRequest);

            SearchResponse<Board> response = elasticsearchClient.search(searchRequest, Board.class);
            log.info("엘라스틱 서치 Match 를 통해 나온 유사글 5개 결과 값: {}", response);

            List<Board> similarBoards = response.hits().hits().stream().map(hit -> hit.source()).collect(Collectors.toList());

            return similarBoards.stream()
                    .map(similarBoard -> {
                        int commentCnt = commentRepository.countCommentsByBoardId(similarBoard.getId());
                        int likeCnt = boardReactionRepository.countLikesByBoardId(similarBoard.getId());
                        int viewCnt = boardRepository.countViewsByBoardId(similarBoard.getId());
                        return BoardResponse.ofSimilarPost(similarBoard, viewCnt, commentCnt, likeCnt);
                    })
                    .collect(Collectors.toList());
        } catch (IOException ex) {
            throw new ElasticException("엘라스틱 서치 관련 에러 발생");
        }
    }

    // 상대방이 쓴 글 목록 확인 (글 전체 확인 가능)
    public Page<BoardResponse> listOthersPost(Long userId, int page, int size, String sortBy, String order) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("해당 유저를 찾을 수 없습니다."));

        // 정렬 기준이 null 이거나 비어있으면 기본값 설정
        if (sortBy == null || sortBy.isEmpty()) {
            sortBy = "createdAt";  // 기본적으로 최신순
        }
        if (order == null || order.isEmpty()) {
            order = "DESC";  // 기본적으로 내림차순
        }

        Sort sort = Sort.by(Sort.Direction.fromString(order), sortBy);
        Pageable pageable = PageRequest.of(page - 1, size, sort);

        // 유저별 게시글 목록 가져오기
        Page<Board> boards = boardRepository.findByUserKey(user.getUserKey(), pageable);


        // 게시글 목록과 관련된 정보(commentCnt, likeCnt, dislikeCnt)를 가져와서 변환
        return boards.map(board -> {
            int commentCnt = commentRepository.countCommentsByBoardId(board.getId());
            int likeCnt = boardReactionRepository.countLikesByBoardId(board.getId());
            int dislikeCnt = boardReactionRepository.countDislikesByBoardId(board.getId());
            return BoardResponse.ofPost(board, commentCnt, likeCnt, dislikeCnt);
        });
    }

    // 상대방 프로필 검색 (포스트 갯수 와 자기소개, url 등등 확인 가능)
    public UserResponse listOthersProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("해당 유저를 찾을 수 없습니다"));
        int postCntByUser = (int) boardRepository.countByUserUserKey(user.getUserKey());
        return UserResponse.ofOtherUserProfile(user, postCntByUser);
    }
}
