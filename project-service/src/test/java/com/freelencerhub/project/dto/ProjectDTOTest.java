package com.freelencerhub.project.dto;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ProjectDTOTest {

    @Test
    void testProjectDTO() {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(1L);
        dto.setTitle("Web Design");
        dto.setDescription("Modern UI");
        dto.setBudget(1200.0);
        dto.setClientId(10L);

        assertEquals(1L, dto.getId());
        assertEquals("Web Design", dto.getTitle());
        assertEquals("Modern UI", dto.getDescription());
        assertEquals(1200.0, dto.getBudget());
        assertEquals(10L, dto.getClientId());

        ProjectDTO dtoAll = new ProjectDTO(2L, "Backend", "API design", 2500.0, 11L);
        assertEquals(2L, dtoAll.getId());
        
        assertNotNull(dto.toString());
        assertNotEquals(0, dto.hashCode());
        assertTrue(dto.equals(dto));
    }
}
