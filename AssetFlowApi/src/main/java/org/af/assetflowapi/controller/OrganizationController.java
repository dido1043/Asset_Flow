package org.af.assetflowapi.controller;

import lombok.AllArgsConstructor;
import org.af.assetflowapi.data.dto.OrganizationDto;
import org.af.assetflowapi.service.OrganizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/org")
@AllArgsConstructor
public class OrganizationController {
    private final OrganizationService organizationService;

    @GetMapping("/leader/{leaderId}")
    public ResponseEntity<OrganizationDto> getOrganizationByLeaderId(@PathVariable Long leaderId) {
        return ResponseEntity.ok(organizationService.getOrganizationByLeaderId(leaderId));
    }

    @PostMapping("/create/{leaderId}")
    public ResponseEntity<OrganizationDto> createOrganization(@PathVariable Long leaderId, @RequestBody OrganizationDto dto) {
        return ResponseEntity.ok(organizationService.createOrganization(leaderId, dto));
    }

    @PostMapping("/becomeLeader/{userId}/{organizationId}")
    public ResponseEntity<Void> becomeLeader(@PathVariable Long userId, @PathVariable Long organizationId) {
        organizationService.becomeLeader(userId, organizationId);
        return ResponseEntity.ok().build();
    }

}
