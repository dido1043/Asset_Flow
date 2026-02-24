package org.af.assetflowapi.controller;

import org.af.assetflowapi.data.dto.AI.AiResponseDto;
import org.af.assetflowapi.service.AI.AiService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AIControllerTest {

    MockMvc mockMvc;

    @Mock
    AiService aiService;

    @InjectMocks
    AIController aiController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(aiController).build();
    }

    @Test
    void generateContent_returnsDto() throws Exception {
        AiResponseDto dto = new AiResponseDto();
        dto.setResponse("hello world");
        when(aiService.generateTextCompletion(anyString())).thenReturn(dto);

        mockMvc.perform(post("/ai/generate").param("prompt", "hi").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.response").value("hello world"));
    }
}
