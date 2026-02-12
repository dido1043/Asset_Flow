package org.af.assetflowapi.component.prompts;

import org.springframework.stereotype.Component;

@Component
public class ProtocolCreationPromptBuilder {
    // Build the protocol prompt text. This is a Spring bean so it can be injected where needed.
    public String buildPrompt(Long organizationId, Long employeeId, String assetsBlock) {
        return String.format("""
        You are an enterprise legal document generator.

        Generate a formal "Asset Handover Protocol" in English.

        Rules:
        - Use ONLY the data below.
        - Auto-populate all fields.
        - Output ONLY the final document text.
        - No explanations, no markdown, no JSON.

        === DATA ===

        Organization:
        Name: %s
        Representative: %s

        User:
        Full Name: %s

        Assets:
        %s
        """,
                // organization.getOrganizationName(),
                "DidGroup Ltd.",
                //organization.getLeader().getFullName(),
                "Deyan Dudunovski",
                //user.getFullName(),
                "Stoyan Stoyanov",
                // Use the provided assetsBlock (caller should pass assembled assets list). If null/empty, keep a placeholder.
                (assetsBlock == null || assetsBlock.isBlank()) ?
                        "- (no assets provided)" : assetsBlock

        );
    }
}
