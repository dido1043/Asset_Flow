package org.af.assetflowapi.data.dto.auth;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginUserDto {
    private String name;
    private String email;
    private String password;
}
