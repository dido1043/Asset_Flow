package org.af.assetflowapi.data.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProtocolDto {
    private Long id;
    private String protocolUri;
    private Long employeeId;
    private Long organizationId;
}

