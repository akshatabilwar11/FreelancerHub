package com.freelencerhub.project.repository;

import com.freelencerhub.project.entity.Project;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
class ProjectRepositoryTest {

    @Autowired
    private ProjectRepository projectRepository;

    @Test
    void testSaveAndFindByClientId() {
        Project p = new Project(null, "Pro", "Desc", 500.0, 1L);
        projectRepository.save(p);
        
        List<Project> list = projectRepository.findByClientId(1L);
        assertEquals(1, list.size());
        assertEquals("Pro", list.get(0).getTitle());
    }
}
