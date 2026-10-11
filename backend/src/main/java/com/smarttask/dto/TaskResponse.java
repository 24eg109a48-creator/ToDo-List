package com.smarttask.dto;

import com.smarttask.entity.TaskPriority;
import com.smarttask.entity.TaskStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** Task data sent to the frontend. "overdue" is calculated by the server. */
public record TaskResponse(
        Long id,
        String title,
        String description,
        LocalDate dueDate,
        TaskPriority priority,
        TaskStatus status,
        boolean overdue,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
