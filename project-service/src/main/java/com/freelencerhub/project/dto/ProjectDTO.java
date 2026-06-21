package com.freelencerhub.project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDTO {
    private Long id;

    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title cannot exceed 100 characters")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Budget is required")
    @Min(value = 0, message = "Budget must be a positive value")
    private Double budget;

    @NotNull(message = "Client ID is required")
    private Long clientId;

    private String status;

    private Long freelancerId;

    private java.time.LocalDateTime createdAt;

    // Constructor for tests (5-arg, sets defaults for status and createdAt)
    public ProjectDTO(Long id, String title, String description, Double budget, Long clientId) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.budget = budget;
        this.clientId = clientId;
        this.status = "PENDING";
        this.createdAt = java.time.LocalDateTime.now();
    }
}
