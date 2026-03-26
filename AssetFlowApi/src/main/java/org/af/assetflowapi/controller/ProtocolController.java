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

    @GetMapping("/{id}")
    public ResponseEntity<ProtocolDto> getProtocolById(@PathVariable Long id) {
        ProtocolDto protocol = protocolService.getProtocolById(id);
        return ResponseEntity.ok(protocol);
    }
    @GetMapping("/org/{orgId}")
    public ResponseEntity<List<ProtocolDto>> getProtocolsByOrganization(@PathVariable Long orgId) {
        List<ProtocolDto> protocols = protocolService.getProtocolsByOrganization(orgId);
        return ResponseEntity.ok(protocols);
    }
    @PostMapping("/create/{organizationId}/user/{userId}")
    public ResponseEntity<ProtocolDto> createProtocol(@PathVariable Long organizationId, @PathVariable Long userId) {
        ProtocolDto created = protocolService.createProtocol(organizationId, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

}
