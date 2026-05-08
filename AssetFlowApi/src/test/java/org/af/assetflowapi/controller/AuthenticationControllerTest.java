package org.af.assetflowapi.controller;

import jakarta.servlet.http.HttpServletResponse;
import org.af.assetflowapi.data.dto.UserDto;
import org.af.assetflowapi.data.dto.auth.LoginUserDto;
import org.af.assetflowapi.data.dto.auth.OAuthCodeExchangeRequest;
import org.af.assetflowapi.data.dto.response.LoginResponse;
import org.af.assetflowapi.data.enums.RoleEnum;
import org.af.assetflowapi.data.model.User;
import org.af.assetflowapi.service.AuthorizationService;
import org.af.assetflowapi.service.auth.AuthenticationService;
import org.af.assetflowapi.service.auth.JwtService;
import org.af.assetflowapi.service.auth.OAuthCodeService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthenticationControllerTest {

    @Mock
    AuthenticationService authenticationService;

    @Mock
    JwtService jwtService;

    @Mock
    OAuthCodeService oAuthCodeService;

    @Mock
    org.modelmapper.ModelMapper modelMapper;

    @Mock
    AuthorizationService authorizationService;

    @InjectMocks
    AuthenticationController authenticationController;

    @Test
    void login_returnsToken_andSetsCookie() {
        LoginUserDto loginUserDto = new LoginUserDto();
        loginUserDto.setEmail("user@example.com");
        loginUserDto.setPassword("secret");

        UserDto userDto = new UserDto();
        userDto.setId(7L);
        userDto.setRole(RoleEnum.EMPLOYEE);

        User user = new User();
        user.setId(7L);
        user.setRole(RoleEnum.EMPLOYEE);

        when(authenticationService.login(loginUserDto)).thenReturn(userDto);
        when(modelMapper.map(userDto, User.class)).thenReturn(user);
        when(jwtService.generateToken(user)).thenReturn("jwt-token");
        when(jwtService.getExpirationTime()).thenReturn(3600L);

        MockHttpServletResponse response = new MockHttpServletResponse();

        ResponseEntity<LoginResponse> result = authenticationController.login(loginUserDto, response);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals("jwt-token", result.getBody().getToken());
        assertEquals(3600L, result.getBody().getExpiresIn());
        assertEquals("EMPLOYEE", result.getBody().getRole());
        assertEquals(7L, result.getBody().getUserId());
        assertNotNull(response.getHeader(HttpHeaders.SET_COOKIE));
    }

    @Test
    void exchangeOAuthCode_whenInvalid_returnsUnauthorized() {
        OAuthCodeExchangeRequest request = new OAuthCodeExchangeRequest("bad");
        when(oAuthCodeService.consumeCode("bad")).thenReturn(null);

        ResponseEntity<LoginResponse> response = authenticationController.exchangeOAuthCode(request, new MockHttpServletResponse());

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void getUsersByOrganization_checksAuthorization_andReturnsList() {
        User caller = new User();
        caller.setId(1L);

        when(authenticationService.getUsersByOrganization(22L)).thenReturn(List.of(new UserDto()));

        ResponseEntity<List<UserDto>> response = authenticationController.getUsersByOrganization(caller, 22L);

        verify(authorizationService).requireOrgLeaderOrAdmin(caller, 22L);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void logout_clearsCookie() {
        MockHttpServletResponse response = new MockHttpServletResponse();

        ResponseEntity<Void> result = authenticationController.logout(response);

        assertEquals(HttpStatus.NO_CONTENT, result.getStatusCode());
        assertNotNull(response.getHeader(HttpHeaders.SET_COOKIE));
    }
}

