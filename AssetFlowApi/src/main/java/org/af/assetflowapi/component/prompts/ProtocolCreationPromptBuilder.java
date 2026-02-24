package org.af.assetflowapi.component.prompts;

import lombok.AllArgsConstructor;
import org.af.assetflowapi.data.model.Organization;
import org.af.assetflowapi.data.model.User;
import org.af.assetflowapi.repository.OrganizationRepository;
import org.af.assetflowapi.repository.UserRepository;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class ProtocolCreationPromptBuilder {

    private final OrganizationRepository orgRepo;
    private final UserRepository employeeRepo;
    public String buildPrompt(Long organizationId, Long employeeId, String assetsBlock) {
        Organization org = orgRepo.findById(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Organization with id " + organizationId + " not found"));
        User employee = employeeRepo.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("User with id " + employeeId + " not found"));
        return String.format("""
You are an enterprise legal document generator.

Your task is to generate a formal "Asset Handover Protocol".

STRICT RULES:
- Use ONLY the data provided below.
- Do NOT invent, infer, or add information.
- Auto-populate all fields using the data.
- If data is missing, leave a blank line or placeholder.
- Output ONLY the final document text.
- No explanations, no markdown, no JSON, no comments.

====================
DOCUMENT STRUCTURE (MANDATORY)
====================

The document MUST contain the following sections in this exact order:

ASSET HANDOVER PROTOCOL
I. Parties
II. Subject of Handover
III. Terms and Conditions
IV. Signatures

====================
DATA
====================

Organization:
- Name: %s
- Representative: %s

User:
- Full Name: %s

Assets:
%s

====================
ASSET TABLE RULES (MANDATORY)
====================

- Render ALL assets in a table under section "II. Subject of Handover".
- The table MUST have EXACTLY these columns and order:

| No | Type | Brand | Model | Asset Tag | Status |

- Each asset represents ONE row.
- Do NOT skip assets.
- Do NOT merge rows.
- If there are no assets, render the table with empty rows.

====================
TERMS AND CONDITIONS (FIXED TEXT)
====================

1. The assets are provided for business use only and remain the property of the Organization.
2. The Recipient is responsible for proper use and safekeeping of the assets.
3. Upon termination of employment or upon request, the assets must be returned in good condition, normal wear and tear accepted.
4. Any damage caused by the Recipient shall be compensated in accordance with internal company policies.
""",
                org.getOrganizationName(),
                org.getLeader().getFullName(),
                employee.getFullName(),
                (assetsBlock == null || assetsBlock.isBlank())
                        ? "- NONE"
                        : assetsBlock
        );
    }
}
