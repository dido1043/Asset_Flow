package org.af.assetflowapi.service;

import org.af.assetflowapi.data.dto.ProductDto;
import org.af.assetflowapi.data.model.Organization;
import org.af.assetflowapi.data.model.Product;
import org.af.assetflowapi.repository.OrganizationRepository;
import org.af.assetflowapi.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.modelmapper.ModelMapper;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    ProductRepository productRepository;

    @Mock
    OrganizationRepository organizationRepository;

    @Mock
    ModelMapper modelMapper;

    @InjectMocks
    ProductService productService;

    Product product;
    ProductDto productDto;

    @BeforeEach
    void setUp() {
        product = new Product();
        product.setId(1L);
        product.setProductType("Laptop");
        product.setAssetTag("AT-123");

        productDto = new ProductDto();
        productDto.setId(1L);
        productDto.setProductType("Laptop");
        productDto.setAssetTag("AT-123");
    }

    @Test
    void getAllProducts_mapsOrganizationId() {
        Organization org = new Organization();
        org.setId(5L);
        product.setOrganization(org);

        when(productRepository.findAll()).thenReturn(List.of(product));
        when(modelMapper.map(any(), eq(ProductDto.class))).thenReturn(new ProductDto());

        List<ProductDto> results = productService.getAllProducts();

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals(5L, results.get(0).getOrganizationId());

        verify(productRepository, times(1)).findAll();
    }

    @Test
    void addProduct_withOrganization_savesAndReturnsDto() {
        Organization org = new Organization();
        org.setId(10L);
        productDto.setOrganizationId(10L);

        when(modelMapper.map(productDto, Product.class)).thenReturn(product);
        when(organizationRepository.findById(10L)).thenReturn(Optional.of(org));
        when(productRepository.save(product)).thenReturn(product);
        when(modelMapper.map(product, ProductDto.class)).thenReturn(productDto);

        ProductDto result = productService.addProduct(productDto);

        assertNotNull(result);
        assertEquals(productDto.getId(), result.getId());
        verify(productRepository, times(1)).save(product);
    }

    @Test
    void getProduct_whenNotFound_throws() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> productService.getProduct(99L));
        assertTrue(ex.getMessage().contains("Product with id 99 not found"));
    }

}

