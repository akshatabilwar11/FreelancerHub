package com.freelencerhub.project.service;

import com.freelencerhub.project.client.NotificationClient;
import com.freelencerhub.project.client.PaymentClient;
import com.freelencerhub.project.client.UserClient;
import com.freelencerhub.project.dto.NotificationDTO;
import com.freelencerhub.project.dto.PaymentDTO;
import com.freelencerhub.project.dto.UserDTO;
import com.freelencerhub.project.entity.Project;
import com.freelencerhub.project.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private UserClient userClient;

    @Mock
    private NotificationClient notificationClient;

    @Mock
    private PaymentClient paymentClient;

    @InjectMocks
    private ProjectService projectService;

    private Project project;
    private UserDTO userDTO;

    @BeforeEach
    void setUp() {
        project = new Project(1L, "Title", "Desc", 500.0, 1L, null, "PENDING", null);
        userDTO = new UserDTO(1L, "Client Name", "client@test.com", Arrays.asList("CLIENT"));
    }

    @Test
    void testGetAllProjects() {
        Page<Project> page = new PageImpl<>(Arrays.asList(project));
        when(projectRepository.findAll(any(PageRequest.class))).thenReturn(page);
        Page<Project> result = projectService.getAllProjects(PageRequest.of(0, 10));
        assertEquals(1, result.getTotalElements());
        verify(projectRepository, times(1)).findAll(any(PageRequest.class));
    }

    @Test
    void testCreateProject_Success() {
        when(userClient.getUserById(1L)).thenReturn(userDTO);
        when(projectRepository.save(any(Project.class))).thenReturn(project);

        Project result = projectService.createProject(project);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(userClient, times(1)).getUserById(1L);
        verify(projectRepository, times(1)).save(any(Project.class));
        verify(notificationClient, times(1)).sendNotification(any(NotificationDTO.class));
    }

    @Test
    void testCreateProject_ClientNotFound() {
        // Now it should NOT throw exception, just log error and proceed
        when(userClient.getUserById(1L)).thenReturn(null);
        when(projectRepository.save(any(Project.class))).thenReturn(project);

        Project result = projectService.createProject(project);
        
        assertNotNull(result);
        verify(projectRepository, times(1)).save(any(Project.class));
    }

    @Test
    void testCreateProject_NotificationFailure() {
        when(userClient.getUserById(1L)).thenReturn(userDTO);
        when(projectRepository.save(any(Project.class))).thenReturn(project);
        doThrow(new RuntimeException("Notification failed")).when(notificationClient).sendNotification(any(NotificationDTO.class));

        // Should not throw exception, just log error
        Project result = projectService.createProject(project);

        assertNotNull(result);
        verify(notificationClient, times(1)).sendNotification(any(NotificationDTO.class));
    }

    @Test
    void testGetProjectById() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        Optional<Project> result = projectService.getProjectById(1L);
        assertTrue(result.isPresent());
        assertEquals(1L, result.get().getId());
    }

    @Test
    void testGetProjectsByClient() {
        when(projectRepository.findByClientId(1L)).thenReturn(Arrays.asList(project));
        List<Project> result = projectService.getProjectsByClient(1L);
        assertEquals(1, result.size());
    }

    @Test
    void testActivateProject_Success() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        PaymentDTO payment = new PaymentDTO(1L, 1L, 2L, 500.0, "COMPLETED");
        when(paymentClient.getPaymentsByProject(1L)).thenReturn(Arrays.asList(payment));
        when(projectRepository.save(any(Project.class))).thenAnswer(i -> i.getArguments()[0]);

        Project result = projectService.activateProject(1L);

        assertEquals("ACTIVE", result.getStatus());
        verify(projectRepository, times(1)).save(any(Project.class));
    }

    @Test
    void testActivateProject_NotFound() {
        when(projectRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> projectService.activateProject(1L));
    }

    @Test
    void testActivateProject_AlreadyActive() {
        project.setStatus("ACTIVE");
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            projectService.activateProject(1L);
        });

        assertTrue(exception.getMessage().contains("already ACTIVE"));
    }

    @Test
    void testActivateProject_NoPayment() {
        when(projectRepository.findById(1L)).thenReturn(Optional.of(project));
        when(paymentClient.getPaymentsByProject(1L)).thenReturn(Arrays.asList());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            projectService.activateProject(1L);
        });

        assertTrue(exception.getMessage().contains("No completed payment found"));
    }

    @Test
    void testGetActiveHiresCount() {
        when(projectRepository.countByClientIdAndStatus(1L, "ACTIVE")).thenReturn(5L);
        long count = projectService.getActiveHiresCount(1L);
        assertEquals(5L, count);
    }

    @Test
    void testDeleteProject() {
        doNothing().when(projectRepository).deleteById(1L);
        projectService.deleteProject(1L);
        verify(projectRepository, times(1)).deleteById(1L);
    }

    @Test
    void testGetFreelancerAvailability_Available() {
        when(projectRepository.countByFreelancerIdAndStatus(1L, "ACTIVE")).thenReturn(0L);
        String availability = projectService.getFreelancerAvailability(1L);
        assertEquals("AVAILABLE", availability);
    }

    @Test
    void testGetFreelancerAvailability_Busy() {
        when(projectRepository.countByFreelancerIdAndStatus(1L, "ACTIVE")).thenReturn(2L);
        String availability = projectService.getFreelancerAvailability(1L);
        assertEquals("BUSY", availability);
    }

    @Test
    void testGetFreelancerAvailability_Overloaded() {
        when(projectRepository.countByFreelancerIdAndStatus(1L, "ACTIVE")).thenReturn(3L);
        String availability = projectService.getFreelancerAvailability(1L);
        assertEquals("OVERLOADED", availability);
    }
}
