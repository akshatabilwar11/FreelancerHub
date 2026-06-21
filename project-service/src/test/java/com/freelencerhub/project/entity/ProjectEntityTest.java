package com.freelencerhub.project.entity;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ProjectEntityTest {

    @Test
    void testProjectPOJO() {
        Project project = new Project();
        project.setId(1L);
        project.setTitle("Frontend App");
        project.setDescription("React based app");
        project.setBudget(500.0);
        project.setClientId(10L);

        assertEquals(1L, project.getId());
        assertEquals("Frontend App", project.getTitle());
        assertEquals("React based app", project.getDescription());
        assertEquals(500.0, project.getBudget());
        assertEquals(10L, project.getClientId());

        Project project2 = new Project(1L, "Frontend App", "React based app", 500.0, 10L);
        project2.setCreatedAt(project.getCreatedAt());
        assertEquals(project, project2);
        assertEquals(project.hashCode(), project2.hashCode());
        assertNotNull(project.toString());
    }
}
