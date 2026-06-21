package com.freelencerhub.payment;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class PaymentServiceApplicationTests {

    @Test
    void main() {
        assertDoesNotThrow(() -> PaymentServiceApplication.main(new String[] {}));
    }
}
