package org.af.assetflowapi.controller;

import lombok.AllArgsConstructor;
import org.af.assetflowapi.data.dto.AssignmentDto;
import org.af.assetflowapi.data.model.User;
import org.af.assetflowapi.service.AssignmentService;
import org.af.assetflowapi.service.AuthorizationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/assignment")
@AllArgsConstructor
public class AssignmentController {
    private final AssignmentService assignmentService;
    private final AuthorizationService authorizationService;

    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    @PostMapping("/add")
    public ResponseEntity<AssignmentDto> createAssignment(@AuthenticationPrincipal User caller,
                                                          @RequestBody AssignmentDto dto) {
        authorizationService.requireEmployeeOrgLeaderOrAdmin(caller, dto.getEmployeeId());
        AssignmentDto created = assignmentService.createAssignmentToUser(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/get/{id}")
    public ResponseEntity<AssignmentDto> getAssignment(@AuthenticationPrincipal User caller,
                                                       @PathVariable Long id) {
        authorizationService.requireAssignmentAccessOrAdmin(caller, id);
        return ResponseEntity.ok(assignmentService.getAssignment(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<List<AssignmentDto>> getAllAssignments() {
        return ResponseEntity.ok(assignmentService.getAllAssignments());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    @PutMapping("/update/{id}")
    public ResponseEntity<AssignmentDto> updateAssignment(@AuthenticationPrincipal User caller,
                                                          @PathVariable Long id,
                                                          @RequestBody AssignmentDto dto) {
        authorizationService.requireAssignmentOrgLeaderOrAdmin(caller, id);
        return ResponseEntity.ok(assignmentService.updateAssignment(id, dto));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteAssignment(@AuthenticationPrincipal User caller, @PathVariable Long id) {
        authorizationService.requireAssignmentOrgLeaderOrAdmin(caller, id);
        assignmentService.deleteAssignment(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AssignmentDto>> getUserAssignments(@AuthenticationPrincipal User caller,
                                                                  @PathVariable Long userId) {
        authorizationService.requireSelfOrSameOrgLeaderOrAdmin(caller, userId);
        return ResponseEntity.ok(assignmentService.getUserAssignments(userId));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<AssignmentDto>> getAssignmentsByProduct(@AuthenticationPrincipal User caller,
                                                                       @PathVariable Long productId) {
        authorizationService.requireProductOrgLeaderOrAdmin(caller, productId);
        return ResponseEntity.ok(assignmentService.getAssignmentsByProduct(productId));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/org/{orgId}")
    public ResponseEntity<List<AssignmentDto>> getAssignmentsByOrganization(@AuthenticationPrincipal User caller,
                                                                            @PathVariable Long orgId) {
        authorizationService.requireOrgMemberOrAdmin(caller, orgId);
        return ResponseEntity.ok(assignmentService.getAssignmentsByOrganization(orgId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/current")
    public ResponseEntity<List<AssignmentDto>> getCurrentlyAssigned() {
        return ResponseEntity.ok(assignmentService.getCurrentlyAssigned());
    }
}
