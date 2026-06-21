package com.freelencerhub.notification.service;

import com.freelencerhub.notification.dto.NotificationDTO;
import com.freelencerhub.notification.entity.Notification;
import com.freelencerhub.notification.repository.NotificationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Autowired
    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<NotificationDTO> getAllNotifications() {
        return notificationRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<NotificationDTO> getNotificationsByUser(Long userId) {
        return notificationRepository.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<NotificationDTO> getNotificationsBySender(Long senderId) {
        return notificationRepository.findBySenderId(senderId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Async
    public void processNotificationAsync(Notification notification) {
        log.info("Processing notification asynchronously from sender: {} for user: {}", notification.getSenderId(), notification.getUserId());
        notification.setRead(false);
        notificationRepository.save(notification);
        log.info("Notification saved successfully.");
    }

    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }

    private NotificationDTO mapToDTO(Notification n) {
        return new NotificationDTO(n.getId(), n.getUserId(), n.getSenderId(), n.getMessage(), n.isRead(), n.getCreatedAt());
    }
}
