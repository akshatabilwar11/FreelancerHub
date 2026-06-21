package com.freelencerhub.notification.service;

import com.freelencerhub.notification.dto.NotificationDTO;
import com.freelencerhub.notification.entity.Notification;
import com.freelencerhub.notification.repository.NotificationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationService notificationService;

    @Test
    void testGetAllNotifications() {
        Notification n1 = new Notification(1L, 1L, null, "Msg1", false, null);
        Notification n2 = new Notification(2L, 2L, null, "Msg2", true, null);
        when(notificationRepository.findAll()).thenReturn(Arrays.asList(n1, n2));

        List<NotificationDTO> result = notificationService.getAllNotifications();

        assertEquals(2, result.size());
        verify(notificationRepository, times(1)).findAll();
    }

    @Test
    void testGetNotificationsByUser() {
        Notification n = new Notification(1L, 1L, null, "Msg", false, null);
        when(notificationRepository.findByUserId(1L)).thenReturn(Arrays.asList(n));

        List<NotificationDTO> result = notificationService.getNotificationsByUser(1L);

        assertEquals(1, result.size());
        assertEquals("Msg", result.get(0).getMessage());
        verify(notificationRepository, times(1)).findByUserId(1L);
    }

    @Test
    void testProcessNotificationAsync() {
        Notification n = new Notification(null, 1L, null, "Async Msg", false, null);
        
        notificationService.processNotificationAsync(n);

        verify(notificationRepository, times(1)).save(n);
        assertEquals(false, n.isRead());
    }

    @Test
    void testGetNotificationsBySender() {
        Notification n = new Notification(1L, 1L, 2L, "Msg from sender", false, null);
        when(notificationRepository.findBySenderId(2L)).thenReturn(Arrays.asList(n));

        List<NotificationDTO> result = notificationService.getNotificationsBySender(2L);

        assertEquals(1, result.size());
        assertEquals("Msg from sender", result.get(0).getMessage());
        verify(notificationRepository, times(1)).findBySenderId(2L);
    }

    @Test
    void testMarkAsRead_Success() {
        Notification n = new Notification(1L, 1L, null, "Msg", false, null);
        when(notificationRepository.findById(1L)).thenReturn(java.util.Optional.of(n));

        notificationService.markAsRead(1L);

        assertEquals(true, n.isRead());
        verify(notificationRepository, times(1)).save(n);
    }

    @Test
    void testMarkAsRead_NotFound() {
        when(notificationRepository.findById(1L)).thenReturn(java.util.Optional.empty());

        notificationService.markAsRead(1L);

        verify(notificationRepository, never()).save(any());
    }
}
