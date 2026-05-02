package org.af.assetflowapi.controller;

import lombok.AllArgsConstructor;
import org.af.assetflowapi.data.dto.ProductDto;
import org.af.assetflowapi.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/product")
@AllArgsConstructor
public class ProductController {
    private final ProductService productService;

    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    @PostMapping
    public ResponseEntity<ProductDto> createProduct(@RequestBody ProductDto dto) {
        ProductDto created = productService.addProduct(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProduct(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    @GetMapping("/all")
    public ResponseEntity<List<ProductDto>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    @PutMapping("/{id}")
    public ResponseEntity<ProductDto> updateProduct(@PathVariable Long id, @RequestBody ProductDto dto) {
        return ResponseEntity.ok(productService.updateProduct(id, dto));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/asset/{assetTag}")
    public ResponseEntity<ProductDto> findByAssetTag(@PathVariable String assetTag) {
        return ResponseEntity.ok(productService.findByAssetTag(assetTag));
    }

    @GetMapping("/search/type/{type}")
    public ResponseEntity<List<ProductDto>> findByProductType(@PathVariable String type) {
        return ResponseEntity.ok(productService.findByProductType(type));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'LEADER')")
    @PostMapping("/add")
    public ResponseEntity<ProductDto> addProduct(@RequestBody ProductDto productDto) {
        return ResponseEntity.status(201).body(productService.addProduct(productDto));
    }
    @GetMapping("/org/{orgId}")
    public ResponseEntity<List<ProductDto>> getProductsByOrganization(@PathVariable Long orgId) {
        return ResponseEntity.ok(productService.findByOrgId(orgId));
    }
}
