package org.af.assetflowapi.data.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
}

