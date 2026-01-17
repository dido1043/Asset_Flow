package org.af.assetflowapi.controller;

import lombok.AllArgsConstructor;
import org.af.assetflowapi.data.dto.ProtocolDto;
import org.af.assetflowapi.service.ProtocolService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/protocol")
@AllArgsConstructor
public class ProtocolController {
    private final ProtocolService protocolService;

    // Create a Protocol (or store a pre-generated protocol record)
    @PostMapping("/create/{organizationId}/user/{userId}")
    public ResponseEntity<ProtocolDto> createProtocol(@PathVariable Long organizationId, @PathVariable Long userId) {
        ProtocolDto created = protocolService.createProtocol(organizationId, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

}
