package org.af.assetflowapi.service;

import org.af.assetflowapi.data.dto.AssignmentDto;
import org.af.assetflowapi.data.model.Assignment;
import org.af.assetflowapi.data.model.Organization;
import org.af.assetflowapi.data.model.Product;
import org.af.assetflowapi.data.model.User;
import org.af.assetflowapi.repository.AssignmentRepository;
import org.af.assetflowapi.repository.OrganizationRepository;
import org.af.assetflowapi.repository.ProductRepository;
import org.af.assetflowapi.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.modelmapper.ModelMapper;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssignmentServiceTest {

    @Mock
    AssignmentRepository assignmentRepository;

    @Mock
    UserRepository userRepository;

    @Mock
    ProductRepository productRepository;

    @Mock
    OrganizationRepository organizationRepository;

    @Mock
    ModelMapper modelMapper;

    @InjectMocks
    AssignmentService assignmentService;

    User user;
    Product product;
    Organization organization;
    Assignment assignment;
    AssignmentDto dto;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(2L);
        product = new Product();
        product.setId(3L);
    organization = new Organization();
    organization.setId(11L);
        assignment = new Assignment();
        assignment.setId(4L);
    assignment.setEmployee(user);
    assignment.setProduct(product);

        dto = new AssignmentDto();
        dto.setEmployeeId(2L);
        dto.setProductId(3L);
    }

    @Test
    void createAssignment_happyPath_savesAndReturnsDto() {
        user.setOrganization(organization);
        organization.setInventory(java.util.List.of(product));
        when(userRepository.findById(2L)).thenReturn(Optional.of(user));
        when(productRepository.findById(3L)).thenReturn(Optional.of(product));
        when(organizationRepository.findById(11L)).thenReturn(Optional.of(organization));
        when(assignmentRepository.save(any())).thenReturn(assignment);
        when(modelMapper.map(assignment, AssignmentDto.class)).thenReturn(new AssignmentDto());

        AssignmentDto result = assignmentService.createAssignmentToUser(dto);

        assertNotNull(result);
        assertEquals(2L, result.getEmployeeId());
        verify(assignmentRepository, times(1)).save(any(Assignment.class));
    }

    @Test
    void createAssignment_withNull_throws() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> assignmentService.createAssignmentToUser(null));
        assertTrue(ex.getMessage().contains("AssignmentDto cannot be null"));
    }

    @Test
    void getUserAssignments_mapsEmployeeAndProductIds() {
        when(userRepository.existsById(2L)).thenReturn(true);
        when(assignmentRepository.findByEmployeeId(2L)).thenReturn(List.of(assignment));
        when(modelMapper.map(assignment, AssignmentDto.class)).thenReturn(new AssignmentDto());

        List<AssignmentDto> result = assignmentService.getUserAssignments(2L);

        assertEquals(1, result.size());
        assertEquals(2L, result.getFirst().getEmployeeId());
        assertEquals(3L, result.getFirst().getProductId());
        verify(assignmentRepository).findByEmployeeId(2L);
    }

}
