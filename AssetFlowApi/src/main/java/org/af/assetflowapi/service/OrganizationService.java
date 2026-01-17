package org.af.assetflowapi.service;

import lombok.AllArgsConstructor;
import org.af.assetflowapi.data.dto.OrganizationDto;
import org.af.assetflowapi.data.model.Organization;
import org.af.assetflowapi.data.model.User;
import org.af.assetflowapi.repository.OrganizationRepository;
import org.af.assetflowapi.repository.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class OrganizationService {
    private final OrganizationRepository organizationRepository;
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

}
