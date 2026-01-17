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

    @PostMapping("/add")
    public ResponseEntity<AssignmentDto> createAssignment(@RequestBody AssignmentDto dto) {
        AssignmentDto created = assignmentService.createAssignment(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<AssignmentDto> getAssignment(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getAssignment(id));
    }

    @GetMapping("/all")
    public ResponseEntity<List<AssignmentDto>> getAllAssignments() {
        return ResponseEntity.ok(assignmentService.getAllAssignments());
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<AssignmentDto> updateAssignment(@PathVariable Long id, @RequestBody AssignmentDto dto) {
        return ResponseEntity.ok(assignmentService.updateAssignment(id, dto));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long id) {
        assignmentService.deleteAssignment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AssignmentDto>> getUserAssignments(@PathVariable Long userId) {
        return ResponseEntity.ok(assignmentService.getUserAssignments(userId));
    }

    @PostMapping("/user/add/{userId}/{assignmentId}")
    public ResponseEntity<List<AssignmentDto>> addAssignmentToUser(@PathVariable Long userId, @PathVariable Long assignmentId) {
        return ResponseEntity.ok(assignmentService.addAssignmentToUser(userId, assignmentId));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<AssignmentDto>> getAssignmentsByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByProduct(productId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<AssignmentDto>> getAssignmentsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByStatus(status));
    }

    @GetMapping("/current")
    public ResponseEntity<List<AssignmentDto>> getCurrentlyAssigned() {
        return ResponseEntity.ok(assignmentService.getCurrentlyAssigned());
    }

}
