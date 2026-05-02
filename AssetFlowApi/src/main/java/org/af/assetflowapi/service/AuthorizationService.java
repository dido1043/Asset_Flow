package org.af.assetflowapi.service;

import lombok.RequiredArgsConstructor;
import org.af.assetflowapi.data.enums.RoleEnum;
import org.af.assetflowapi.data.model.*;
import org.af.assetflowapi.repository.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AuthorizationService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final ProductRepository productRepository;
    private final AssignmentRepository assignmentRepository;
    private final ProtocolRepository protocolRepository;

    private boolean isAdmin(User caller) {
        return caller.getRole() == RoleEnum.ADMIN;
    }

    private Long leaderIdOf(Organization org) {
        return org.getLeader() != null ? org.getLeader().getId() : null;
    }

    /** Caller must be the target user, or ADMIN. */
    public void requireSelfOrAdmin(User caller, Long targetUserId) {
        if (isAdmin(caller)) return;
        if (!caller.getId().equals(targetUserId))
            throw new AccessDeniedException("Access denied: you can only access your own resource.");
    }

    /** Caller must be the leader of the given org, or ADMIN. */
    public void requireOrgLeaderOrAdmin(User caller, Long orgId) {
        if (isAdmin(caller)) return;
        Organization org = organizationRepository.findById(orgId)
                .orElseThrow(() -> new IllegalArgumentException("Organization " + orgId + " not found"));
        if (!caller.getId().equals(leaderIdOf(org)))
            throw new AccessDeniedException("Access denied: you are not the leader of organization " + orgId);
    }

    /** Caller must be a member (any role) of the given org, or ADMIN. */
    public void requireOrgMemberOrAdmin(User caller, Long orgId) {
        if (isAdmin(caller)) return;
        User fresh = userRepository.findById(caller.getId())
                .orElseThrow(() -> new IllegalArgumentException("User " + caller.getId() + " not found"));
        if (fresh.getOrganization() == null || !fresh.getOrganization().getId().equals(orgId))
            throw new AccessDeniedException("Access denied: you are not a member of organization " + orgId);
    }

    /**
     * Caller must be the target user themselves, OR the leader of the target user's org, OR ADMIN.
     * Used for endpoints that expose a specific user's data (e.g. GET /auth/user/{userId}).
     */
    public void requireSelfOrSameOrgLeaderOrAdmin(User caller, Long targetUserId) {
        if (isAdmin(caller)) return;
        if (caller.getId().equals(targetUserId)) return;
        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("User " + targetUserId + " not found"));
        if (target.getOrganization() == null)
            throw new AccessDeniedException("Access denied.");
        Organization org = organizationRepository.findById(target.getOrganization().getId())
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));
        if (!caller.getId().equals(leaderIdOf(org)))
            throw new AccessDeniedException("Access denied: you are not the leader of this user's organization.");
    }

    /**
     * Caller must be the leader of the given employee's org, or ADMIN.
     * Used for create-assignment flows where the employee ID comes from the request body.
     */
    public void requireEmployeeOrgLeaderOrAdmin(User caller, Long employeeId) {
        if (isAdmin(caller)) return;
        User employee = userRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("User " + employeeId + " not found"));
        if (employee.getOrganization() == null)
            throw new AccessDeniedException("Access denied: target employee has no organization.");
        Organization org = organizationRepository.findById(employee.getOrganization().getId())
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));
        if (!caller.getId().equals(leaderIdOf(org)))
            throw new AccessDeniedException("Access denied: you are not the leader of this employee's organization.");
    }

    /** Caller must be the leader of the org that owns the product, or ADMIN. */
    public void requireProductOrgLeaderOrAdmin(User caller, Long productId) {
        if (isAdmin(caller)) return;
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product " + productId + " not found"));
        if (product.getOrganization() == null)
            throw new AccessDeniedException("Access denied: product has no organization.");
        Organization org = organizationRepository.findById(product.getOrganization().getId())
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));
        if (!caller.getId().equals(leaderIdOf(org)))
            throw new AccessDeniedException("Access denied: you are not the leader of the organization that owns this product.");
    }

    /**
     * Caller must be the assigned employee, OR the leader of the employee's org, OR ADMIN.
     * Used for read-only access to a single assignment.
     */
    public void requireAssignmentAccessOrAdmin(User caller, Long assignmentId) {
        if (isAdmin(caller)) return;
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assignment " + assignmentId + " not found"));
        User employee = assignment.getEmployee();
        if (caller.getId().equals(employee.getId())) return;
        if (employee.getOrganization() == null)
            throw new AccessDeniedException("Access denied.");
        Organization org = organizationRepository.findById(employee.getOrganization().getId())
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));
        if (!caller.getId().equals(leaderIdOf(org)))
            throw new AccessDeniedException("Access denied: you are not the employee or the org leader for this assignment.");
    }

    /** Caller must be the leader of the org that the assignment's employee belongs to, or ADMIN. */
    public void requireAssignmentOrgLeaderOrAdmin(User caller, Long assignmentId) {
        if (isAdmin(caller)) return;
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assignment " + assignmentId + " not found"));
        User employee = assignment.getEmployee();
        if (employee.getOrganization() == null)
            throw new AccessDeniedException("Access denied: assignment employee has no organization.");
        Organization org = organizationRepository.findById(employee.getOrganization().getId())
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));
        if (!caller.getId().equals(leaderIdOf(org)))
            throw new AccessDeniedException("Access denied: you are not the leader of this assignment's organization.");
    }

    /**
     * Caller must be the employee named in the protocol, OR the leader of the protocol's org, OR ADMIN.
     * Used for read/download access to a single protocol.
     */
    public void requireProtocolAccessOrAdmin(User caller, Long protocolId) {
        if (isAdmin(caller)) return;
        Protocol protocol = protocolRepository.findById(protocolId)
                .orElseThrow(() -> new IllegalArgumentException("Protocol " + protocolId + " not found"));
        if (caller.getId().equals(protocol.getEmployee().getId())) return;
        Organization org = organizationRepository.findById(protocol.getOrganization().getId())
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));
        if (!caller.getId().equals(leaderIdOf(org)))
            throw new AccessDeniedException("Access denied: you are not the employee or the org leader for this protocol.");
    }

    /** Caller must be the leader of the org that owns the protocol, or ADMIN. */
    public void requireProtocolOrgLeaderOrAdmin(User caller, Long protocolId) {
        if (isAdmin(caller)) return;
        Protocol protocol = protocolRepository.findById(protocolId)
                .orElseThrow(() -> new IllegalArgumentException("Protocol " + protocolId + " not found"));
        Organization org = organizationRepository.findById(protocol.getOrganization().getId())
                .orElseThrow(() -> new IllegalArgumentException("Organization not found"));
        if (!caller.getId().equals(leaderIdOf(org)))
            throw new AccessDeniedException("Access denied: you are not the leader of this protocol's organization.");
    }
}
