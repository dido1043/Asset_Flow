package org.af.assetflowapi.service.auth;

import lombok.AllArgsConstructor;

import org.af.assetflowapi.data.dto.UserDto;
import org.af.assetflowapi.data.dto.auth.LoginUserDto;
import org.af.assetflowapi.data.model.User;
import org.af.assetflowapi.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class AuthenticationService {
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;


    public UserDto register(UserDto userDto) {
        User user = modelMapper.map(userDto, User.class);
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        return modelMapper.map(userRepository.save(user), UserDto.class);
    }

    public UserDto login(LoginUserDto loginUserDto) {
        String password = loginUserDto.getPassword();
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginUserDto.getEmail(),
                        loginUserDto.getPassword()
                )
        );
        return modelMapper.map(userRepository.findByEmail(loginUserDto.getEmail()), UserDto.class);
    }

}

