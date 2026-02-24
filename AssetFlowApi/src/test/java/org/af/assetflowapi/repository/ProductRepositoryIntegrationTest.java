package org.af.assetflowapi.repository;

import liquibase.Contexts;
import liquibase.LabelExpression;
import liquibase.Liquibase;
import liquibase.database.Database;
import liquibase.database.DatabaseFactory;
import liquibase.database.jvm.JdbcConnection;
import liquibase.resource.ClassLoaderResourceAccessor;
import org.af.assetflowapi.data.model.Organization;
import org.af.assetflowapi.data.model.Product;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.List;

@SpringBootTest
@ExtendWith(SpringExtension.class)
@Testcontainers
class ProductRepositoryIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15.4")
            .withDatabaseName("testdb")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        // Disable JPA ddl auto
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "none");
        // Ensure Liquibase runs against the test DB using the project's changelog
        registry.add("spring.liquibase.change-log", () -> "classpath:db/changelog/db.changelog-master.yaml");
        // Disable the application seeder to avoid timing issues
        registry.add("app.db.seed", () -> "false");
    }

    @Autowired
    ProductRepository productRepository;

    @Autowired
    OrganizationRepository organizationRepository;

    @Autowired
    DataSource dataSource;

    @Test
    void repositorySavesAndFindsProduct() throws Exception {
        // Run Liquibase programmatically to ensure migrations are applied against the testcontainer DB
        try (Connection conn = dataSource.getConnection()) {
            Database database = DatabaseFactory.getInstance().findCorrectDatabaseImplementation(new JdbcConnection(conn));
            Liquibase liquibase = new Liquibase("db/changelog/db.changelog-master.yaml", new ClassLoaderResourceAccessor(), database);
            liquibase.update(new Contexts(), new LabelExpression());
        }

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
