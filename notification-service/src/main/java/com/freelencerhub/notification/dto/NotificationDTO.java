package com.freelencerhub.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private Long userId;
    private Long senderId;
    private String message;
    private boolean isRead;
    private java.time.LocalDateTime createdAt;
}
