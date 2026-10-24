package com.kh.totalproject.repository;

import com.kh.totalproject.constant.BoardType;
import com.kh.totalproject.constant.Status;
import com.kh.totalproject.entity.Board;
import com.kh.totalproject.entity.BoardReaction;
import com.kh.totalproject.entity.Comment;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Repository
@NoArgsConstructor
@AllArgsConstructor
public class CustomBoardRepositoryImpl implements CustomBoardRepository {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Page<Object[]> findAllWithDynamicFilters(BoardType type, Status status, String sortBy, String order,
                                                    String enumFilter, String search, Pageable pageable) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Object[]> query = cb.createQuery(Object[].class);
        Root<Board> root = query.from(Board.class);
        Join<Board, Comment> comments = root.join("comments", JoinType.LEFT);
        Join<Board, BoardReaction> reactions = root.join("boardReactions", JoinType.LEFT);  // 좋아요 조인

        // SELECT 절 정의 (Board 엔티티 + 댓글 개수 + 좋아요 개수 + 조회수)
        query.multiselect(root, cb.countDistinct(comments), cb.countDistinct(reactions), root.get("viewCnt"));

        // WHERE 절 정의
        List<Predicate> predicates = new ArrayList<>();

        // boardType에 따라 특정 하위 엔티티만 필터링
        predicates.add(cb.equal(root.get("boardType").as(String.class), type.toString()));  // boardType을 String으로 변환하여 비교

        // status 필터 적용 (courseBoard 제외)
        if (status != null && type != BoardType.COURSE) {
            predicates.add(cb.equal(root.get("status"), status));
        }

        // 추가적인 필터링 조건 처리
        Predicate specPredicate = createSpecification(cb, root, type, enumFilter, search);
        if (specPredicate != null) {
            predicates.add(specPredicate);
        }

        // WHERE 절에 조건 추가
        query.where(predicates.toArray(new Predicate[0]));

        // GROUP BY 추가 (Board별로 댓글 & 좋아요 개수를 COUNT하기 위해)
        query.groupBy(root);

        // ORDER BY 추가 (정렬 조건 적용)
        query.orderBy(createOrder(cb, root, comments, reactions, sortBy, order));

        // 실행 및 페이징 처리
        TypedQuery<Object[]> typedQuery = entityManager.createQuery(query);
        int totalRows = typedQuery.getResultList().size();
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());

        List<Object[]> results = typedQuery.getResultList();

        return new PageImpl<>(results, pageable, totalRows);
    }

    // 동적 필터링 조건을 생성하는 메서드
    private Predicate createSpecification(CriteriaBuilder cb, Root<Board> root, BoardType type, String enumFilter, String search) {
        List<Predicate> predicates = new ArrayList<>();

        // enumFilter가 있으면 필터링
        if (enumFilter != null && !enumFilter.isEmpty()) {
            String fieldName = switch (type) {
                case CODING -> "language";
                case COURSE -> "course";
                case STUDY -> "study";
                case TEAM -> "team";
            };

            // enumFilter를 파싱하여 각 필드에 맞는 Enum을 처리
            String[] filters = enumFilter.split(",");
            Predicate enumPredicate = cb.or(
                    Arrays.stream(filters)
                            .map(filter -> {
                                // 각 enum에 맞게 JSON 배열을 생성하여 필터링
                                String jsonArray = "[\"" + filter + "\"]";
                                return cb.isTrue(cb.function("JSON_CONTAINS", Boolean.class,
                                        root.get(fieldName), cb.literal(jsonArray), cb.literal("$")));
                            })
                            .toArray(Predicate[]::new)
            );
            predicates.add(enumPredicate);
        }

        // search가 있으면 제목이나 내용으로 검색
        if (search != null && !search.isEmpty()) {
            String searchPattern = "%" + search + "%";
            predicates.add(cb.or(
                    cb.like(root.get("title"), searchPattern),
                    cb.like(root.get("content"), searchPattern)
            ));
        }

        // 필터 조건이 없다면 항상 true인 조건을 반환
        return predicates.isEmpty() ? cb.conjunction() : cb.and(predicates.toArray(new Predicate[0]));
    }

    // 동적 정렬 조건을 생성하는 메서드
    private List<Order> createOrder(CriteriaBuilder cb, Root<Board> root, Join<?, Comment> comments, Join<?, BoardReaction> reactions, String sortBy, String order) {
        Sort.Direction direction = "DESC".equalsIgnoreCase(order) ? Sort.Direction.DESC : Sort.Direction.ASC;
        List<Order> orders = new ArrayList<>();

        // 정렬 조건에 따라 order 추가
        if ("commentCnt".equalsIgnoreCase(sortBy)) {
            orders.add(direction == Sort.Direction.DESC ? cb.desc(cb.countDistinct(comments)) : cb.asc(cb.countDistinct(comments)));
        } else if ("likeCnt".equalsIgnoreCase(sortBy)) {
            orders.add(direction == Sort.Direction.DESC ? cb.desc(cb.countDistinct(reactions)) : cb.asc(cb.countDistinct(reactions)));
        } else if ("viewCnt".equalsIgnoreCase(sortBy)) {
            orders.add(direction == Sort.Direction.DESC ? cb.desc(root.get("viewCnt")) : cb.asc(root.get("viewCnt")));
        } else {
            orders.add(direction == Sort.Direction.DESC ? cb.desc(root.get(sortBy)) : cb.asc(root.get(sortBy)));
        }

        return orders;
    }
}

