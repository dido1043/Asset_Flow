package org.af.assetflowapi.repository;

import org.af.assetflowapi.data.enums.RoleEnum;
import org.af.assetflowapi.data.model.Assignment;
import org.af.assetflowapi.data.model.Organization;
import org.af.assetflowapi.data.model.Product;
import org.af.assetflowapi.data.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.ZonedDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class AssignmentRepositoryIntegrationTest extends RepositoryIntegrationTestBase {

    @Autowired
    AssignmentRepository assignmentRepository;

    @Autowired
    OrganizationRepository organizationRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    ProductRepository productRepository;

    @Test
    void repositoryFindsAssignmentsByEmployeeProductAndOrganization() {
        Organization org = new Organization();
        org.setOrganizationName("Assign Org");
        org = organizationRepository.save(org);

        User employee = new User();
        employee.setFullName("Employee A");
        employee.setEmail("employee.a@example.com");
        employee.setRole(RoleEnum.EMPLOYEE);
        employee.setOrganization(org);
        employee = userRepository.save(employee);

        Product product = new Product();
        product.setProductType("Laptop");
        product.setProductBrand("Brand");
        product.setProductModel("Model");
        product.setAssetTag("AT-100");
        product.setOrganization(org);
        product = productRepository.save(product);

        Assignment assignment = new Assignment();
        assignment.setEmployee(employee);
        assignment.setProduct(product);
        assignment.setDateAssigned(ZonedDateTime.now());
        assignment = assignmentRepository.save(assignment);

        List<Assignment> byEmployee = assignmentRepository.findByEmployeeId(employee.getId());
        List<Assignment> byProduct = assignmentRepository.findByProductId(product.getId());
        List<Assignment> byOrg = assignmentRepository.findByOrganizationId(org.getId());
        List<Assignment> current = assignmentRepository.findByDateReturnedIsNull();

        assertFalse(byEmployee.isEmpty());
        assertEquals(assignment.getId(), byEmployee.getFirst().getId());
        assertFalse(byProduct.isEmpty());
        assertEquals(assignment.getId(), byProduct.getFirst().getId());
        assertFalse(byOrg.isEmpty());
        assertEquals(assignment.getId(), byOrg.getFirst().getId());
        assertFalse(current.isEmpty());
    }
}

