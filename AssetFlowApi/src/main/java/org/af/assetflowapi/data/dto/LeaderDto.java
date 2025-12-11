package org.af.assetflowapi.data.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaderDto {
    private Long id;
    private String fullName;
    private Integer age;
    private List<Long> organizationIds;
}
