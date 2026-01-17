package org.af.assetflowapi.service;

import lombok.AllArgsConstructor;
import org.af.assetflowapi.data.dto.ProductDto;
import org.af.assetflowapi.data.model.Organization;
import org.af.assetflowapi.data.model.Product;
import org.af.assetflowapi.repository.OrganizationRepository;
import org.af.assetflowapi.repository.ProductRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final OrganizationRepository organizationRepository;
    private ModelMapper modelMapper;

    public List<ProductDto> findByOrganizationId(Long organizationId) {
        List<Product> products = productRepository.findByOrganizationId(organizationId);
        return products.stream()
                .map(product -> {
                    ProductDto dto = modelMapper.map(product, ProductDto.class);
                    if (product.getOrganization() != null) dto.setOrganizationId(product.getOrganization().getId());
                    return dto;
                })
                .toList();
    }


    public ProductDto addProduct(ProductDto productDto) {
        Product product = modelMapper.map(productDto, Product.class);

         if (productDto.getOrganizationId() != null) {
            Organization org = organizationRepository.findById(productDto.getOrganizationId())
                    .orElseThrow(() -> new IllegalArgumentException("Organization with id " + productDto.getOrganizationId() + " not found"));
            product.setOrganization(org);
        }

        Product saved = productRepository.save(product);
        ProductDto dto = modelMapper.map(saved, ProductDto.class);
        if (saved.getOrganization() != null) dto.setOrganizationId(saved.getOrganization().getId());
        return dto;
    }

    public ProductDto getProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product with id " + id + " not found"));
        ProductDto dto = modelMapper.map(product, ProductDto.class);
        if (product.getOrganization() != null) dto.setOrganizationId(product.getOrganization().getId());
        return dto;
    }

    public List<ProductDto> getAllProducts() {
        return productRepository.findAll().stream()
                .map(p -> {
                    ProductDto dto = modelMapper.map(p, ProductDto.class);
                    if (p.getOrganization() != null) dto.setOrganizationId(p.getOrganization().getId());
                    return dto;
                })
                .toList();
    }


    public ProductDto updateProduct(Long id, ProductDto dto) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product with id " + id + " not found"));

        if (dto.getProductType() != null) existing.setProductType(dto.getProductType());
        if (dto.getProductBrand() != null) existing.setProductBrand(dto.getProductBrand());
        if (dto.getProductModel() != null) existing.setProductModel(dto.getProductModel());
        if (dto.getAssetTag() != null) existing.setAssetTag(dto.getAssetTag());

        if (dto.getOrganizationId() != null) {
            Organization org = organizationRepository.findById(dto.getOrganizationId())
                    .orElseThrow(() -> new IllegalArgumentException("Organization with id " + dto.getOrganizationId() + " not found"));
            existing.setOrganization(org);
        }

        Product saved = productRepository.save(existing);
        ProductDto result = modelMapper.map(saved, ProductDto.class);
        if (saved.getOrganization() != null) result.setOrganizationId(saved.getOrganization().getId());
        return result;
    }

    public void deleteProduct(Long id) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product with id " + id + " not found"));

        Organization org = existing.getOrganization();
        if (org != null && org.getInventory() != null) {
            org.getInventory().removeIf(p -> p.getId() != null && p.getId().equals(id));
            organizationRepository.save(org);
        }

        productRepository.delete(existing);
    }

    public ProductDto findByAssetTag(String assetTag) {
        Product product = productRepository.findByAssetTag(assetTag);
        if (product == null) throw new IllegalArgumentException("Product with assetTag " + assetTag + " not found");
        ProductDto dto = modelMapper.map(product, ProductDto.class);
        if (product.getOrganization() != null) dto.setOrganizationId(product.getOrganization().getId());
        return dto;
    }

    public List<ProductDto> findByProductType(String type) {
        return productRepository.findByProductTypeContainingIgnoreCase(type).stream()
                .map(p -> {
                    ProductDto dto = modelMapper.map(p, ProductDto.class);
                    if (p.getOrganization() != null) dto.setOrganizationId(p.getOrganization().getId());
                    return dto;
                })
                .toList();
    }
}
