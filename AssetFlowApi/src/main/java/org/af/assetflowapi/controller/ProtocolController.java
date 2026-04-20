package org.af.assetflowapi.controller;

import lombok.AllArgsConstructor;
import org.af.assetflowapi.data.dto.ProtocolDto;
import org.af.assetflowapi.service.ProtocolService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/protocol")
@AllArgsConstructor
public class ProtocolController {
    private final ProtocolService protocolService;
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<ProtocolDto>> getProtocolsByEmployee(@PathVariable Long employeeId) {
        List<ProtocolDto> protocols = protocolService.getProtocolsByEmployee(employeeId);
        // Add web-accessible download URLs to each protocol
        protocols.forEach(p -> {
            if (p.getId() != null) {
                p.setProtocolUri("/protocol/download/" + p.getId());
            }
        });
        return ResponseEntity.ok(protocols);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProtocolDto> getProtocolById(@PathVariable Long id) {
        ProtocolDto protocol = protocolService.getProtocolById(id);
        // Add web-accessible download URL
        if (protocol.getId() != null) {
            protocol.setProtocolUri("/protocol/download/" + protocol.getId());
        }
        return ResponseEntity.ok(protocol);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadProtocol(@PathVariable Long id) {
        byte[] file = protocolService.downloadProtocol(id);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"protocol-" + id + ".pdf\"")
                .body(file);
    }

    @GetMapping("/org/{orgId}")
    public ResponseEntity<List<ProtocolDto>> getProtocolsByOrganization(@PathVariable Long orgId) {
        List<ProtocolDto> protocols = protocolService.getProtocolsByOrganization(orgId);
        // Add web-accessible download URLs to each protocol
        protocols.forEach(p -> {
            if (p.getId() != null) {
                p.setProtocolUri("/protocol/download/" + p.getId());
            }
        });
        return ResponseEntity.ok(protocols);
    }
    
    @PostMapping("/create/{organizationId}/user/{userId}")
    public ResponseEntity<ProtocolDto> createProtocol(@PathVariable Long organizationId, @PathVariable Long userId) {
        ProtocolDto created = protocolService.createProtocol(organizationId, userId);
        // Add web-accessible download URL
        if (created.getId() != null) {
            created.setProtocolUri("/protocol/download/" + created.getId());
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/edit/{protocolId}")
    public ResponseEntity<ProtocolDto> editProtocolText(@PathVariable Long protocolId, @RequestBody String content) {
        ProtocolDto updated = protocolService.editProtocolText(protocolId, content);
        return ResponseEntity.status(HttpStatus.OK).body(updated);
    }
}
