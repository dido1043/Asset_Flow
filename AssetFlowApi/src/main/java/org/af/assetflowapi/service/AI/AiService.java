package org.af.assetflowapi.service.AI;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.af.assetflowapi.data.dto.AI.AiResponseDto;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class AiService {

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiResponseDto generateTextCompletion(String prompt) {
        try {
            ObjectNode reqNode = objectMapper.createObjectNode();
            reqNode.put("model", "gpt-oss:20b-cloud");
            reqNode.put("prompt", prompt);
            reqNode.put("stream", false);

            String jsonRequest = objectMapper.writeValueAsString(reqNode);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("http://localhost:11434/api/generate"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonRequest))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            // Parse JSON response into DTO and return
            return objectMapper.readValue(response.body(), AiResponseDto.class);
        } catch (IOException e) {
            throw new RuntimeException(e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException(e);
        }
    }

}
