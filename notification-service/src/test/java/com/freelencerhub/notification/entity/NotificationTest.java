package com.freelencerhub.notification.entity;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class NotificationTest {

    @Test
    void testNotificationLombok() {
        Notification n1 = new Notification();
        n1.setId(1L);
        n1.setUserId(2L);
        n1.setSenderId(3L);
        n1.setMessage("Test Msg");
        n1.setRead(true);

        assertEquals(1L, n1.getId());
        assertEquals(2L, n1.getUserId());
        assertEquals(3L, n1.getSenderId());
        assertEquals("Test Msg", n1.getMessage());
        assertTrue(n1.isRead());

        Notification n2 = new Notification(1L, 2L, 3L, "Test Msg", true, null);
        assertEquals(n1, n2);
        assertEquals(n1.hashCode(), n2.hashCode());
        assertNotNull(n1.toString());

        Notification n3 = new Notification(2L, 2L, 3L, "Test Msg", true, null);
        assertNotEquals(n1, n3);
        
        Notification n4 = new Notification();
        assertNotEquals(n1, n4);
    }
}
