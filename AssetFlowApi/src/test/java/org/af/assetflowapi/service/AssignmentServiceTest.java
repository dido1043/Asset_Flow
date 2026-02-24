package org.af.assetflowapi.service;

import org.af.assetflowapi.data.dto.AssignmentDto;
import org.af.assetflowapi.data.model.Assignment;
import org.af.assetflowapi.data.model.Product;
import org.af.assetflowapi.data.model.User;
import org.af.assetflowapi.repository.AssignmentRepository;
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
    ModelMapper modelMapper;

    @InjectMocks
    AssignmentService assignmentService;

    User user;
    Product product;
    Assignment assignment;
    AssignmentDto dto;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(2L);
        product = new Product();
        product.setId(3L);
        assignment = new Assignment();
        assignment.setId(4L);

        dto = new AssignmentDto();
        dto.setEmployeeId(2L);
        dto.setProductId(3L);
    }

    @Test
    void createAssignment_happyPath_savesAndReturnsDto() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(user));
        when(productRepository.findById(3L)).thenReturn(Optional.of(product));
        when(assignmentRepository.save(any())).thenReturn(assignment);
        when(modelMapper.map(assignment, AssignmentDto.class)).thenReturn(dto);

        AssignmentDto result = assignmentService.createAssignment(dto);

        assertNotNull(result);
        assertEquals(2L, result.getEmployeeId());
        verify(assignmentRepository, times(1)).save(any(Assignment.class));
    }

    @Test
    void createAssignment_withNull_throws() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> assignmentService.createAssignment(null));
        assertTrue(ex.getMessage().contains("AssignmentDto cannot be null"));
    }

}

