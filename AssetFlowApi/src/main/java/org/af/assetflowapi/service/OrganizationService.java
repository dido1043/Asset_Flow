package org.af.assetflowapi.service;

import lombok.AllArgsConstructor;
import java.util.List;

import org.af.assetflowapi.data.dto.ProductDto;
import org.af.assetflowapi.data.dto.OrganizationDto;
import org.af.assetflowapi.data.model.Organization;
import org.af.assetflowapi.data.model.Product;
import org.af.assetflowapi.data.model.User;
import org.af.assetflowapi.repository.OrganizationRepository;
import org.af.assetflowapi.repository.ProductRepository;
import org.af.assetflowapi.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class OrganizationService {
    private final OrganizationRepository organizationRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    public OrganizationDto createOrganization(Long leaderId, OrganizationDto dto) {
        User leader = userRepository.findById(leaderId)
                .orElseThrow(() -> new IllegalArgumentException("User with id " + leaderId + " not found"));
        Organization organization = modelMapper.map(dto, Organization.class);
        organization.setLeader(leader);
        leader.setOrganization(organization);
        return modelMapper.map(organizationRepository.save(organization), OrganizationDto.class);
    }
    public OrganizationDto getOrganizationByLeaderId(Long leaderId) {
        try{
            Organization organization = organizationRepository.findByLeaderId(leaderId);
            return modelMapper.map(organization, OrganizationDto.class);
        }catch (Exception e){
            throw new IllegalStateException("Organization with id " + leaderId + " not found");
        }
    }

    public void becomeLeader(Long userId, Long organizationId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User with id " + userId + " not found"));
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Organization with id " + organizationId + " not found"));
        //Send email to previous leader
        organization.setLeader(user);
        user.setOrganization(organization);
        organizationRepository.save(organization);
        userRepository.save(user);
    }

    public OrganizationDto addEmployeeToOrganization(Long organizationId, Long userId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new IllegalArgumentException("Organization with id " + organizationId + " not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User with id " + userId + " not found"));
        organization.getEmployees().add(user);
        user.setOrganization(organization);
        userRepository.save(user);
        organizationRepository.save(organization);
        return modelMapper.map(organization, OrganizationDto.class);
    }

    public List<ProductDto> getOrganizationProducts(Long organizationId) {
        List<Product> products = productRepository.findByOrganizationId(organizationId);
        return products.stream()
                .map(product -> {
                    ProductDto dto = modelMapper.map(product, ProductDto.class);
                    if (product.getOrganization() != null) dto.setOrganizationId(product.getOrganization().getId());
                    return dto;
                })
                .toList();
    }


    private ProductDto mapToDto(Long organizationId, Product product) {
        ProductDto dto = modelMapper.map(product, ProductDto.class);
        dto.setOrganizationId(organizationId);
        return dto;
    }
}
