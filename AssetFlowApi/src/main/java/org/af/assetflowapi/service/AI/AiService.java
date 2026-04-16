package org.af.assetflowapi.service.AI;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.af.assetflowapi.data.dto.AI.AiResponseDto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class AiService {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String ollamaBaseUrl;
    private final String ollamaModel;

    @Autowired
    public AiService(
            @Value("${ai.ollama.base-url:http://localhost:11434}") String ollamaBaseUrl,
            @Value("${ai.ollama.model:tazarov/bg-gpt:latest}") String ollamaModel
    ) {
        this(HttpClient.newHttpClient(), new ObjectMapper(), ollamaBaseUrl, ollamaModel);
    }

    AiService(HttpClient httpClient, ObjectMapper objectMapper, String ollamaBaseUrl, String ollamaModel) {
        this.httpClient = httpClient;
        this.objectMapper = objectMapper;
        this.ollamaBaseUrl = normalizeBaseUrl(ollamaBaseUrl);
        this.ollamaModel = ollamaModel;
    }

    public AiResponseDto generateTextCompletion(String prompt) {
        try {
            ObjectNode reqNode = objectMapper.createObjectNode();
            reqNode.put("model", ollamaModel);
            reqNode.put("prompt", prompt);
            reqNode.put("stream", false);

            String jsonRequest = objectMapper.writeValueAsString(reqNode);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(ollamaBaseUrl + "/api/generate"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonRequest))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw buildUpstreamException(response);
            }

            return objectMapper.readValue(response.body(), AiResponseDto.class);
        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Could not reach Ollama at " + ollamaBaseUrl,
                    e
            );
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Interrupted while waiting for Ollama response",
                    e
            );
        }
    }

    private ResponseStatusException buildUpstreamException(HttpResponse<String> response) {
        String upstreamMessage = extractUpstreamMessage(response.body());
        return new ResponseStatusException(
                HttpStatus.BAD_GATEWAY,
                "Ollama request failed with status " + response.statusCode() + ": " + upstreamMessage
        );
    }

    private String extractUpstreamMessage(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            return "empty response body";
        }

        try {
            JsonNode jsonNode = objectMapper.readTree(responseBody);
            if (jsonNode.hasNonNull("error")) {
                return jsonNode.get("error").asText();
            }
        } catch (IOException ignored) {
        }

        return responseBody.length() > 200 ? responseBody.substring(0, 200) + "..." : responseBody;
    }

    private String normalizeBaseUrl(String baseUrl) {
        if (baseUrl.endsWith("/")) {
            return baseUrl.substring(0, baseUrl.length() - 1);
        }
        return baseUrl;
    }
}
