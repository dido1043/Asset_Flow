package org.af.assetflowapi.data.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
    private Long id;
    private String productType;
    private String productBrand;
    private String productModel;
    private String assetTag;
    private Long organizationId;
    private List<Long> assignmentIds;
}

