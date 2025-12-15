package org.af.assetflowapi.data.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.af.assetflowapi.data.enums.RoleEnum;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String fullName;
    private String email;
    private String password;
    private RoleEnum role;
    private Integer age;
    private Long organizationId;         // the organization this user belongs to (for employees)

    // IDs referencing related entities (optional, populated when needed)
    private List<Long> assignmentIds;    // for employees: ids of assignments
    private List<Long> organizationIds;  // for leaders: ids of organizations they lead
}
