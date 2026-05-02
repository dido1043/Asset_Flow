package org.af.assetflowapi.controller;

import lombok.AllArgsConstructor;
import org.af.assetflowapi.data.dto.AssignmentDto;
import org.af.assetflowapi.service.AssignmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/assignment")
@AllArgsConstructor
public class AssignmentController {
    private final AssignmentService assignmentService;

    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    @PostMapping("/add")
    public ResponseEntity<AssignmentDto> createAssignment(@RequestBody AssignmentDto dto) {
        AssignmentDto created = assignmentService.createAssignmentToUser(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<AssignmentDto> getAssignment(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getAssignment(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    @GetMapping("/all")
    public ResponseEntity<List<AssignmentDto>> getAllAssignments() {
        return ResponseEntity.ok(assignmentService.getAllAssignments());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    @PutMapping("/update/{id}")
    public ResponseEntity<AssignmentDto> updateAssignment(@PathVariable Long id, @RequestBody AssignmentDto dto) {
        return ResponseEntity.ok(assignmentService.updateAssignment(id, dto));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long id) {
        assignmentService.deleteAssignment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AssignmentDto>> getUserAssignments(@PathVariable Long userId) {
        return ResponseEntity.ok(assignmentService.getUserAssignments(userId));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<AssignmentDto>> getAssignmentsByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByProduct(productId));
    }
    @GetMapping("/org/{orgId}")
    public ResponseEntity<List<AssignmentDto>> getAssignmentsByOrganization(@PathVariable Long orgId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByOrganization(orgId));
    }
    @GetMapping("/current")
    public ResponseEntity<List<AssignmentDto>> getCurrentlyAssigned() {
        return ResponseEntity.ok(assignmentService.getCurrentlyAssigned());
    }

}
