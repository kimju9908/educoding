package com.kh.totalproject.service;

import com.kh.totalproject.entity.ExamData;
import com.opencsv.CSVReader;
import com.opencsv.exceptions.CsvValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.ByteArrayInputStream;
import java.io.BufferedReader;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ExamDataService {

    // 숫자인지 확인하는 메서드
    private boolean isNumeric(String str) {
        return str != null && str.matches("-?\\d+");
    }

    public List<ExamData> readCsv(InputStreamReader reader) throws IOException, CsvValidationException {
        List<ExamData> examDataList = new ArrayList<>();

        try (BufferedReader bufferedReader = new BufferedReader(reader)) {
            // CSV 파일의 내용을 먼저 처리하여 인용 부호가 빠진 부분을 수정
            StringBuilder cleanedData = new StringBuilder();
            String line;
            while ((line = bufferedReader.readLine()) != null) {
                // 잘못된 종료된 인용 부호 수정: 만약 마지막에 따옴표가 없으면 추가
                if (line.contains("\"") && !line.endsWith("\"")) {
                    line += "\"";  // 끝에 인용 부호 추가
                }
                cleanedData.append(line).append("\n");
            }

            // 수정된 데이터를 바이트 배열로 변환 후 ByteArrayInputStream으로 감싸기
            try (CSVReader csvReader = new CSVReader(new InputStreamReader(new ByteArrayInputStream(cleanedData.toString().getBytes())))) {
                String[] row;
                csvReader.skip(1);  // 첫 번째 줄(헤더) 건너뛰기

                while ((row = csvReader.readNext()) != null) {
                    if (row.length < 12) {  // 데이터가 부족한 경우 건너뛰기
                        log.warn("Invalid CSV row detected (less than 12 fields): {}", (Object) row);
                        continue;
                    }

                    // 숫자 검증
                    if (!isNumeric(row[1]) || !isNumeric(row[2]) || !isNumeric(row[4])) {
                        log.warn("Invalid number format in row: {}", (Object) row);
                        continue;
                    }

                    ExamData examData = new ExamData();
                    examData.setTest(row[0]);
                    examData.setDate(Integer.parseInt(row[1]));
                    examData.setSnumber(Integer.parseInt(row[2]));
                    examData.setSname(row[3]);
                    examData.setQnumber(Integer.parseInt(row[4]));
                    examData.setQname1(row[5]);
                    examData.setQname2(row[6]);
                    examData.setExample1(row[7]);
                    examData.setExample2(row[8]);
                    examData.setExample3(row[9]);
                    examData.setExample4(row[10]);
                    examData.setAnswer(row[11]);
                    examData.setExplain(row.length > 12 ? row[12] : "");  // 12번 이후 필드는 선택사항

                    examDataList.add(examData);
                }
            }
        } catch (CsvValidationException e) {
            log.error("CSV validation error: {}", e.getMessage(), e);
            throw e;  // 예외를 다시 던져서 호출자에서 처리할 수 있게
        } catch (IOException e) {
            log.error("IOException occurred while reading CSV file: {}", e.getMessage(), e);
            throw e;
        }

        return examDataList;
    }
}
