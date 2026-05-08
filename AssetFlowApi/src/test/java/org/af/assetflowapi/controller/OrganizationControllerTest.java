package org.af.assetflowapi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.af.assetflowapi.data.dto.OrganizationDto;
import org.af.assetflowapi.service.AuthorizationService;
import org.af.assetflowapi.service.OrganizationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class OrganizationControllerTest {

    MockMvc mockMvc;

    @Mock
    OrganizationService organizationService;

    @Mock
    AuthorizationService authorizationService;

    @InjectMocks
    OrganizationController organizationController;

    ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(organizationController).build();
    }

    @Test
    void getOrganizationByLeaderId_returnsDto() throws Exception {
        OrganizationDto dto = new OrganizationDto();
        when(organizationService.getOrganizationByLeaderId(anyLong())).thenReturn(dto);

        mockMvc.perform(get("/org/leader/1").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void createOrganization_returnsDto() throws Exception {
        OrganizationDto dto = new OrganizationDto();
        when(organizationService.createOrganization(anyLong(), any(OrganizationDto.class))).thenReturn(dto);

        mockMvc.perform(post("/org/create/1").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk());
    }

    @Test
    void getOrganizationInventory_checksAuthorization_andReturnsOk() {
        org.af.assetflowapi.data.model.User caller = new org.af.assetflowapi.data.model.User();
        caller.setId(4L);

        when(organizationService.getOrganizationProducts(9L)).thenReturn(java.util.List.of(new org.af.assetflowapi.data.dto.ProductDto()));

        org.springframework.http.ResponseEntity<java.util.List<org.af.assetflowapi.data.dto.ProductDto>> response =
                organizationController.getOrganizationInventory(caller, 9L);

        org.mockito.Mockito.verify(authorizationService).requireOrgMemberOrAdmin(caller, 9L);
        org.junit.jupiter.api.Assertions.assertEquals(org.springframework.http.HttpStatus.OK, response.getStatusCode());
        org.junit.jupiter.api.Assertions.assertNotNull(response.getBody());
    }
}
