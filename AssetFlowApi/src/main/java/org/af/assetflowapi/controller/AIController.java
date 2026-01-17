package org.af.assetflowapi.controller;

import lombok.AllArgsConstructor;
import org.af.assetflowapi.service.AI.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ai")
@AllArgsConstructor
public class AIController {
    private final AiService aiService;

    @PostMapping("/generate")
    public ResponseEntity<String> generateContent(@RequestParam String prompt) {
        return ResponseEntity.ok(aiService.generateTextCompletion(prompt));
    }
}
