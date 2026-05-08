package org.af.assetflowapi.controller;

import lombok.AllArgsConstructor;
import org.af.assetflowapi.data.dto.OrganizationDto;
import org.af.assetflowapi.data.dto.ProductDto;
import org.af.assetflowapi.data.model.User;
import org.af.assetflowapi.service.AuthorizationService;
import org.af.assetflowapi.service.OrganizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/org")
@AllArgsConstructor
public class OrganizationController {
    private final OrganizationService organizationService;
    private final AuthorizationService authorizationService;

    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    @GetMapping("/leader/{leaderId}")
    public ResponseEntity<OrganizationDto> getOrganizationByLeaderId(@AuthenticationPrincipal User caller,
                                                                     @PathVariable Long leaderId) {
        authorizationService.requireSelfOrAdmin(caller, leaderId);
        return ResponseEntity.ok(organizationService.getOrganizationByLeaderId(leaderId));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/inventory/{organizationId}")
    public ResponseEntity<List<ProductDto>> getOrganizationInventory(@AuthenticationPrincipal User caller,
                                                                     @PathVariable Long organizationId) {
        authorizationService.requireOrgMemberOrAdmin(caller, organizationId);
        return ResponseEntity.ok(organizationService.getOrganizationProducts(organizationId));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    @PostMapping("/create/{leaderId}")
    public ResponseEntity<OrganizationDto> createOrganization(@PathVariable Long leaderId,
                                                              @RequestBody OrganizationDto dto) {
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
    public ResponseEntity<OrganizationDto> joinOrganization(@AuthenticationPrincipal User caller,
                                                            @PathVariable Long userId,
                                                            @PathVariable Long organizationId) {
        authorizationService.requireOrgLeaderOrAdmin(caller, organizationId);
        return ResponseEntity.ok(organizationService.addEmployeeToOrganization(organizationId, userId));
    }
}
