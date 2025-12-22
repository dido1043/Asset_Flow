package org.af.assetflowapi.config.seeder;

import lombok.AllArgsConstructor;
import org.af.assetflowapi.data.enums.RoleEnum;
import org.af.assetflowapi.data.model.Assignment;
import org.af.assetflowapi.data.model.Organization;
import org.af.assetflowapi.data.model.Product;
import org.af.assetflowapi.data.model.User;
import org.af.assetflowapi.repository.AssignmentRepository;
import org.af.assetflowapi.repository.OrganizationRepository;
import org.af.assetflowapi.repository.ProductRepository;
import org.af.assetflowapi.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
@Order(1)
@AllArgsConstructor
public class DatabaseSeeder implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final AssignmentRepository assignmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        seedOrganizations();
        seedUsers();
        seedProducts();
        seedAssignments();
    }

    @Transactional
    protected void seedOrganizations() {
        try {
            if (organizationRepository.count() > 0) {
                log.debug("Organizations already seeded");
                return;
            }

            Organization org1 = new Organization();
            org1.setOrganizationName("Default Organization");

            Organization org2 = new Organization();
            org2.setOrganizationName("Contoso Ltd.");

            organizationRepository.saveAll(List.of(org1, org2));
            log.info("Seeded organizations: {}", List.of(org1.getOrganizationName(), org2.getOrganizationName()));
        } catch (Exception ex) {
            log.error("Failed to seed organizations", ex);
        }
    }

    @Transactional
    protected void seedUsers() {
        try {
            // admin
            Optional<User> adminOpt = userRepository.findByEmail("admin@example.com");
            if (adminOpt.isEmpty()) {
                User admin = new User();
                admin.setFullName("Admin User");
                admin.setEmail("admin@example.com");
                admin.setPassword(passwordEncoder.encode("adminpass"));
                admin.setRole(RoleEnum.LEADER);

                // link to first organization if exists
                organizationRepository.findAll().stream().findFirst().ifPresent(admin::setOrganization);

                userRepository.save(admin);
                log.info("Seeded admin user: {}", admin.getEmail());
            } else {
                log.debug("Admin already exists: {}", adminOpt.get().getEmail());
            }

            // regular user
            Optional<User> userOpt = userRepository.findByEmail("user@example.com");
            if (userOpt.isEmpty()) {
                User user = new User();
                user.setFullName("Regular User");
                user.setEmail("user@example.com");
                user.setPassword(passwordEncoder.encode("userpass"));
                user.setRole(RoleEnum.EMPLOYEE);

                organizationRepository.findAll().stream().findFirst().ifPresent(user::setOrganization);

                userRepository.save(user);
                log.info("Seeded user: {}", user.getEmail());
            } else {
                log.debug("User already exists: {}", userOpt.get().getEmail());
            }
        } catch (Exception ex) {
            log.error("Failed to seed users", ex);
        }
    }

    @Transactional
    protected void seedProducts() {
        try {
            if (productRepository.count() > 0) {
                log.debug("Products already seeded");
                return;
            }

            List<Organization> orgs = organizationRepository.findAll();
            Organization org = orgs.isEmpty() ? null : orgs.get(0);

            Product p1 = new Product();
            p1.setProductType("Laptop");
            p1.setProductBrand("Dell");
            p1.setProductModel("XPS 13");
            p1.setAssetTag("ASSET-001");
            p1.setOrganization(org);

            Product p2 = new Product();
            p2.setProductType("Phone");
            p2.setProductBrand("Samsung");
            p2.setProductModel("S21");
            p2.setAssetTag("ASSET-002");
            p2.setOrganization(org);

            productRepository.saveAll(List.of(p1, p2));
            log.info("Seeded products: {}, {}", p1.getAssetTag(), p2.getAssetTag());
        } catch (Exception ex) {
            log.error("Failed to seed products", ex);
        }
    }

    @Transactional
    protected void seedAssignments() {
        try {
            if (assignmentRepository.count() > 0) {
                log.debug("Assignments already seeded");
                return;
            }

            // fetch a user and a product
            Optional<User> userOpt = userRepository.findByEmail("user@example.com");
            List<Product> products = productRepository.findAll();

            if (userOpt.isPresent() && !products.isEmpty()) {
                User user = userOpt.get();
                Product product = products.get(0);

                Assignment a = new Assignment();
                a.setEmployee(user);
                a.setProduct(product);
                a.setDateAssigned(ZonedDateTime.now());
                a.setStatus("ASSIGNED");

                assignmentRepository.save(a);
                log.info("Seeded assignment for user {} and product {}", user.getEmail(), product.getAssetTag());
            } else {
                log.debug("Skipping assignment seed - missing user or product");
            }
        } catch (Exception ex) {
            log.error("Failed to seed assignments", ex);
        }
    }
}

