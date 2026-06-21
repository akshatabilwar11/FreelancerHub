package com.freelencerhub.project.repository;

import com.freelencerhub.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByClientId(Long clientId);
    long countByClientIdAndStatus(Long clientId, String status);
    long countByFreelancerIdAndStatus(Long freelancerId, String status);
}
