package com.kh.totalproject.learning;

import com.kh.totalproject.util.SecurityUtil;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.mockito.Mockito.*;
import static com.kh.totalproject.learning.LearningModels.*;

class LearningPlanControllerTest {
    @Test void unauthenticatedRequestsAreRejectedBeforeQueryingRecords() throws Exception {
        SecurityContextHolder.clearContext();
        var service=mock(LearningPlanService.class);
        var mvc=MockMvcBuilders.standaloneSetup(new LearningPlanController(service))
                .setControllerAdvice(new LearningPlanExceptionHandler()).build();
        mvc.perform(get("/api/learning-path").param("language","java").param("level","PRACTICE").param("goal","BASICS"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/api/learning-path").contentType(MediaType.APPLICATION_JSON)
                .content("{\"language\":\"java\",\"level\":\"PRACTICE\",\"goal\":\"BASICS\"}"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(service);
    }
    @Test void queryAndBodyCannotOverrideAuthenticatedOwner() throws Exception {
        var service=mock(LearningPlanService.class);
        var mvc=MockMvcBuilders.standaloneSetup(new LearningPlanController(service))
                .setControllerAdvice(new LearningPlanExceptionHandler()).build();
        try(var security=mockStatic(SecurityUtil.class)) {
            security.when(SecurityUtil::getCurrentUserIdOrThrow).thenReturn(1L);
            mvc.perform(get("/api/learning-path").param("language","java").param("level","PRACTICE")
                    .param("goal","BASICS").param("userId","999")).andExpect(status().isOk());
            mvc.perform(post("/api/learning-path").contentType(MediaType.APPLICATION_JSON)
                    .content("{\"language\":\"java\",\"level\":\"PRACTICE\",\"goal\":\"BASICS\",\"userId\":999}"))
                    .andExpect(status().isOk());
            verify(service).get(1L,new Profile("java","PRACTICE","BASICS"));
            verify(service).generate(1L,new Profile("java","PRACTICE","BASICS"),false);
        }
    }
}
