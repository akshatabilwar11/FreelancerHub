package com.freelencerhub.payment.controller;

import com.freelencerhub.payment.dto.PaymentDTO;
import com.freelencerhub.payment.entity.Payment;
import com.freelencerhub.payment.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService paymentService;
    @Autowired
    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    public List<PaymentDTO> getAllPayments() {
        return paymentService.getAllPayments().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @PostMapping
    public PaymentDTO processPayment(@Valid @RequestBody Payment payment) {
        Payment savedPayment = paymentService.processPayment(payment);
        return mapToDTO(savedPayment);
    }

    @PostMapping("/{id}/release")
    public PaymentDTO releasePayment(@PathVariable Long id) {
        Payment releasedPayment = paymentService.releasePayment(id);
        return mapToDTO(releasedPayment);
    }

    @GetMapping("/project/{projectId}")
    public List<PaymentDTO> getPaymentsByProject(@PathVariable Long projectId) {
        return paymentService.getPaymentsByProject(projectId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/stats/freelancer/{freelancerId}")
    public Double getFreelancerEarnings(@PathVariable Long freelancerId) {
        return paymentService.getTotalEarnings(freelancerId);
    }

    @PostMapping("/stats/projects")
    public Double getProjectsSpent(@RequestBody List<Long> projectIds) {
        return paymentService.getTotalSpent(projectIds);
    }

    private PaymentDTO mapToDTO(Payment p) {
        return new PaymentDTO(p.getId(), p.getProjectId(), p.getFreelancerId(), p.getAmount(), p.getStatus(), p.getTransactionId());
    }
}
