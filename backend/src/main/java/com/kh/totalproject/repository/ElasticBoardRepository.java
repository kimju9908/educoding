package com.kh.totalproject.repository;

import com.kh.totalproject.dto.request.ElasticBoardRequest;
import org.springframework.data.elasticsearch.repository.ElasticsearchRepository;

public interface ElasticBoardRepository extends ElasticsearchRepository<ElasticBoardRequest, Long> {

}
