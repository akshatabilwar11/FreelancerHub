package com.freelencerhub.project.entity;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ProjectTest {

    @Test
    void testProjectEntity() {
        Project project = new Project();
        project.setId(1L);
        project.setTitle("Website");
        project.setDescription("Build a site");
        project.setBudget(1000.0);
        project.setClientId(10L);

        assertEquals(1L, project.getId());
        assertEquals("Website", project.getTitle());
        assertEquals("Build a site", project.getDescription());
        assertEquals(1000.0, project.getBudget());
        assertEquals(10L, project.getClientId());

        Project projectAll = new Project(2L, "Mobile App", "Android app", 2000.0, 11L);
        assertEquals(2L, projectAll.getId());
        
        assertNotNull(project.toString());
        assertNotEquals(0, project.hashCode());
        assertTrue(project.equals(project));
        assertFalse(project.equals(null));
    }
}
