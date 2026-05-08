package org.af.assetflowapi.controller;

import lombok.AllArgsConstructor;
import org.af.assetflowapi.data.dto.ProtocolDto;
import org.af.assetflowapi.data.model.User;
import org.af.assetflowapi.service.AuthorizationService;
import org.af.assetflowapi.service.ProtocolService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/protocol")
@AllArgsConstructor
public class ProtocolController {
    private final ProtocolService protocolService;
    private final AuthorizationService authorizationService;

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<ProtocolDto>> getProtocolsByEmployee(@AuthenticationPrincipal User caller,
                                                                    @PathVariable Long employeeId) {
        authorizationService.requireSelfOrSameOrgLeaderOrAdmin(caller, employeeId);
        List<ProtocolDto> protocols = protocolService.getProtocolsByEmployee(employeeId);
        protocols.forEach(p -> {
            if (p.getId() != null) p.setProtocolUri("/protocol/download/" + p.getId());
        });
        return ResponseEntity.ok(protocols);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<ProtocolDto> getProtocolById(@AuthenticationPrincipal User caller,
                                                       @PathVariable Long id) {
        authorizationService.requireProtocolAccessOrAdmin(caller, id);
        ProtocolDto protocol = protocolService.getProtocolById(id);
        if (protocol.getId() != null) protocol.setProtocolUri("/protocol/download/" + protocol.getId());
        return ResponseEntity.ok(protocol);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> downloadProtocol(@AuthenticationPrincipal User caller, @PathVariable Long id) {
        authorizationService.requireProtocolAccessOrAdmin(caller, id);
        byte[] file = protocolService.downloadProtocol(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header("Content-Disposition", "attachment; filename=\"protocol-" + id + ".pdf\"")
                .body(file);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    @GetMapping("/org/{orgId}")
    public ResponseEntity<List<ProtocolDto>> getProtocolsByOrganization(@AuthenticationPrincipal User caller,
                                                                        @PathVariable Long orgId) {
        authorizationService.requireOrgLeaderOrAdmin(caller, orgId);
        List<ProtocolDto> protocols = protocolService.getProtocolsByOrganization(orgId);
        protocols.forEach(p -> {
            if (p.getId() != null) p.setProtocolUri("/protocol/download/" + p.getId());
        });
        return ResponseEntity.ok(protocols);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    @PostMapping("/create/{organizationId}/user/{userId}")
    public ResponseEntity<ProtocolDto> createProtocol(@AuthenticationPrincipal User caller,
                                                      @PathVariable Long organizationId,
                                                      @PathVariable Long userId) {
        authorizationService.requireOrgLeaderOrAdmin(caller, organizationId);
        ProtocolDto created = protocolService.createProtocol(organizationId, userId);
        if (created.getId() != null) created.setProtocolUri("/protocol/download/" + created.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    @PostMapping("/create-return/{organizationId}/user/{userId}")
    public ResponseEntity<ProtocolDto> createReturnProtocol(@AuthenticationPrincipal User caller,
                                                            @PathVariable Long organizationId,
                                                            @PathVariable Long userId) {
        authorizationService.requireOrgLeaderOrAdmin(caller, organizationId);
        ProtocolDto created = protocolService.createReturningAssetProtocol(organizationId, userId);
        if (created.getId() != null) created.setProtocolUri("/protocol/download/" + created.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    @PutMapping("/edit/{protocolId}")
    public ResponseEntity<ProtocolDto> editProtocolText(@AuthenticationPrincipal User caller,
                                                        @PathVariable Long protocolId,
                                                        @RequestBody String content) {
        authorizationService.requireProtocolOrgLeaderOrAdmin(caller, protocolId);
        ProtocolDto updated = protocolService.editProtocolText(protocolId, content);
        return ResponseEntity.status(HttpStatus.OK).body(updated);
    }
}
