package org.af.assetflowapi.service;

import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import lombok.AllArgsConstructor;
import org.af.assetflowapi.data.dto.AI.AiResponseDto;
import org.af.assetflowapi.data.dto.ProtocolDto;
import org.af.assetflowapi.data.model.Organization;
import org.af.assetflowapi.data.model.Protocol;
import org.af.assetflowapi.data.model.User;
import org.af.assetflowapi.repository.OrganizationRepository;
import org.af.assetflowapi.repository.ProtocolRepository;
import org.af.assetflowapi.repository.UserRepository;
import org.af.assetflowapi.service.AI.AiService;
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
    public String generateProtocolPdfUri(Organization organization, User user) {

        String leaderName = organization.getLeader() != null ? organization.getLeader().getFullName() : "(not specified)";


        Path targetDir = Path.of("target", "protocols");
        try {
            Files.createDirectories(targetDir);
        } catch (IOException e) {
            throw new RuntimeException("Failed to create protocol directory", e);
        }

        String protocolNumber = "PROT-" + organization.getId() + "-" + user.getId() + "-" + System.currentTimeMillis();
        String issuanceDate = Instant.now().toString();

        Path filePath = targetDir.resolve("protocol_" + protocolNumber + ".pdf");

        String prompt = String.format(
                "Generate a formal and concise purpose statement for a company asset transmission protocol. " +
                        "The protocol involves transferring various assets assigned to employee %s (%s) back to them for official use. " +
                        "The organization is %s (%s). " +
                        "Ensure the purpose highlights the official nature of the transfer and the intended use of the assets within the company. " +
                        "Keep it professional and suitable for inclusion in a formal document.",
                user.getFullName(),
                user.getId(),
                user.getAssignments().stream()
                                .map(assignment ->  assignment.getProduct()
                                        .getProductType() + " (" + assignment.getProduct().getAssetTag() + ")"),
                organization.getOrganizationName(),
                organization.getId(),
                "Generate detailed purpose statement with big amount of text for asset transmission protocol."
        );

        AiResponseDto aiDto = aiService.generateTextCompletion(prompt);
        String content = aiDto.getResponse();

        try(PdfWriter writer = new PdfWriter(filePath.toString());
            PdfDocument pdf = new PdfDocument(writer);
            Document doc = new Document(pdf)) {

            PdfFont fontBold = PdfFontFactory.createFont("Helvetica-Bold", PdfEncodings.UTF8);
            PdfFont fontRegular = PdfFontFactory.createFont("Helvetica", PdfEncodings.UTF8);


            doc.add(new Paragraph("Asset Transmission Protocol")
                    .setFont(fontBold)
                    .setFontSize(18)
                    .setMarginBottom(20));

            doc.add(new Paragraph("Protocol Number: " + protocolNumber)
                    .setFont(fontRegular)
                    .setFontSize(12)
                    .setMarginBottom(10));
            doc.add(new Paragraph("Issuance Date: " + issuanceDate)
                    .setFont(fontRegular)
                    .setFontSize(12)
                    .setMarginBottom(10));
            doc.add(new Paragraph("Organization: " + organization.getOrganizationName() + " (ID: " + organization.getId() + ")")
                    .setFont(fontRegular)
                    .setFontSize(12)
                    .setMarginBottom(10));
            doc.add(new Paragraph("Organization Leader: " + leaderName)
                    .setFont(fontRegular)
                    .setFontSize(12)
                    .setMarginBottom(20));
            doc.add(new Paragraph("Employee: " + user.getFullName() + " (ID: " + user.getId() + ")")
                    .setFont(fontRegular)
                    .setFontSize(12)
                    .setMarginBottom(20));
            doc.add(new Paragraph("Purpose:")
                    .setFont(fontBold)
                    .setFontSize(14)
                    .setMarginBottom(10));
            doc.add(new Paragraph(content)
                    .setFont(fontRegular)
                    .setFontSize(12)
                    .setMarginBottom(20));
            doc.add(new Paragraph("Signature:_______________________________"))
                    .setFont(fontBold)
                    .setFontSize(14);

            doc.close();
        }catch (IOException e) {
            throw new RuntimeException("Failed to create protocol PDF", e);
        }
        return filePath.toUri().toString();
    }
}

