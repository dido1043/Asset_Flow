package org.af.assetflowapi.repository;

import org.af.assetflowapi.data.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Product findByAssetTag(String assetTag);
    List<Product> findByOrganizationId(Long organizationId);
    List<Product> findByProductTypeContainingIgnoreCase(String productType);
}
