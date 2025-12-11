package org.af.assetflowapi.data.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentDto {
    private Long id;
    private UUID employeeId;
    private Long productId;
    private ZonedDateTime dateAssigned;
    private ZonedDateTime dateReturned;
    private String status;
}

