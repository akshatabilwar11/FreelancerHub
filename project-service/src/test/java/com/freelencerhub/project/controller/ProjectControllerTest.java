package com.freelencerhub.project.controller;

import com.freelencerhub.project.dto.ProjectDTO;
import com.freelencerhub.project.entity.Project;
import com.freelencerhub.project.service.ProjectService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProjectControllerTest {

    @Mock
    private ProjectService projectService;

    @InjectMocks
    private ProjectController projectController;

    @Test
    void testGetAllProjects() {
        Project p = new Project(1L, "Title", "Desc", 500.0, 1L, null, "PENDING", null);
        Page<Project> page = new PageImpl<>(Arrays.asList(p));
        when(projectService.getAllProjects(any(PageRequest.class))).thenReturn(page);
        Page<ProjectDTO> resultPage = projectController.getAllProjects(PageRequest.of(0, 10));
        assertEquals(1, resultPage.getTotalElements());
        assertEquals("Title", resultPage.getContent().get(0).getTitle());
    }

    @Test
    void testCreateProject() {
        Project p = new Project(null, "Title", "Desc", 500.0, 1L, null, "PENDING", null);
        Project saved = new Project(1L, "Title", "Desc", 500.0, 1L, null, "PENDING", null);
        when(projectService.createProject(any(Project.class))).thenReturn(saved);
        ProjectDTO result = projectController.createProject(p, "CLIENT");
        assertEquals(1L, result.getId());
    }

    @Test
    void testGetProjectById() {
        Project p = new Project(1L, "Title", "Desc", 500.0, 1L, null, "PENDING", null);
        when(projectService.getProjectById(1L)).thenReturn(Optional.of(p));
        ResponseEntity<ProjectDTO> result = projectController.getProjectById(1L);
        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertNotNull(result.getBody());
        assertEquals("Title", result.getBody().getTitle());
    }
    
    @Test
    void testGetProjectById_NotFound() {
        when(projectService.getProjectById(anyLong())).thenReturn(Optional.empty());
        ResponseEntity<ProjectDTO> result = projectController.getProjectById(99L);
        assertEquals(HttpStatus.NOT_FOUND, result.getStatusCode());
    }
    
    @Test
    void testGetProjectsByClient() {
        Project p = new Project(1L, "Title", "Desc", 500.0, 1L, null, "PENDING", null);
        when(projectService.getProjectsByClient(1L)).thenReturn(Arrays.asList(p));
        List<ProjectDTO> list = projectController.getProjectsByClient(1L);
        assertEquals(1, list.size());
        assertEquals(1L, list.get(0).getId());
    }

    @Test
    void testActivateProject() {
        Project p = new Project(1L, "Title", "Desc", 500.0, 1L, null, "ACTIVE", null);
        when(projectService.activateProject(1L)).thenReturn(p);
        ResponseEntity<ProjectDTO> result = projectController.activateProject(1L);
        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals("ACTIVE", result.getBody().getStatus());
    }
}
