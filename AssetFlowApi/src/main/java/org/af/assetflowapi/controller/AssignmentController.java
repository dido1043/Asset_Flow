package org.af.assetflowapi.controller;

import lombok.AllArgsConstructor;
import org.af.assetflowapi.data.dto.AssignmentDto;
import org.af.assetflowapi.service.AssignmentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/assignment")
@AllArgsConstructor
public class AssignmentController {
    private final AssignmentService assignmentService;

    // Create
    @PostMapping
    public ResponseEntity<AssignmentDto> createAssignment(@RequestBody AssignmentDto dto) {
        AssignmentDto created = assignmentService.createAssignment(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Read single
    @GetMapping("/{id}")
    public ResponseEntity<AssignmentDto> getAssignment(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getAssignment(id));
    }

    // Read all
    @GetMapping("/all")
    public ResponseEntity<List<AssignmentDto>> getAllAssignments() {
        return ResponseEntity.ok(assignmentService.getAllAssignments());
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<AssignmentDto> updateAssignment(@PathVariable Long id, @RequestBody AssignmentDto dto) {
        return ResponseEntity.ok(assignmentService.updateAssignment(id, dto));
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long id) {
        assignmentService.deleteAssignment(id);
        return ResponseEntity.noContent().build();
    }

    // User-specific: get assignments for a user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AssignmentDto>> getUserAssignments(@PathVariable Long userId) {
        return ResponseEntity.ok(assignmentService.getUserAssignments(userId));
    }

    // User-specific: add existing assignment to a user
    @PostMapping("/user/add/{userId}/{assignmentId}")
    public ResponseEntity<List<AssignmentDto>> addAssignmentToUser(@PathVariable Long userId, @PathVariable Long assignmentId) {
        return ResponseEntity.ok(assignmentService.addAssignmentToUser(userId, assignmentId));
    }

    // Query by product
    @GetMapping("/product/{productId}")
    public ResponseEntity<List<AssignmentDto>> getAssignmentsByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByProduct(productId));
    }

    // Query by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<AssignmentDto>> getAssignmentsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByStatus(status));
    }

    // Currently assigned (dateReturned is null)
    @GetMapping("/current")
    public ResponseEntity<List<AssignmentDto>> getCurrentlyAssigned() {
        return ResponseEntity.ok(assignmentService.getCurrentlyAssigned());
    }

}
