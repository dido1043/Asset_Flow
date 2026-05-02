package org.af.assetflowapi.controller;

import lombok.AllArgsConstructor;
import org.af.assetflowapi.data.dto.OrganizationDto;
import org.af.assetflowapi.service.OrganizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.af.assetflowapi.data.dto.ProductDto;

import java.util.List;
@RestController
@RequestMapping("/org")
@AllArgsConstructor
public class OrganizationController {
    private final OrganizationService organizationService;

    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    @GetMapping("/leader/{leaderId}")
    public ResponseEntity<OrganizationDto> getOrganizationByLeaderId(@PathVariable Long leaderId) {
        return ResponseEntity.ok(organizationService.getOrganizationByLeaderId(leaderId));
    }
    @GetMapping("/inventory/{organizationId}")
    public ResponseEntity<List<ProductDto>> getOrganizationInventory(@PathVariable Long organizationId) {
        return ResponseEntity.ok(organizationService.getOrganizationProducts(organizationId));
    }
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/create/{leaderId}")
    public ResponseEntity<OrganizationDto> createOrganization(@PathVariable Long leaderId, @RequestBody OrganizationDto dto) {
        return ResponseEntity.ok(organizationService.createOrganization(leaderId, dto));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/becomeLeader/{userId}/{organizationId}")
    public ResponseEntity<Void> becomeLeader(@PathVariable Long userId, @PathVariable Long organizationId) {
        organizationService.becomeLeader(userId, organizationId);
        return ResponseEntity.ok().build();
    }
    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    @PostMapping("/join/{userId}/{organizationId}")
    public ResponseEntity<OrganizationDto> joinOrganization(@PathVariable Long userId, @PathVariable Long organizationId) {
       return ResponseEntity.ok(organizationService.addEmployeeToOrganization(organizationId, userId));
    }

}
