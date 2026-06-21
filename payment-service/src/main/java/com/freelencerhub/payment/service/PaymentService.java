package com.freelencerhub.payment.service;

import com.freelencerhub.payment.entity.Payment;
import com.freelencerhub.payment.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;

    @Autowired
    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Payment processPayment(Payment payment) {
        if (payment.getAmount() <= 0) {
            payment.setStatus("FAILED");
            return paymentRepository.save(payment);
        }

        // Initially lock funds in Escrow
        payment.setStatus("ESCROWED");
        payment.setTransactionId("TXN-ESC-" + System.currentTimeMillis());
        
        return paymentRepository.save(payment);
    }

    public Payment releasePayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        
        if ("ESCROWED".equals(payment.getStatus())) {
            payment.setStatus("COMPLETED");
            payment.setTransactionId("TXN-REL-" + System.currentTimeMillis());
            return paymentRepository.save(payment);
        }
        return payment;
    }

    public List<Payment> getPaymentsByProject(Long projectId) {
        return paymentRepository.findByProjectId(projectId);
    }

    public Double getTotalEarnings(Long freelancerId) {
        Double earnings = paymentRepository.getTotalEarningsByFreelancer(freelancerId);
        return earnings != null ? earnings : 0.0;
    }

    public Double getTotalSpent(List<Long> projectIds) {
        if (projectIds == null || projectIds.isEmpty()) return 0.0;
        Double spent = paymentRepository.getTotalSpentByProjects(projectIds);
        return spent != null ? spent : 0.0;
    }
}
