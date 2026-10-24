package com.kh.totalproject.util;

import com.kh.totalproject.constant.MentorTag;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Converter(autoApply = true) // 모든 List<MentorTag>에 자동 적용 (선택 사항)
public class MentorTagListConverter implements AttributeConverter<List<MentorTag>, String> {

    private static final String DELIMITER = ","; // 태그 구분자

    @Override
    public String convertToDatabaseColumn(List<MentorTag> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return null; // null 또는 빈 리스트는 null로 저장
        }
        return attribute.stream()
                .map(MentorTag::name) // Enum의 이름을 문자열로 변환
                .collect(Collectors.joining(DELIMITER)); // 구분자로 결합
    }

    @Override
    public List<MentorTag> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return new ArrayList<>();
        }

        try {
            return Arrays.stream(dbData.split(","))
                    .map(String::trim)
                    .map(tag -> MentorTag.valueOf(tag.toUpperCase())) // 대소문자 변환 추가
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid MentorTag value found in DB: " + dbData, e);
        }
    }
}