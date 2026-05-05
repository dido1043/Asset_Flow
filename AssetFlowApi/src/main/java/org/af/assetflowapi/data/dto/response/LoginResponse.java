package org.af.assetflowapi.data.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginResponse {
    @JsonIgnore
    private String token;
    private long expiresIn;
    private Long userId;
    private String role;
}
