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
You are a Bulgarian enterprise legal document generator.

Your task is to generate a formal "ПРОТОКОЛ ЗА ПРЕДАВАНЕ НА АКТИВИ" in Bulgarian.

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

The document MUST contain the following sections in this exact order and in Bulgarian:

ПРОТОКОЛ ЗА ПРЕДАВАНЕ НА АКТИВИ
I. Страни
II. Предмет на предаване
III. Условия и разпоредби
IV. Подписи

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
ASSET RULES (MANDATORY)
====================

- Render ALL assets under section "II. Предмет на предаване".
- First, add ONE example line with the format below, without numbering:
<Вид> : марка: <Марка> - модел: <Модел> - Инвентарен номер: <Номер>

- Then list each asset on its own numbered line using the same format as the example:
1. <Вид> : марка: <Марка> - модел: <Модел> - Инвентарен номер: <Номер>
2. ...
- Do NOT skip assets.

====================
TERMS AND CONDITIONS (FIXED TEXT)
====================

1. Активите се предоставят единствено за служебни цели и остават собственост на Организацията.
2. Получателят отговаря за правилната употреба и съхранение на активите.
3. При прекратяване на трудовото правоотношение или при поискване, активите се връщат в добро състояние, с допустимо нормално износване.
4. Всяка щета, причинена от Получателя, се обезщетява съгласно вътрешните политики на Организацията.

====================
SIGNATURES (MANDATORY)
====================

- In section "IV. Подписи", list signatures WITHOUT numbering.
- Use one line per signer in the format:
<Име и фамилия>: .................................... (подпис)
- Include the Organization representative and the User.

[IMPORTANT: Generate the full document in formal Bulgarian legal style, for Bulgarian jurisdiction, including headings, labels, and table content.]
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