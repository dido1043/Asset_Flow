package org.af.assetflowapi.controller;

import org.af.assetflowapi.data.dto.AssignmentDto;
import org.af.assetflowapi.data.enums.RoleEnum;
import org.af.assetflowapi.data.model.User;
import org.af.assetflowapi.service.AssignmentService;
import org.af.assetflowapi.service.AuthorizationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AssignmentControllerTest {

    @Mock
    AssignmentService assignmentService;

    @Mock
    AuthorizationService authorizationService;

    @InjectMocks
    AssignmentController assignmentController;

    @Test
    void createAssignment_checksAuthorization_andReturnsCreated() {
        User caller = new User();
        caller.setId(10L);
        caller.setRole(RoleEnum.LEADER);

        AssignmentDto request = new AssignmentDto();
        request.setEmployeeId(55L);

        AssignmentDto created = new AssignmentDto();
        created.setId(99L);

        when(assignmentService.createAssignmentToUser(request)).thenReturn(created);

        ResponseEntity<AssignmentDto> response = assignmentController.createAssignment(caller, request);

        verify(authorizationService).requireEmployeeOrgLeaderOrAdmin(caller, 55L);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(99L, response.getBody().getId());
    }

    @Test
    void getAssignment_checksAuthorization_andReturnsOk() {
        User caller = new User();
        caller.setId(3L);

        AssignmentDto dto = new AssignmentDto();
        dto.setId(7L);

        when(assignmentService.getAssignment(7L)).thenReturn(dto);

        ResponseEntity<AssignmentDto> response = assignmentController.getAssignment(caller, 7L);

        verify(authorizationService).requireAssignmentAccessOrAdmin(caller, 7L);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(7L, response.getBody().getId());
    }

    @Test
    void getAssignmentsByOrganization_checksAuthorization_andReturnsList() {
        User caller = new User();
        caller.setId(1L);

        AssignmentDto dto = new AssignmentDto();
        dto.setId(5L);

        when(assignmentService.getAssignmentsByOrganization(22L)).thenReturn(List.of(dto));

        ResponseEntity<List<AssignmentDto>> response = assignmentController.getAssignmentsByOrganization(caller, 22L);

        verify(authorizationService).requireOrgMemberOrAdmin(caller, 22L);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
    }
}

