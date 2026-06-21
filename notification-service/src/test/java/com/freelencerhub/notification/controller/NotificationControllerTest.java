package com.freelencerhub.notification.controller;

import com.freelencerhub.notification.dto.NotificationDTO;
import com.freelencerhub.notification.entity.Notification;
import com.freelencerhub.notification.service.NotificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationControllerTest {

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private NotificationController notificationController;

    @Test
    void testGetAllNotifications() {
        NotificationDTO n = new NotificationDTO(1L, 1L, null, "Msg", false, null);
        when(notificationService.getAllNotifications()).thenReturn(Arrays.asList(n));
        List<NotificationDTO> list = notificationController.getAllNotifications();
        assertEquals(1, list.size());
    }

    @Test
    void testSendNotification() {
        Notification n = new Notification(null, 1L, null, "Msg", false, null);
        doNothing().when(notificationService).processNotificationAsync(n);
        ResponseEntity<String> result = notificationController.sendNotification(n);
        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals("Notification is processing asynchronously", result.getBody());
    }
    
    @Test
    void testGetNotificationsByUser() {
        NotificationDTO n = new NotificationDTO(1L, 1L, null, "Msg", false, null);
        when(notificationService.getNotificationsByUser(1L)).thenReturn(Arrays.asList(n));
        List<NotificationDTO> list = notificationController.getNotificationsByUser(1L);
        assertEquals(1, list.size());
    }
}
