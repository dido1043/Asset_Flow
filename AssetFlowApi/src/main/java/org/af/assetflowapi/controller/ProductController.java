package org.af.assetflowapi.controller;

import lombok.AllArgsConstructor;
import org.af.assetflowapi.data.dto.ProductDto;
import org.af.assetflowapi.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/product")
@AllArgsConstructor
public class ProductController {
    private final ProductService productService;

    @GetMapping("/all/{orgId}")
    public ResponseEntity<List<ProductDto>> getProductsByOrganizationId(@PathVariable Long orgId) {
        return ResponseEntity.ok(productService.findByOrganizationId(orgId));
    }

    // Create
    @PostMapping
    public ResponseEntity<ProductDto> createProduct(@RequestBody ProductDto dto) {
        ProductDto created = productService.addProduct(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Read single
    @GetMapping("/{id}")
    public ResponseEntity<ProductDto> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProduct(id));
    }

    // Read all
    @GetMapping("/all")
    public ResponseEntity<List<ProductDto>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<ProductDto> updateProduct(@PathVariable Long id, @RequestBody ProductDto dto) {
        return ResponseEntity.ok(productService.updateProduct(id, dto));
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // Find by asset tag
    @GetMapping("/asset/{assetTag}")
    public ResponseEntity<ProductDto> findByAssetTag(@PathVariable String assetTag) {
        return ResponseEntity.ok(productService.findByAssetTag(assetTag));
    }

    // Search by product type
    @GetMapping("/search/type/{type}")
    public ResponseEntity<List<ProductDto>> findByProductType(@PathVariable String type) {
        return ResponseEntity.ok(productService.findByProductType(type));
    }

    // Keep compatibility with previous add endpoint
    @PostMapping("/add")
    public ResponseEntity<ProductDto> addProduct(@RequestBody ProductDto productDto) {
        return ResponseEntity.status(201).body(productService.addProduct(productDto));
    }
}
