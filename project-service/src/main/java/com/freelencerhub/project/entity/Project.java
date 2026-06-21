package com.freelencerhub.project.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import javax.persistence.*;

@Entity
@Table(name = "projects")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Budget is required")
    @Min(value = 0, message = "Budget must be a positive value")
    private Double budget;

    @NotNull(message = "Client ID is required")
    private Long clientId;

    private Long freelancerId;

    @Column(nullable = false)
    private String status = "PENDING";

    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = java.time.LocalDateTime.now();
    }

    // Constructor for tests
    public Project(Long id, String title, String description, Double budget, Long clientId) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.budget = budget;
        this.clientId = clientId;
        this.status = "PENDING";
        this.createdAt = java.time.LocalDateTime.now();
    }
}
