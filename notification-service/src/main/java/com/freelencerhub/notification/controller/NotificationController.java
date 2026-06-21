package com.freelencerhub.notification.controller;

import com.freelencerhub.notification.dto.NotificationDTO;
import com.freelencerhub.notification.entity.Notification;
import com.freelencerhub.notification.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @Autowired
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationDTO> getAllNotifications() {
        return notificationService.getAllNotifications();
    }

    @PostMapping
    public ResponseEntity<String> sendNotification(@Valid @RequestBody Notification notification) {
        notificationService.processNotificationAsync(notification);
        return ResponseEntity.ok("Notification is processing asynchronously");
    }
    
    @GetMapping("/user/{userId}")
    public List<NotificationDTO> getNotificationsByUser(@PathVariable Long userId) {
        return notificationService.getNotificationsByUser(userId);
    }

    @GetMapping("/sender/{senderId}")
    public List<NotificationDTO> getNotificationsBySender(@PathVariable Long senderId) {
        return notificationService.getNotificationsBySender(senderId);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }
}
