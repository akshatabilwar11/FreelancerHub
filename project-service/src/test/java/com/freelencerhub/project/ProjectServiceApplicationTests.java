package com.freelencerhub.project;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class ProjectServiceApplicationTests {

    @Test
    void main() {
        assertDoesNotThrow(() -> ProjectServiceApplication.main(new String[] {}));
    }
}
