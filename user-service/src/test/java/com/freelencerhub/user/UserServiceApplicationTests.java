package com.freelencerhub.user;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class UserServiceApplicationTests {

    @Test
    void main() {
        assertDoesNotThrow(() -> UserServiceApplication.main(new String[] {}));
    }
}
