package com.freelencerhub.common.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentEvent implements Serializable {
    private Long paymentId;
    private Long projectId;
    private Long freelancerId;
    private Double amount;
    private String status;
}
