package org.af.assetflowapi.repository;

import org.af.assetflowapi.data.model.Organization;
import org.af.assetflowapi.data.model.Product;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.List;

class ProductRepositoryIntegrationTest extends RepositoryIntegrationTestBase {

    @Autowired
    ProductRepository productRepository;

    @Autowired
    OrganizationRepository organizationRepository;

    @Test
    void repositorySavesAndFindsProduct() throws Exception {

        // Ensure Liquibase ran by checking for existence of organization table
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            ResultSet rs = stmt.executeQuery("SELECT to_regclass('public.organization')");
            if (rs.next()) {
                String reg = rs.getString(1);
                Assertions.assertNotNull(reg, "Expected organization table to be present after migrations");
            } else {
                Assertions.fail("to_regclass query returned no rows");
            }
        }

        Organization org = new Organization();
        org.setOrganizationName("TC Org");
        org = organizationRepository.save(org);

        Product p = new Product();
        p.setProductType("Phone");
        p.setProductBrand("BrandX");
        p.setProductModel("X1");
        p.setAssetTag("TC-AT-1");
        p.setOrganization(org);

        Product saved = productRepository.save(p);
        Assertions.assertNotNull(saved.getId());

        Product byTag = productRepository.findByAssetTag("TC-AT-1");
        Assertions.assertNotNull(byTag);
        Assertions.assertEquals("Phone", byTag.getProductType());

        List<Product> byOrg = productRepository.findByOrganizationId(org.getId());
        Assertions.assertFalse(byOrg.isEmpty());
    }
}
