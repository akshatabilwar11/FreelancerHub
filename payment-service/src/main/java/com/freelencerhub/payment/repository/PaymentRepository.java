package com.freelencerhub.payment.repository;

import com.freelencerhub.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByProjectId(Long projectId);
    List<Payment> findByFreelancerId(Long freelancerId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(p.amount) FROM Payment p WHERE p.freelancerId = :freelancerId AND p.status = 'COMPLETED'")
    Double getTotalEarningsByFreelancer(Long freelancerId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(p.amount) FROM Payment p WHERE p.projectId IN :projectIds AND (p.status = 'COMPLETED' OR p.status = 'ESCROWED')")
    Double getTotalSpentByProjects(java.util.List<Long> projectIds);
}
