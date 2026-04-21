package org.af.assetflowapi.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.af.assetflowapi.data.enums.ProtocolType;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ProtocolService {
    private static final ObjectMapper CONTENT_MAPPER = new ObjectMapper();

    private final OrganizationRepository organizationRepository;
    private final ProtocolRepository protocolRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProtocolCreationPromptBuilder promptBuilder;

    private final AiService aiService;

    public List<ProtocolDto> getProtocolsByEmployee(Long employeeId) {
        return protocolRepository.findByEmployeeId(employeeId).stream()
                .map(protocol -> {
                    ProtocolDto dto = new ProtocolDto();
                    dto.setId(protocol.getId());
                    dto.setProtocolUri(protocol.getProtocolUri());
                    dto.setOrganizationId(protocol.getOrganization() != null ? protocol.getOrganization().getId() : null);
                    dto.setContent(normalizeProtocolContent(protocol.getContent()));
                    if (protocol.getEmployee() != null && protocol.getEmployee().getId() != null) {
                        dto.setEmployeeId(protocol.getEmployee().getId());
                    }
                    return dto;
                })
                .toList();
    }
    public ProtocolDto getProtocolById(Long protocolId) {
        Protocol protocol = protocolRepository.findById(protocolId)
                .orElseThrow(() -> new IllegalArgumentException("Protocol with id " + protocolId + " not found"));

        ProtocolDto result = new ProtocolDto();
        result.setId(protocol.getId());
        result.setProtocolUri(protocol.getProtocolUri());
        result.setOrganizationId(protocol.getOrganization() != null ? protocol.getOrganization().getId() : null);
        result.setContent(normalizeProtocolContent(protocol.getContent()));
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

        Map<String, String> uri = generateProtocolPdfUri(organization, user, ProtocolType.ASSET_ASSIGNMENT);

        Protocol protocol = new Protocol();
        protocol.setOrganization(organization);
        protocol.setEmployee(user);
        protocol.setProtocolUri(uri.keySet().stream().findFirst().orElse(null)); // Store the filename as the protocol URI
        protocol.setContent(uri.values().stream().findFirst().orElse("")); // Store the generated content in the protocol
        protocol.setType(ProtocolType.ASSET_ASSIGNMENT);
        //TODO: For testing
        Protocol saved = protocolRepository.save(protocol);

        ProtocolDto result = new ProtocolDto();
        result.setId(saved.getId());
        result.setProtocolUri(saved.getProtocolUri());
        result.setOrganizationId(saved.getOrganization() != null ? saved.getOrganization().getId() : null);
        result.setContent(normalizeProtocolContent(saved.getContent()));
        result.setType(saved.getType() != null ? saved.getType().name() : null);
        if (saved.getEmployee() != null && saved.getEmployee().getId() != null) {
            result.setEmployeeId(saved.getEmployee().getId());
        }

        return result;
    }
    public ProtocolDto createReturningAssetProtocol(Long organizationId, Long userId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Organization with id " + organizationId + " not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User with id " + userId + " not found"));

        if (!organization.getEmployees().contains(user)) {
            throw new IllegalArgumentException("User with id " + userId +
                    " does not belong to organization with id " + organization.getId());
        }

        Map<String, String> uri = generateProtocolPdfUri(organization, user, ProtocolType.ASSET_RETURN);

        Protocol protocol = new Protocol();
        protocol.setOrganization(organization);
        protocol.setEmployee(user);
        protocol.setProtocolUri(uri.keySet().stream().findFirst().orElse(null)); // Store the filename as the protocol URI
        protocol.setContent(uri.values().stream().findFirst().orElse("")); // Store the generated content in the protocol
        protocol.setType(ProtocolType.ASSET_RETURN);
        //TODO: For testing
        Protocol saved = protocolRepository.save(protocol);

        ProtocolDto result = new ProtocolDto();
        result.setId(saved.getId());
        result.setProtocolUri(saved.getProtocolUri());
        result.setOrganizationId(saved.getOrganization() != null ? saved.getOrganization().getId() : null);
        result.setContent(normalizeProtocolContent(saved.getContent()));
        result.setType(saved.getType() != null ? saved.getType().name() : null);
        if (saved.getEmployee() != null && saved.getEmployee().getId() != null) {
            result.setEmployeeId(saved.getEmployee().getId());
        }

        return result;
    }
    public List<ProtocolDto> getProtocolsByOrganization(Long organizationId) {
        return protocolRepository.findByOrganizationId(organizationId).stream()
                .map(protocol -> {
                    ProtocolDto dto = new ProtocolDto();
                    dto.setId(protocol.getId());
                    dto.setProtocolUri(protocol.getProtocolUri());
                    dto.setOrganizationId(protocol.getOrganization() != null ? protocol.getOrganization().getId() : null);
                    dto.setContent(normalizeProtocolContent(protocol.getContent()));
                    if (protocol.getEmployee() != null && protocol.getEmployee().getId() != null) {
                        dto.setEmployeeId(protocol.getEmployee().getId());
                    }
                    return dto;
                })
                .toList();
    }

    public Map<String, String> generateProtocolPdfUri(Organization organization, User user, ProtocolType type) {
        Path targetDir = Path.of("target", "protocols");
        try {
            Files.createDirectories(targetDir);
        } catch (IOException e) {
            throw new RuntimeException("Failed to create protocol directory", e);
        }

        String protocolNumber = "PROT-" + organization.getId() + "-" + user.getId() + "-" + System.currentTimeMillis();
        String filename = "protocol_" + protocolNumber + ".pdf";
        Path filePath = targetDir.resolve(filename);

        List<Assignment> userAssignments = user.getAssignments();

        String assetsBlock = userAssetsToString(userAssignments);

        String prompt = type == ProtocolType.ASSET_ASSIGNMENT ? 
            promptBuilder.buildPrompt(organization.getId(), user.getId(), assetsBlock) : 
            promptBuilder.buildPromptForReturningAssignments(organization.getId(), user.getId(), assetsBlock);

        AiResponseDto aiDto = aiService.generateTextCompletion(prompt);
        String content = normalizeProtocolContent(aiDto.getResponse());

        createDocumentWithContent(content, filePath);

        Map<String, String> result = new HashMap<String, String>();
        result.put(filename, content);
        // Store only the filename, not the full file system path
        return result;
    }
    public ProtocolDto editProtocolText(Long protocolId, String content){
        Protocol protocol = protocolRepository.findById(protocolId)
                .orElseThrow(() -> new IllegalArgumentException("Protocol with id " + protocolId + " not found"));

        String currentFilename = protocol.getProtocolUri();
        if (currentFilename == null || currentFilename.isBlank()) {
            throw new IllegalStateException("Protocol with id " + protocolId + " does not have a valid filename");
        }

        Path targetDir = Path.of("target", "protocols");
        Path filePath = targetDir.resolve(currentFilename);

        try {
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete old protocol PDF", e);
        }

        String normalizedContent = normalizeProtocolContent(content);

        createDocumentWithContent(normalizedContent, filePath);

        protocol.setContent(normalizedContent);
        Protocol updatedProtocol = protocolRepository.save(protocol);

        ProtocolDto result = new ProtocolDto();
        result.setId(updatedProtocol.getId());
        result.setProtocolUri(updatedProtocol.getProtocolUri());
        result.setOrganizationId(updatedProtocol.getOrganization() != null ? updatedProtocol.getOrganization().getId() : null);
        result.setContent(normalizeProtocolContent(updatedProtocol.getContent()));
        if (updatedProtocol.getEmployee() != null && updatedProtocol.getEmployee().getId() != null) {
            result.setEmployeeId(updatedProtocol.getEmployee().getId());
        }

        return result;
    }

    private void createDocumentWithContent(String content, Path filePath) {
        try(PdfWriter writer = new PdfWriter(filePath.toString());
            PdfDocument pdf = new PdfDocument(writer);
            Document doc = new Document(pdf)) {

            PdfFont unicodeFont = getUnicodePdfFont();
            doc.setFont(unicodeFont);

            content = normalizeProtocolContent(content);

            String[] lines = content.split("\n", -1);
            for (String line : lines) {
                Paragraph p = new Paragraph(line.isEmpty() ? "\u00A0" : line);
                doc.add(p);
            }
        }catch (IOException e) {
            throw new RuntimeException("Failed to create protocol PDF", e);
        }
    }

    static String normalizeProtocolContent(String rawContent) {
        if (rawContent == null) {
            return "";
        }

        String content = normalizeLineEndings(rawContent);
        String trimmed = content.trim();

        if (trimmed.length() >= 2 && trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
            try {
                content = CONTENT_MAPPER.readValue(trimmed, String.class);
            } catch (JsonProcessingException ignored) {
                content = trimmed.substring(1, trimmed.length() - 1);
            }
        }

        content = normalizeLineEndings(content);

        while (content.contains("\\\\n") || content.contains("\\\\r")) {
            content = content
                    .replace("\\\\n", "\\n")
                    .replace("\\\\r", "\\r");
        }

        content = content
                .replace("\\r\\n", "\n")
                .replace("\\n", "\n")
                .replace("\\r", "\n")
                .replace("\\t", "\t")
                .replace("\\\"", "\"")
                .replace("\\\\", "\\");

        return repairBareNewlineMarkers(content);
    }

    private static String normalizeLineEndings(String content) {
        return content.replace("\r\n", "\n").replace('\r', '\n');
    }

    private static String repairBareNewlineMarkers(String content) {
        return content
                .replaceAll("n(?=(?:[IVXLCDM]+|\\d+)\\.\\s)", "\n")
                .replaceAll("([.)])n(?=[^\\n:]{2,80}:\\s*\\.{4,})", "$1\n");
    }

    public byte[] downloadProtocol(Long protocolId) {
        Protocol protocol = protocolRepository.findById(protocolId)
                .orElseThrow(() -> new IllegalArgumentException("Protocol with id " + protocolId + " not found"));
        String filename = protocol.getProtocolUri();

        if (filename == null || filename.isBlank()) {
            throw new IllegalStateException("Protocol with id " + protocolId + " does not have a valid filename");
        }

        try {
            Path filePath = Path.of("target", "protocols", filename);
            
            // Check if file exists
            if (!Files.exists(filePath)) {
                throw new IOException("File does not exist at path: " + filePath.toAbsolutePath());
            }
            
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read protocol PDF: " + filename + ". Error: " + e.getMessage(), e);
        }
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
                "- %s | Brand: %s | Model: %s | Asset Tag: %s ",
                            p.getProductType(),
                            p.getProductBrand(),
                            p.getProductModel(),
                p.getAssetTag()
                    );
                })
                .collect(Collectors.joining("\n"));
    }

    
    private PdfFont getUnicodePdfFont() {
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

        try {
            return PdfFontFactory.createFont(StandardFonts.HELVETICA);
        } catch (IOException e) {
            throw new RuntimeException("Failed to create any PDF font", e);
        }
    }

    
}
