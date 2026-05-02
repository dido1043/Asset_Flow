package org.af.assetflowapi.controller;

import lombok.AllArgsConstructor;
import org.af.assetflowapi.data.dto.AI.AiResponseDto;
import org.af.assetflowapi.service.AI.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ai")
@AllArgsConstructor
public class AIController {
    private final AiService aiService;

    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    @PostMapping("/generate")
    public ResponseEntity<AiResponseDto> generateContent(@RequestParam String prompt) {
        return ResponseEntity.ok(aiService.generateTextCompletion(prompt));
    }
}
