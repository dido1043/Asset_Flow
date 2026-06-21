package org.af.assetflowapi.config.seeder;

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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;

@Component
@Order(1)
public class DatabaseSeeder implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final AssignmentRepository assignmentRepository;
    private final PasswordEncoder passwordEncoder;


    @Value("${app.db.seed:false}")
    private boolean seedEnabled;

    // Explicit constructor - do not include seedEnabled so it is injected via @Value on the field
    public DatabaseSeeder(OrganizationRepository organizationRepository,
                          UserRepository userRepository,
                          ProductRepository productRepository,
                          AssignmentRepository assignmentRepository,
                          PasswordEncoder passwordEncoder) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.assignmentRepository = assignmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (!seedEnabled) {
            log.info("Database seeding disabled by app.db.seed=false");
            return;
        }

        seedProducts();
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
}
