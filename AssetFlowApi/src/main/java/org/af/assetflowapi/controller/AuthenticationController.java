package org.af.assetflowapi.controller;

import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.af.assetflowapi.data.dto.UserDto;
import org.af.assetflowapi.data.dto.auth.LoginUserDto;
import org.af.assetflowapi.data.dto.response.LoginResponse;
import org.af.assetflowapi.data.model.User;
import org.af.assetflowapi.service.auth.AuthenticationService;
import org.af.assetflowapi.service.auth.JwtService;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/auth")
@AllArgsConstructor
public class AuthenticationController {
    private final AuthenticationService authenticationService;
    private final JwtService jwtService;
    private final ModelMapper modelMapper;

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(authenticationService.getUsers());
    }
    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@RequestBody UserDto user) {
        return ResponseEntity.status(201).body(authenticationService.register(user));
    }
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginUserDto loginUserDto) {
        User authenticatedUser = modelMapper.map(authenticationService.login(loginUserDto), User.class);

        String jwtToken = jwtService.generateToken(authenticatedUser);
        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setToken(jwtToken);
        loginResponse.setExpiresIn(jwtService.getExpirationTime());
        loginResponse.setRole(authenticatedUser.getRole().toString());
        loginResponse.setUserId(authenticatedUser.getId());

        return ResponseEntity.ok(loginResponse);
    }

    @GetMapping("/oauth2/login")
    public ResponseEntity<?> oAuthLogin(HttpServletResponse httpServletResponse) throws IOException {
        httpServletResponse.sendRedirect("/oauth2/authorization/google");
        return ResponseEntity.ok("Redirecting...");
    }

    @GetMapping("/loginSuccess")
    public ResponseEntity<?> handleGoogleSuccess(Authentication authentication) throws IOException {
        if (!(authentication instanceof OAuth2AuthenticationToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("OAuth2 authentication required");
        }
        OAuth2AuthenticationToken token = (OAuth2AuthenticationToken) authentication;
        User user = authenticationService.oAuthLogin(token);

        // create JWT and response similar to /login
        String jwtToken = jwtService.generateToken(user);
        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setToken(jwtToken);
        loginResponse.setExpiresIn(jwtService.getExpirationTime());
        loginResponse.setRole(user.getRole().toString());
        loginResponse.setUserId(user.getId());

        return ResponseEntity.status(200).body(loginResponse);
    }

    @PutMapping("/user/edit/{userId}")
    public ResponseEntity<UserDto> editUser(@PathVariable Long userId, @RequestBody UserDto userDto) {
        return ResponseEntity.ok(authenticationService.editProfile(userId, userDto));
    }

    @DeleteMapping("/user/delete/{userId}")
    public ResponseEntity<UserDto> deleteUser(@PathVariable Long userId) {
        return ResponseEntity.ok(authenticationService.deleteUser(userId));
    }

}
