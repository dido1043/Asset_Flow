package org.af.assetflowapi.data.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProtocolDto {
    private Long id;
    private String protocolUri;
    private UUID employeeId;
    private Long organizationId;
}

