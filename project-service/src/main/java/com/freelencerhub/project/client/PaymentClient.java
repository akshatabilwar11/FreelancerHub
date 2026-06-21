package com.freelencerhub.project.client;

import com.freelencerhub.project.dto.PaymentDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "payment-service")
public interface PaymentClient {

    @GetMapping("/payments/project/{projectId}")
    List<PaymentDTO> getPaymentsByProject(@PathVariable("projectId") Long projectId);
}
