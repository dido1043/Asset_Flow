package org.af.assetflowapi.data.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponse {
    private String token;
    private long expiresIn;
    private Long userId;
    private String role;
}
