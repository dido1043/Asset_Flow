package org.af.assetflowapi.controller;

import org.af.assetflowapi.data.dto.ProtocolDto;
import org.af.assetflowapi.data.enums.RoleEnum;
import org.af.assetflowapi.data.model.User;
import org.af.assetflowapi.service.AuthorizationService;
import org.af.assetflowapi.service.ProtocolService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProtocolControllerTest {

    @Mock
    ProtocolService protocolService;

    @Mock
    AuthorizationService authorizationService;

    @InjectMocks
    ProtocolController protocolController;

    @Test
    void getProtocolsByEmployee_setsProtocolUri_whenIdPresent() {
        User caller = new User();
        caller.setId(7L);
        caller.setRole(RoleEnum.EMPLOYEE);

        ProtocolDto dto = new ProtocolDto();
        dto.setId(5L);

        when(protocolService.getProtocolsByEmployee(7L)).thenReturn(List.of(dto));

        ResponseEntity<List<ProtocolDto>> response = protocolController.getProtocolsByEmployee(caller, 7L);

        verify(authorizationService).requireSelfOrSameOrgLeaderOrAdmin(caller, 7L);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("/protocol/download/5", response.getBody().getFirst().getProtocolUri());
    }

    @Test
    void downloadProtocol_returnsPdfAndHeaders() {
        User caller = new User();
        caller.setId(1L);

        byte[] payload = new byte[]{1, 2, 3};
        when(protocolService.downloadProtocol(9L)).thenReturn(payload);

        ResponseEntity<byte[]> response = protocolController.downloadProtocol(caller, 9L);

        verify(authorizationService).requireProtocolAccessOrAdmin(caller, 9L);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(MediaType.APPLICATION_PDF, response.getHeaders().getContentType());
        assertEquals("attachment; filename=\"protocol-9.pdf\"", response.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION));
        assertEquals(3, response.getBody().length);
    }

    @Test
    void createProtocol_setsProtocolUri_andReturnsCreated() {
        User caller = new User();
        caller.setId(2L);
        caller.setRole(RoleEnum.LEADER);

        ProtocolDto created = new ProtocolDto();
        created.setId(12L);

        when(protocolService.createProtocol(3L, 4L)).thenReturn(created);

        ResponseEntity<ProtocolDto> response = protocolController.createProtocol(caller, 3L, 4L);

        verify(authorizationService).requireOrgLeaderOrAdmin(caller, 3L);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("/protocol/download/12", response.getBody().getProtocolUri());
    }
}

