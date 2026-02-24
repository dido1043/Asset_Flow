package org.af.assetflowapi.service;

import com.itextpdf.io.font.FontProgram;
import com.itextpdf.io.font.FontProgramFactory;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import lombok.AllArgsConstructor;
import org.af.assetflowapi.component.prompts.ProtocolCreationPromptBuilder;
import org.af.assetflowapi.data.dto.AI.AiResponseDto;
import org.af.assetflowapi.data.dto.ProtocolDto;
import org.af.assetflowapi.data.model.*;
import org.af.assetflowapi.repository.OrganizationRepository;
import org.af.assetflowapi.repository.ProductRepository;
import org.af.assetflowapi.repository.ProtocolRepository;
import org.af.assetflowapi.repository.UserRepository;
import org.af.assetflowapi.service.AI.AiService;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ProtocolService {
    private final OrganizationRepository organizationRepository;
    private final ProtocolRepository protocolRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProtocolCreationPromptBuilder promptBuilder;

    private final AiService aiService;


    public ProtocolDto getProtocolById(Long protocolId) {
        Protocol protocol = protocolRepository.findById(protocolId)
                .orElseThrow(() -> new IllegalArgumentException("Protocol with id " + protocolId + " not found"));

        ProtocolDto result = new ProtocolDto();
        result.setId(protocol.getId());
        result.setProtocolUri(protocol.getProtocolUri());
        result.setOrganizationId(protocol.getOrganization() != null ? protocol.getOrganization().getId() : null);
        if (protocol.getEmployee() != null && protocol.getEmployee().getId() != null) {
            result.setEmployeeId(protocol.getEmployee().getId());
        }

        return result;
    }
    public ProtocolDto createProtocol(Long organizationId, Long userId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Organization with id " + organizationId + " not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User with id " + userId + " not found"));

        if (!organization.getEmployees().contains(user)) {
            throw new IllegalArgumentException("User with id " + userId +
                    " does not belong to organization with id " + organization.getId());
        }

        String uri = generateProtocolPdfUri(organization, user);

        Protocol protocol = new Protocol();
        protocol.setOrganization(organization);
        protocol.setEmployee(user);
        protocol.setProtocolUri(uri);

        Protocol saved = protocolRepository.save(protocol);

        ProtocolDto result = new ProtocolDto();
        result.setId(saved.getId());
        result.setProtocolUri(saved.getProtocolUri());
        result.setOrganizationId(saved.getOrganization() != null ? saved.getOrganization().getId() : null);
        if (saved.getEmployee() != null && saved.getEmployee().getId() != null) {
            result.setEmployeeId(saved.getEmployee().getId());
        }

        return result;
    }
    //Todo: Add translate to other language
    public String generateProtocolPdfUri(Organization organization, User user) {
        Path targetDir = Path.of("target", "protocols");
        try {
            Files.createDirectories(targetDir);
        } catch (IOException e) {
            throw new RuntimeException("Failed to create protocol directory", e);
        }

        String protocolNumber = "PROT-" + organization.getId() + "-" + user.getId() + "-" + System.currentTimeMillis();
        Path filePath = targetDir.resolve("protocol_" + protocolNumber + ".pdf");

        List<Assignment> userAssignments = user.getAssignments();

        String assetsBlock = userAssetsToString(userAssignments);

        String prompt = promptBuilder.buildPrompt(organization.getId(), user.getId(), assetsBlock);

        AiResponseDto aiDto = aiService.generateTextCompletion(prompt);
        String content = aiDto.getResponse();

        try(PdfWriter writer = new PdfWriter(filePath.toString());
            PdfDocument pdf = new PdfDocument(writer);
            Document doc = new Document(pdf)) {

            // Create or choose a Unicode-capable font. Prefer a bundled font in resources (src/main/resources/fonts/NotoSans-Regular.ttf)
            // If not present, try common system font paths. As a last resort fall back to Helvetica.
            PdfFont unicodeFont = getUnicodePdfFont();
            doc.setFont(unicodeFont);

            if (content == null) content = "";
            String[] lines = content.split("\n");
            for (String line : lines) {
                Paragraph p = new Paragraph(line);
                doc.add(p);
            }
        }catch (IOException e) {
            throw new RuntimeException("Failed to create protocol PDF", e);
        }
        return filePath.toUri().toString();
    }

    private String userAssetsToString(List<Assignment> userAssignments) {
        if (userAssignments == null || userAssignments.isEmpty()) {
            return "No assets assigned.";
        }
        return userAssignments.stream()
                .map(a -> {
                    Long productId = a.getProduct().getId();
                    Product p = productRepository.findById(productId)
                            .orElseThrow(() -> new IllegalArgumentException("Product with id " + productId + " not found"));
                    return String.format(
                            "- %s | Brand: %s | Model: %s | Asset Tag: %s | Status: %s ",
                            p.getProductType(),
                            p.getProductBrand(),
                            p.getProductModel(),
                            p.getAssetTag(),
                            a.getStatus()
                    );
                })
                .collect(Collectors.joining("\n"));
    }

    // Try to find/create a PdfFont that supports Unicode (IDENTITY_H). First check bundled resource, then common system paths.
    private PdfFont getUnicodePdfFont() {
        // Try classpath bundled font: src/main/resources/fonts/NotoSans-Regular.ttf
        try (InputStream is = getClass().getResourceAsStream("/fonts/NotoSans-Regular.ttf")) {
            if (is != null) {
                byte[] bytes = is.readAllBytes();
                try {
                    FontProgram fp = FontProgramFactory.createFont(bytes);
                    return PdfFontFactory.createFont(fp, PdfEncodings.IDENTITY_H);
                } catch (IOException ex) {
                    // fall through to next candidate
                }
            }
        } catch (IOException ignored) {
        }

        // Common font locations on macOS / Linux
        String[] candidates = new String[] {
                "/Library/Fonts/Arial Unicode.ttf",
                "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
                "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
                "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
                "/usr/share/fonts/truetype/freefont/FreeSans.ttf"
        };
        for (String pathStr : candidates) {
            Path p = Path.of(pathStr);
            if (Files.exists(p)) {
                try {
                    return PdfFontFactory.createFont(pathStr, PdfEncodings.IDENTITY_H);
                } catch (IOException ignored) {
                }
            }
        }

        // Last resort: use a standard font (may not render all languages)
        try {
            return PdfFontFactory.createFont(StandardFonts.HELVETICA);
        } catch (IOException e) {
            throw new RuntimeException("Failed to create any PDF font", e);
        }
    }
}
