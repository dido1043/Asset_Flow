package org.af.assetflowapi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.af.assetflowapi.data.dto.ProductDto;
import org.af.assetflowapi.service.ProductService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class ProductControllerTest {

    MockMvc mockMvc;

    @Mock
    ProductService productService;

    @InjectMocks
    ProductController productController;

    ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(productController).build();
    }

    @Test
    void getAllProducts_returnsList() throws Exception {
        ProductDto dto = new ProductDto(1L, "Laptop", "Brand", "Model", "AT-1", null);
        when(productService.getAllProducts()).thenReturn(List.of(dto));

        mockMvc.perform(get("/product/all").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1));
    }

    @Test
    void createProduct_returnsCreated() throws Exception {
        ProductDto dto = new ProductDto(null, "Laptop", "Brand", "Model", "AT-2", null);
        ProductDto created = new ProductDto(5L, "Laptop", "Brand", "Model", "AT-2", null);
        when(productService.addProduct(any(ProductDto.class))).thenReturn(created);

        mockMvc.perform(post("/product").contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(5));
    }
}
