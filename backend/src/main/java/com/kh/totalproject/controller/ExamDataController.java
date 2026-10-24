package com.kh.totalproject.controller;

import com.kh.totalproject.entity.ExamData;
import com.kh.totalproject.service.ExamDataService;
import com.opencsv.exceptions.CsvValidationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;

import org.springframework.core.io.ClassPathResource;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/exam")
public class ExamDataController {

    @Autowired
    private ExamDataService examDataService;

    @GetMapping("/mock_01")
    public List<ExamData> getExamMockData01() throws IOException, CsvValidationException {
        ClassPathResource resource = new ClassPathResource("csv/exam/mock/mock_01.csv");
        InputStreamReader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
        return examDataService.readCsv(reader);
    }

    @GetMapping("/mock_02")
    public List<ExamData> getExamMockData02() throws IOException, CsvValidationException {
        ClassPathResource resource = new ClassPathResource("csv/exam/mock/mock_02.csv");
        InputStreamReader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
        return examDataService.readCsv(reader);
    }


    @GetMapping("/mock_03")
    public List<ExamData> getExamMockData03() throws IOException, CsvValidationException {
        ClassPathResource resource = new ClassPathResource("csv/exam/mock/mock_03.csv");
        InputStreamReader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
        return examDataService.readCsv(reader);
    }


    @GetMapping("/mock_04")
    public List<ExamData> getExamMockData04() throws IOException, CsvValidationException {
        ClassPathResource resource = new ClassPathResource("csv/exam/mock/mock_04.csv");
        InputStreamReader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
        return examDataService.readCsv(reader);
    }


    @GetMapping("/mock_05")
    public List<ExamData> getExamMockData05() throws IOException, CsvValidationException {
        ClassPathResource resource = new ClassPathResource("csv/exam/mock/mock_05.csv");
        InputStreamReader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
        return examDataService.readCsv(reader);
    }

    @GetMapping("/previous_220424")
    public List<ExamData> getExamPreviousData220424() throws IOException, CsvValidationException {
        ClassPathResource resource = new ClassPathResource("csv/exam/previous/previous_220424.csv");
        InputStreamReader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
        return examDataService.readCsv(reader);
    }

    @GetMapping("/previous_220305")
    public List<ExamData> getExamPreviousData220305() throws IOException, CsvValidationException {
        ClassPathResource resource = new ClassPathResource("csv/exam/previous/previous_220305.csv");
        InputStreamReader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
        return examDataService.readCsv(reader);
    }

    @GetMapping("/previous_210814")
    public List<ExamData> getExamPreviousData210814() throws IOException, CsvValidationException {
        ClassPathResource resource = new ClassPathResource("csv/exam/previous/previous_210814.csv");
        InputStreamReader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
        return examDataService.readCsv(reader);
    }

    @GetMapping("/previous_210515")
    public List<ExamData> getExamPreviousData210515() throws IOException, CsvValidationException {
        ClassPathResource resource = new ClassPathResource("csv/exam/previous/previous_210515.csv");
        InputStreamReader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
        return examDataService.readCsv(reader);
    }

    @GetMapping("/previous_210307")
    public List<ExamData> getExamPreviousData210307() throws IOException, CsvValidationException {
        ClassPathResource resource = new ClassPathResource("csv/exam/previous/previous_210307.csv");
        InputStreamReader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
        return examDataService.readCsv(reader);
    }

    @GetMapping("/previous_200926")
    public List<ExamData> getExamPreviousData200926() throws IOException, CsvValidationException {
        ClassPathResource resource = new ClassPathResource("csv/exam/previous/previous_200926.csv");
        InputStreamReader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
        return examDataService.readCsv(reader);
    }

    @GetMapping("/previous_200822")
    public List<ExamData> getExamPreviousData200822() throws IOException, CsvValidationException {
        ClassPathResource resource = new ClassPathResource("csv/exam/previous/previous_200822.csv");
        InputStreamReader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
        return examDataService.readCsv(reader);
    }

    @GetMapping("/previous_200606")
    public List<ExamData> getExamPreviousData200606() throws IOException, CsvValidationException {
        ClassPathResource resource = new ClassPathResource("csv/exam/previous/previous_200606.csv");
        InputStreamReader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
        return examDataService.readCsv(reader);
    }
}
