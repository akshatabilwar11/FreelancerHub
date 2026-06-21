package com.freelencerhub.project.service;

import com.freelencerhub.project.client.NotificationClient;
import com.freelencerhub.project.client.PaymentClient;
import com.freelencerhub.project.client.UserClient;
import com.freelencerhub.project.dto.NotificationDTO;
import com.freelencerhub.project.dto.UserDTO;
import com.freelencerhub.project.entity.Project;
import com.freelencerhub.project.repository.ProjectRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserClient userClient;
    private final NotificationClient notificationClient;
    private final PaymentClient paymentClient;

    @Autowired
    public ProjectService(ProjectRepository projectRepository, UserClient userClient, 
                          NotificationClient notificationClient, PaymentClient paymentClient) {
        this.projectRepository = projectRepository;
        this.userClient = userClient;
        this.notificationClient = notificationClient;
        this.paymentClient = paymentClient;
    }

    public Page<Project> getAllProjects(Pageable pageable) {
        return projectRepository.findAll(pageable);
    }

    public Project createProject(Project project) {
        log.info("Attempting to create project: {} for client: {}", project.getTitle(), project.getClientId());
        
        try {
            UserDTO client = userClient.getUserById(project.getClientId());
            if (client == null) {
                log.warn("User lookup returned null for client ID: {}", project.getClientId());
            } else {
                log.info("Client validated: {}", client.getName());
            }
        } catch (Exception e) {
            log.error("External client validation failed for ID: {}. Error: {}. Proceeding with creation.", 
                      project.getClientId(), e.getMessage());
        }

        Project savedProject = projectRepository.save(project);
        log.info("Project saved successfully with ID: {}", savedProject.getId());

        try {
            NotificationDTO notification = new NotificationDTO(null, project.getClientId(), 
                "New project created: " + project.getTitle(), false);
            notificationClient.sendNotification(notification);
            log.info("Notification sent for project: {}", savedProject.getId());
        } catch (Exception e) {
            log.error("Failed to send notification for project: {}", savedProject.getId(), e);
        }

        return savedProject;
    }

    public Optional<Project> getProjectById(Long id) {
        return projectRepository.findById(id);
    }

    public List<Project> getProjectsByClient(Long clientId) {
        return projectRepository.findByClientId(clientId);
    }

    public long getActiveHiresCount(Long clientId) {
        return projectRepository.countByClientIdAndStatus(clientId, "ACTIVE");
    }

    public Project activateProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!"PENDING".equals(project.getStatus())) {
            throw new RuntimeException("Project is already " + project.getStatus());
        }

        List<com.freelencerhub.project.dto.PaymentDTO> payments = paymentClient.getPaymentsByProject(id);
        boolean isPaid = payments.stream().anyMatch(p -> 
            "COMPLETED".equals(p.getStatus()) || "ESCROWED".equals(p.getStatus()));

        if (isPaid) {
            project.setStatus("ACTIVE");
            log.info("Project {} activated successfully.", id);
            return projectRepository.save(project);
        } else {
            throw new RuntimeException("No completed payment found for project: " + id);
        }
    }

    public void deleteProject(Long id) {
        log.info("Deleting project with ID: {}", id);
        projectRepository.deleteById(id);
    }

    public String getFreelancerAvailability(Long freelancerId) {
        long activeCount = projectRepository.countByFreelancerIdAndStatus(freelancerId, "ACTIVE");
        if (activeCount == 0) return "AVAILABLE";
        if (activeCount <= 2) return "BUSY";
        return "OVERLOADED";
    }
}
