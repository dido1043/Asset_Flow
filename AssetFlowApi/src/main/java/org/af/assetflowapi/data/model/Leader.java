package org.af.assetflowapi.data.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Entity
@Table(name = "leader")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Leader {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    private Integer age;

    // You can optionally add a list of Organizations here if needed
     @OneToMany(mappedBy = "leader")
     private List<Organization> organizations;
}