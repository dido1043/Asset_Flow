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
    private java.util.UUID employeeId;
    private Long organizationId;
}

