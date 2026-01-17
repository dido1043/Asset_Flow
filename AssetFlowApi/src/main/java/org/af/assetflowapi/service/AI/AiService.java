package org.af.assetflowapi.service.AI;

import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class AiService {

    private final HttpClient httpClient = HttpClient.newHttpClient();

    public String generateTextCompletion(String prompt) {

        String jsonRequest =
                "{ \"model\": \"gpt-oss:20b-cloud\", " +
                        "\"prompt\": \"" + prompt + "\", " +
                        "\"stream\": false }";



        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:11434/api/generate"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonRequest))
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return response.body();
        } catch (IOException e) {
            throw new RuntimeException(e);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
}
