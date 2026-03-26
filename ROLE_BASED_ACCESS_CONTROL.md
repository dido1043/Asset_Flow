# Role-Based Access Control Implementation

## Overview
This document outlines the role-based permission system implemented in AssetFlow with three roles: **EMPLOYEE**, **LEADER**, and **ADMIN**.

---

## Role Permissions Summary

| Feature | EMPLOYEE | LEADER | ADMIN |
|---------|----------|--------|-------|
| View Own Assets | ✅ | ✅ | ✅ |
| View Company Assets | ❌ | ✅ | ✅ |
| View All Assets | ❌ | ❌ | ✅ |
| View Own Assignments | ✅ | ✅ | ✅ |
| View Company Assignments | ❌ | ✅ | ✅ |
| View All Assignments | ❌ | ❌ | ✅ |
| View Company Protocols | ❌ | ✅ | ✅ |
| View All Protocols | ❌ | ❌ | ✅ |
| View Company Users | ❌ | ✅ | ✅ |
| View All Users | ❌ | ❌ | ✅ |
| Manage Users | ❌ | ❌ | ✅ |
| Manage Assets | ❌ | ✅ | ✅ |
| Manage Assignments | ❌ | ✅ | ✅ |
| Create Protocols | ❌ | ✅ | ✅ |

---

## Backend Endpoints (Fully Implemented)

### Authentication Endpoints

#### Get All Users (ADMIN only)
```
GET /auth/users
Response: List<UserDto>
```
- Returns all users in the system
- Should be restricted to ADMIN role

#### Get Single User
```
GET /auth/user/{userId}
Response: UserDto
```
- Returns user details by ID
- Should verify user can view this user (self, same org, or admin)

#### Get Users by Organization (LEADER/ADMIN)
```
GET /auth/users/org/{orgId}
Response: List<UserDto>
```
- Returns all users in a specific organization
- **LEADER** can only view users in their own organization
- **ADMIN** can view users from any organization
- **EMPLOYEE** cannot access this endpoint

---

### Product/Inventory Endpoints

#### Get Organization Inventory (LEADER/ADMIN)
```
GET /org/inventory/{organizationId}
Response: List<ProductDto>
```
- Returns all products belonging to an organization
- **LEADER** can only view inventory for their organization
- **ADMIN** can view any organization's inventory
- **EMPLOYEE** should not access this endpoint

#### Get All Products (ADMIN only)
```
GET /product/all
Response: List<ProductDto>
```
- Returns all products in the system
- Should be restricted to ADMIN role

---

### Assignment Endpoints

#### Get User's Assignments (EMPLOYEE/LEADER/ADMIN)
```
GET /assignment/user/{userId}
Response: List<AssignmentDto>
```
- **EMPLOYEE** can only view their own assignments
- **LEADER** can view assignments for users in their organization
- **ADMIN** can view any user's assignments

#### Get Organization Assignments (LEADER/ADMIN)
```
GET /assignment/org/{orgId}
Response: List<AssignmentDto>
```
- Returns all assignments for a specific organization
- Uses custom JPQL query to join through Product → Organization
- **LEADER** can only view assignments for their organization
- **ADMIN** can view any organization's assignments

#### Get Currently Assigned Assets (EMPLOYEE/LEADER/ADMIN)
```
GET /assignment/current
Response: List<AssignmentDto>
```
- Returns assignments where `dateReturned` is NULL
- **EMPLOYEE** sees only their current assignments
- **LEADER** sees all current assignments in their organization
- **ADMIN** sees all current assignments system-wide

#### Get All Assignments (ADMIN only)
```
GET /assignment/all
Response: List<AssignmentDto>
```
- Returns all assignments in the system
- Should be restricted to ADMIN role

---

### Protocol Endpoints

#### Get Protocol by ID
```
GET /protocol/{protocolId}
Response: ProtocolDto
```
- Returns a specific protocol
- Should verify user can view this protocol

#### Get Organization Protocols (LEADER/ADMIN)
```
GET /protocol/org/{orgId}
Response: List<ProtocolDto>
```
- Returns all protocols for a specific organization
- **LEADER** can only view protocols for their organization
- **ADMIN** can view any organization's protocols

#### Create Protocol (LEADER/ADMIN)
```
POST /protocol/create/{organizationId}/user/{userId}
Response: ProtocolDto
```
- Creates a new protocol for an organization
- **LEADER** can only create protocols for their organization
- **ADMIN** can create protocols for any organization

---

## Database Schema - Key Relationships

### Assignment Entity (Fix Applied)
```java
@Entity
public class Assignment {
    @Id
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "employee_id")
    private User employee;
    
    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;  // ← Links to organization through this
    
    private ZonedDateTime dateAssigned;
    private ZonedDateTime dateReturned;
}
```

### How to Query by Organization
Since `Assignment` doesn't have a direct `organizationId`, we use:
```java
@Query("SELECT a FROM Assignment a JOIN a.product p WHERE p.organization.id = :organizationId")
List<Assignment> findByOrganizationId(@Param("organizationId") Long organizationId);
```

### Related Entities
- **Product** has `@ManyToOne Organization`
- **Protocol** has `@ManyToOne Organization`
- **User** has `@ManyToOne Organization` (organization_id column)

---

## Repository Methods (All Implemented)

### UserRepository
```java
Optional<User> findByEmail(String email);
Optional<List<User>> findByOrganizationId(Long organizationId);
```

### AssignmentRepository ✅ FIXED
```java
List<Assignment> findByEmployeeId(Long employeeId);
List<Assignment> findByProductId(Long productId);
List<Assignment> findByDateReturnedIsNull();
@Query("SELECT a FROM Assignment a JOIN a.product p WHERE p.organization.id = :organizationId")
List<Assignment> findByOrganizationId(@Param("organizationId") Long organizationId);
```

### ProtocolRepository
```java
List<Protocol> findByEmployeeId(UUID employeeId);
List<Protocol> findByOrganizationId(Long organizationId);
Protocol findByProtocolUri(String protocolUri);
```

### ProductRepository
```java
List<Product> findByOrganizationId(Long organizationId);
```

---

## Service Layer Methods (All Implemented)

### AuthenticationService
```java
public List<UserDto> getUsers();
public UserDto getUser(Long userId);
public List<UserDto> getUsersByOrganization(Long organizationId);
```

### AssignmentService
```java
public List<AssignmentDto> getUserAssignments(Long userId);
public List<AssignmentDto> getAssignmentsByProduct(Long productId);
public List<AssignmentDto> getAssignmentsByOrganization(Long organizationId);
public List<AssignmentDto> getCurrentlyAssigned();
public List<AssignmentDto> getAllAssignments();
```

### ProtocolService
```java
public List<ProtocolDto> getProtocolsByOrganization(Long organizationId);
public ProtocolDto getProtocolById(Long id);
public ProtocolDto createProtocol(Long organizationId, Long userId);
```

### OrganizationService
```java
public List<ProductDto> getOrganizationProducts(Long organizationId);
```

---

## Frontend Integration

### useAccountWorkspace Hook Updates

Add these permission helpers:
```typescript
const getPermissions = React.useMemo(() => {
  const role = currentUser?.role || session?.role;
  
  return {
    canManageUsers: role === "ADMIN",
    canManageOrganizations: role === "ADMIN" || role === "LEADER",
    canViewAllProducts: role === "ADMIN",
    canViewCompanyProducts: role === "ADMIN" || role === "LEADER",
    canViewOwnProducts: role === "EMPLOYEE",
    canManageProtocols: role === "ADMIN" || role === "LEADER",
    canViewAllAssignments: role === "ADMIN",
    canViewCompanyAssignments: role === "ADMIN" || role === "LEADER",
    canViewOwnAssignments: role === "EMPLOYEE",
  };
}, [currentUser?.role, session?.role]);
```

### Data Filtering Examples

```typescript
// Filter products based on role
const getVisibleProducts = React.useMemo(() => {
  const role = currentUser?.role || session?.role;
  
  if (role === "ADMIN") return products;
  if (role === "LEADER") {
    return products.filter(p => p.organizationId === currentUser?.organizationId);
  }
  if (role === "EMPLOYEE") {
    return products.filter(p => 
      currentAssignments.some(a => a.productId === p.id && a.employeeId === currentUser?.id)
    );
  }
  return [];
}, [products, currentAssignments, currentUser, session?.role]);

// Filter assignments based on role
const getVisibleAssignments = React.useMemo(() => {
  const role = currentUser?.role || session?.role;
  
  if (role === "ADMIN") return assignments;
  if (role === "LEADER") {
    return assignments.filter(a => {
      const assignee = users.find(u => u.id === a.employeeId);
      return assignee?.organizationId === currentUser?.organizationId;
    });
  }
  if (role === "EMPLOYEE") {
    return assignments.filter(a => a.employeeId === currentUser?.id);
  }
  return [];
}, [assignments, users, currentUser, session?.role]);
```

---

## Security Best Practices

### ✅ Implemented
1. ✅ Repository layer supports organization-filtered queries
2. ✅ Service layer provides role-aware data retrieval
3. ✅ Controller endpoints properly map to services
4. ✅ Frontend can request org-scoped data

### ⚠️ Still Needed
1. Add Spring Security `@PreAuthorize` annotations on controller methods
2. Implement authorization checks in services
3. Add audit logging for sensitive operations
4. Validate user's organization membership before returning data

### Recommended Spring Security Configuration

```java
@GetMapping("/users/org/{orgId}")
@PreAuthorize("hasRole('ADMIN') or (@authService.isLeaderOfOrganization(#orgId))")
public ResponseEntity<List<UserDto>> getUsersByOrganization(@PathVariable Long orgId) {
    return ResponseEntity.ok(authenticationService.getUsersByOrganization(orgId));
}

@GetMapping("/assignment/org/{orgId}")
@PreAuthorize("hasRole('ADMIN') or (@authService.isLeaderOfOrganization(#orgId))")
public ResponseEntity<List<AssignmentDto>> getAssignmentsByOrganization(@PathVariable Long orgId) {
    return ResponseEntity.ok(assignmentService.getAssignmentsByOrganization(orgId));
}

@GetMapping("/protocol/org/{orgId}")
@PreAuthorize("hasRole('ADMIN') or (@authService.isLeaderOfOrganization(#orgId))")
public ResponseEntity<List<ProtocolDto>> getProtocolsByOrganization(@PathVariable Long orgId) {
    return ResponseEntity.ok(protocolService.getProtocolsByOrganization(orgId));
}
```

---

## Testing

Run the test suite to validate:
```bash
mvn test
```

Key test class:
- `ProductRepositoryIntegrationTest.java` - Tests `findByOrganizationId()`

---

## Fix Applied

### Bug Fixed: Assignment findByOrganizationId

**Error:** `QueryCreationException: No property 'organizationId' found for type 'Assignment'`

**Root Cause:** Assignment entity doesn't have direct `organizationId` field

**Solution:** Implemented custom JPQL query:
```java
@Query("SELECT a FROM Assignment a JOIN a.product p WHERE p.organization.id = :organizationId")
List<Assignment> findByOrganizationId(@Param("organizationId") Long organizationId);
```

This query joins the Assignment with Product and filters by the organization relationship.

---

## Next Steps

1. **Add Spring Security annotations** to controller methods
2. **Implement authorization service** to check organization membership
3. **Add audit logging** for sensitive operations
4. **Update frontend** to use `getPermissions` helper
5. **Add API tests** for role-based access control
