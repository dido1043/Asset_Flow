package org.af.assetflowapi.data.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Entity
@Table(name = "organization")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organization_name", unique = true, nullable = false)
    private String organizationName;

    // One-to-One or Many-to-One relationship with Leader (now User)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leader_id")
    private User leader;

    // One-to-Many: Organization owns many Employees (now Users)
    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL)
    @JsonIgnore // Prevent infinite recursion in JSON
    private List<User> employees;

    // One-to-Many: Organization owns many Products (Inventory)
    @OneToMany(mappedBy = "organization", cascade = CascadeType.ALL)
    @JsonIgnore
    private List<Product> inventory;
}