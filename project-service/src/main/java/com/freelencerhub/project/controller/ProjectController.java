package com.freelencerhub.project.controller;

import com.freelencerhub.project.dto.ProjectDTO;
import com.freelencerhub.project.entity.Project;
import com.freelencerhub.project.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/projects")
public class ProjectController {

    private final ProjectService projectService;
    @Autowired
    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public Page<ProjectDTO> getAllProjects(Pageable pageable) {
        return projectService.getAllProjects(pageable).map(this::mapToDTO);
    }

    @PostMapping
    public ProjectDTO createProject(@Valid @RequestBody Project project, @RequestHeader(value = "X-User-Role", required = false) String role) {
        if (role != null && !role.equals("CLIENT") && !role.equals("ROLE_CLIENT")) {
            throw new RuntimeException("Only Clients can create projects");
        }
        Project savedProject = projectService.createProject(project);
        return mapToDTO(savedProject);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectDTO> getProjectById(@PathVariable Long id) {
        return projectService.getProjectById(id)
                .map(project -> ResponseEntity.ok(mapToDTO(project)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/client/{clientId}")
    public List<ProjectDTO> getProjectsByClient(@PathVariable Long clientId) {
        return projectService.getProjectsByClient(clientId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/client/{clientId}/active-hires")
    public long getActiveHiresCount(@PathVariable Long clientId) {
        return projectService.getActiveHiresCount(clientId);
    }

    @PutMapping("/{id}/activate")
    public ResponseEntity<ProjectDTO> activateProject(@PathVariable Long id) {
        return ResponseEntity.ok(mapToDTO(projectService.activateProject(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/freelancer/{id}/availability")
    public ResponseEntity<String> getAvailability(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getFreelancerAvailability(id));
    }

    private ProjectDTO mapToDTO(Project p) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(p.getId());
        dto.setTitle(p.getTitle());
        dto.setDescription(p.getDescription());
        dto.setBudget(p.getBudget());
        dto.setClientId(p.getClientId());
        dto.setFreelancerId(p.getFreelancerId());
        dto.setStatus(p.getStatus());
        dto.setCreatedAt(p.getCreatedAt());
        return dto;
    }
}
