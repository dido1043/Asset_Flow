package org.af.assetflowapi.service;

import org.af.assetflowapi.data.dto.OrganizationDto;
import org.af.assetflowapi.data.model.Organization;
import org.af.assetflowapi.data.model.User;
import org.af.assetflowapi.repository.OrganizationRepository;
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
class OrganizationServiceTest {

    @Mock
    OrganizationRepository organizationRepository;

    @Mock
    UserRepository userRepository;

    @Mock
    ModelMapper modelMapper;

    @InjectMocks
    OrganizationService organizationService;

    User user;
    Organization org;
    OrganizationDto dto;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(7L);
        org = new Organization();
        org.setId(8L);
        dto = new OrganizationDto();
    }

    @Test
    void createOrganization_assignsLeader_andSaves() {
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(modelMapper.map(dto, Organization.class)).thenReturn(org);
        when(organizationRepository.save(org)).thenReturn(org);
        when(modelMapper.map(org, OrganizationDto.class)).thenReturn(dto);

        OrganizationDto result = organizationService.createOrganization(7L, dto);
        assertNotNull(result);
        verify(organizationRepository, times(1)).save(org);
    }

    @Test
    void createOrganization_whenUserMissing_throws() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> organizationService.createOrganization(99L, dto));
        assertTrue(ex.getMessage().contains("User with id 99 not found"));
    }
}

