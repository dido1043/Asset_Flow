package org.af.assetflowapi.service;

import lombok.AllArgsConstructor;
import org.af.assetflowapi.data.dto.AssignmentDto;
import org.af.assetflowapi.data.model.Assignment;
import org.af.assetflowapi.data.model.Organization;
import org.af.assetflowapi.data.model.Product;
import org.af.assetflowapi.data.model.User;
import org.af.assetflowapi.repository.AssignmentRepository;
import org.af.assetflowapi.repository.OrganizationRepository;
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
    private final OrganizationRepository organizationRepository;
    private final ModelMapper modelMapper;

    public List<AssignmentDto> getUserAssignments(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User with id " + userId + " not found"));

        return user.getAssignments().stream()
                .map(assignment -> modelMapper.map(assignment, AssignmentDto.class))
                .toList();
    }

    public AssignmentDto createAssignmentToUser(AssignmentDto assignmentDtoDto) {
        if (assignmentDtoDto == null) throw new IllegalArgumentException("AssignmentDto cannot be null");

        User employee =  userRepository.findById(assignmentDtoDto.getEmployeeId())
                .orElseThrow(() -> new IllegalArgumentException("User with id " + assignmentDtoDto.getEmployeeId() + " not found"));
        Product product = productRepository.findById(assignmentDtoDto.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product with id " + assignmentDtoDto.getProductId() + " not found"));
        Organization organization = organizationRepository.findById(employee.getOrganization().getId())
                .orElseThrow(() -> new IllegalArgumentException("Organization for user with id " + assignmentDtoDto.getEmployeeId() + " not found"));
        
        if (organization.getInventory() == null || !organization.getInventory().contains(product)) {
            throw new IllegalArgumentException("Product with id " + assignmentDtoDto.getProductId() +
                    " does not belong to the organization of user with id " + assignmentDtoDto.getEmployeeId());
        }

        Assignment assignment = new Assignment();
        assignment.setEmployee(employee);
        assignment.setProduct(product);
        assignment.setDateAssigned(assignmentDtoDto.getDateAssigned());
        assignment.setDateReturned(assignmentDtoDto.getDateReturned());

        Assignment saved = assignmentRepository.save(assignment);
        return mapToDto(saved);
    }
    public AssignmentDto getAssignment(Long id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Assignment with id " + id + " not found"));
        return mapToDto(assignment);
    }

    public List<AssignmentDto> getAllAssignments() {
        return assignmentRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

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

        if (dto.getDateAssigned() != null){
            existing.setDateAssigned(dto.getDateAssigned());
        }
        existing.setDateReturned(dto.getDateReturned()); // allow null to clear

        Assignment saved = assignmentRepository.save(existing);
        return mapToDto(saved);
    }


    public void deleteAssignment(Long id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Assignment with id " + id + " not found"));

        User employee = assignment.getEmployee();
        if (employee != null && employee.getAssignments() != null) {
            employee.getAssignments().removeIf(a -> a.getId() != null && a.getId().equals(id));
            userRepository.save(employee);
        }

        assignmentRepository.delete(assignment);
    }

    public List<AssignmentDto> getAssignmentsByProduct(Long productId) {
        return assignmentRepository.findByProductId(productId).stream()
                .map(this::mapToDto)
                .toList();
    }

    public List<AssignmentDto> getCurrentlyAssigned() {
        return assignmentRepository.findByDateReturnedIsNull().stream()
                .map(this::mapToDto)
                .toList();
    }

    public List<AssignmentDto> getAssignmentsByOrganization(Long organizationId) {
        return assignmentRepository.findByOrganizationId(organizationId).stream()
                .map(this::mapToDto)
                .toList();
    }
    private AssignmentDto mapToDto(Assignment assignment) {
        AssignmentDto dto = modelMapper.map(assignment, AssignmentDto.class);
        if (assignment.getEmployee() != null) dto.setEmployeeId(assignment.getEmployee().getId());
        if (assignment.getProduct() != null) dto.setProductId(assignment.getProduct().getId());
        return dto;
    }
}
