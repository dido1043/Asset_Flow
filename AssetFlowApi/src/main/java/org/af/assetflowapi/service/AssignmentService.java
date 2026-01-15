package org.af.assetflowapi.service;

import lombok.AllArgsConstructor;
import org.af.assetflowapi.data.dto.AssignmentDto;
import org.af.assetflowapi.data.model.Assignment;
import org.af.assetflowapi.data.model.Product;
import org.af.assetflowapi.data.model.User;
import org.af.assetflowapi.repository.AssignmentRepository;
import org.af.assetflowapi.repository.ProductRepository;
import org.af.assetflowapi.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class AssignmentService {
    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ModelMapper modelMapper;
//todo: Add assignmentId
    public List<AssignmentDto> addAssignmentToUser(Long userId, Long assignmentId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User with id " + userId + " not found"));
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assignment with id " + assignmentId + " not found"));

        user.getAssignments().add(assignment);
        userRepository.save(user);
        return user.getAssignments().stream()
                .map(a -> modelMapper.map(a, AssignmentDto.class))
                .toList();

    }

    public List<AssignmentDto> getUserAssignments(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User with id " + userId + " not found"));

        return user.getAssignments().stream()
                .map(assignment -> modelMapper.map(assignment, AssignmentDto.class))
                .toList();
    }

    // Create
    public AssignmentDto createAssignment(AssignmentDto dto) {
        if (dto == null) throw new IllegalArgumentException("AssignmentDto cannot be null");

        User employee = null;
        Product product = null;

        if (dto.getEmployeeId() != null) {
            employee = userRepository.findById(dto.getEmployeeId())
                    .orElseThrow(() -> new IllegalArgumentException("User with id " + dto.getEmployeeId() + " not found"));
        }

        if (dto.getProductId() != null) {
            product = productRepository.findById(dto.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product with id " + dto.getProductId() + " not found"));
        }

        Assignment assignment = new Assignment();
        assignment.setEmployee(employee);
        assignment.setProduct(product);
        assignment.setDateAssigned(dto.getDateAssigned());
        assignment.setDateReturned(dto.getDateReturned());
        assignment.setStatus(dto.getStatus());

        Assignment saved = assignmentRepository.save(assignment);
        return mapToDto(saved);
    }

    // Read single
    public AssignmentDto getAssignment(Long id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Assignment with id " + id + " not found"));
        return mapToDto(assignment);
    }

    // Read all
    public List<AssignmentDto> getAllAssignments() {
        return assignmentRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    // Update
    public AssignmentDto updateAssignment(Long id, AssignmentDto dto) {
        Assignment existing = assignmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Assignment with id " + id + " not found"));

        if (dto.getEmployeeId() != null) {
            User employee = userRepository.findById(dto.getEmployeeId())
                    .orElseThrow(() -> new IllegalArgumentException("User with id " + dto.getEmployeeId() + " not found"));
            existing.setEmployee(employee);
        }

        if (dto.getProductId() != null) {
            Product product = productRepository.findById(dto.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product with id " + dto.getProductId() + " not found"));
            existing.setProduct(product);
        }

        if (dto.getDateAssigned() != null) existing.setDateAssigned(dto.getDateAssigned());
        existing.setDateReturned(dto.getDateReturned()); // allow null to clear
        if (dto.getStatus() != null) existing.setStatus(dto.getStatus());

        Assignment saved = assignmentRepository.save(existing);
        return mapToDto(saved);
    }

    // Delete
    public void deleteAssignment(Long id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Assignment with id " + id + " not found"));

        // If the assignment is linked to a user, remove it from the user's collection to keep persistence context consistent
        User employee = assignment.getEmployee();
        if (employee != null && employee.getAssignments() != null) {
            employee.getAssignments().removeIf(a -> a.getId() != null && a.getId().equals(id));
            userRepository.save(employee);
        }

        assignmentRepository.delete(assignment);
    }

    // Additional query helpers
    public List<AssignmentDto> getAssignmentsByProduct(Long productId) {
        return assignmentRepository.findByProductId(productId).stream()
                .map(this::mapToDto)
                .toList();
    }

    public List<AssignmentDto> getAssignmentsByStatus(String status) {
        return assignmentRepository.findByStatus(status).stream()
                .map(this::mapToDto)
                .toList();
    }

    public List<AssignmentDto> getCurrentlyAssigned() {
        return assignmentRepository.findByDateReturnedIsNull().stream()
                .map(this::mapToDto)
                .toList();
    }

    // Helper mapper to ensure employeeId and productId are set on the DTO
    private AssignmentDto mapToDto(Assignment assignment) {
        AssignmentDto dto = modelMapper.map(assignment, AssignmentDto.class);
        if (assignment.getEmployee() != null) dto.setEmployeeId(assignment.getEmployee().getId());
        if (assignment.getProduct() != null) dto.setProductId(assignment.getProduct().getId());
        return dto;
    }
}
