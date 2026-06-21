package com.freelencerhub.common.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectEvent implements Serializable {
    private Long projectId;
    private String title;
    private Long clientId;
    private Double budget;
    private String status;
}
