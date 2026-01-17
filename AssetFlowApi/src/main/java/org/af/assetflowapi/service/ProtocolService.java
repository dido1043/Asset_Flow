package org.af.assetflowapi.service;

import lombok.AllArgsConstructor;
import org.af.assetflowapi.data.dto.ProtocolDto;
import org.af.assetflowapi.data.model.Organization;
import org.af.assetflowapi.data.model.Protocol;
import org.af.assetflowapi.data.model.User;
import org.af.assetflowapi.repository.OrganizationRepository;
import org.af.assetflowapi.repository.ProtocolRepository;
import org.af.assetflowapi.repository.UserRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;

@Service
@AllArgsConstructor
public class ProtocolService {
    private final OrganizationRepository organizationRepository;
    private final ProtocolRepository protocolRepository;
    private final UserRepository userRepository;

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

        // Build Protocol entity and persist (ensure non-null employee and organization)
        Protocol protocol = new Protocol();
        protocol.setOrganization(organization);
        protocol.setEmployee(user);
        protocol.setProtocolUri(uri);

        Protocol saved = protocolRepository.save(protocol);

        // Build DTO to return
        ProtocolDto result = new ProtocolDto();
        result.setId(saved.getId());
        result.setProtocolUri(saved.getProtocolUri());
        result.setOrganizationId(saved.getOrganization() != null ? saved.getOrganization().getId() : null);
        if (saved.getEmployee() != null && saved.getEmployee().getId() != null) {
            result.setEmployeeId(saved.getEmployee().getId());
        }

        return result;
    }

    //todo: Implement AI protocol generation
    private String generateProtocolPdfUri(Organization organization, User user) {
        // Ensure target directory exists
        Path targetDir = Path.of("target", "protocols");
        try {
            Files.createDirectories(targetDir);
        } catch (IOException e) {
            throw new RuntimeException("Failed to create protocol directory", e);
        }

        String filename = String.format("protocol_org_%d_user_%s_%d.pdf",
                organization.getId(), user.getId() == null ? "null" : user.getId().toString(), Instant.now().toEpochMilli());
        Path filePath = targetDir.resolve(filename);

        // Create a simple PDF with organization and user details
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage();
            doc.addPage(page);

            try (PDPageContentStream contents = new PDPageContentStream(doc, page)) {
                contents.beginText();
                contents.setFont(PDType1Font.HELVETICA_BOLD, 16);
                contents.newLineAtOffset(50, 700);
                contents.showText("Protocol for Organization: " + organization.getOrganizationName());
                contents.endText();

                contents.beginText();
                contents.setFont(PDType1Font.HELVETICA, 12);
                contents.newLineAtOffset(50, 660);
                contents.showText("Employee: " + user.getFullName());
                contents.endText();

                contents.beginText();
                contents.setFont(PDType1Font.HELVETICA, 12);
                contents.newLineAtOffset(50, 640);
                contents.showText("Generated at: " + Instant.now().toString());
                contents.endText();
            }

            doc.save(filePath.toFile());
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate protocol PDF", e);
        }

        return filePath.toUri().toString();
    }
}
