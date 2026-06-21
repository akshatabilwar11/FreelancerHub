package com.freelencerhub.project.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDTO {
    private Long id;
    private Long projectId;
    private Long freelancerId;
    private Double amount;
    private String status;
}
