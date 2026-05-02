
package org.af.assetflowapi.controller;

import lombok.AllArgsConstructor;
import org.af.assetflowapi.data.dto.ProductDto;
import org.af.assetflowapi.data.enums.RoleEnum;
import org.af.assetflowapi.data.model.User;
import org.af.assetflowapi.service.AuthorizationService;
import org.af.assetflowapi.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/product")
@AllArgsConstructor
public class ProductController {
    private final ProductService productService;
    private final AuthorizationService authorizationService;

    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    @PostMapping
    public ResponseEntity<ProductDto> createProduct(@AuthenticationPrincipal User caller,
                                                    @RequestBody ProductDto dto) {
        if (dto.getOrganizationId() == null && caller.getRole() != RoleEnum.ADMIN)
            throw new AccessDeniedException("Only ADMIN can create products without an organization.");
        if (dto.getOrganizationId() != null)
            authorizationService.requireOrgLeaderOrAdmin(caller, dto.getOrganizationId());
        ProductDto created = productService.addProduct(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProduct(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<List<ProductDto>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    @PutMapping("/{id}")
    public ResponseEntity<ProductDto> updateProduct(@AuthenticationPrincipal User caller,
                                                    @PathVariable Long id,
                                                    @RequestBody ProductDto dto) {
        authorizationService.requireProductOrgLeaderOrAdmin(caller, id);
        return ResponseEntity.ok(productService.updateProduct(id, dto));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@AuthenticationPrincipal User caller, @PathVariable Long id) {
        authorizationService.requireProductOrgLeaderOrAdmin(caller, id);
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/asset/{assetTag}")
    public ResponseEntity<ProductDto> findByAssetTag(@PathVariable String assetTag) {
        return ResponseEntity.ok(productService.findByAssetTag(assetTag));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/search/type/{type}")
    public ResponseEntity<List<ProductDto>> findByProductType(@PathVariable String type) {
        return ResponseEntity.ok(productService.findByProductType(type));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    @PostMapping("/add")
    public ResponseEntity<ProductDto> addProduct(@AuthenticationPrincipal User caller,
                                                 @RequestBody ProductDto productDto) {
        if (productDto.getOrganizationId() == null && caller.getRole() != RoleEnum.ADMIN)
            throw new AccessDeniedException("Only ADMIN can create products without an organization.");
        if (productDto.getOrganizationId() != null)
            authorizationService.requireOrgLeaderOrAdmin(caller, productDto.getOrganizationId());
        return ResponseEntity.status(201).body(productService.addProduct(productDto));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/org/{orgId}")
    public ResponseEntity<List<ProductDto>> getProductsByOrganization(@AuthenticationPrincipal User caller,
                                                                      @PathVariable Long orgId) {
        authorizationService.requireOrgMemberOrAdmin(caller, orgId);
        return ResponseEntity.ok(productService.findByOrgId(orgId));
    }
}
