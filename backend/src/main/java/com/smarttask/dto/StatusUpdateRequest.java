package com.smarttask.dto;

import com.smarttask.entity.TaskStatus;
import jakarta.validation.constraints.NotNull;

/** Body for PATCH /api/tasks/{id}/status */
public class StatusUpdateRequest {

    @NotNull(message = "Status is required (PENDING, IN_PROGRESS or COMPLETED)")
    private TaskStatus status;

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }
}
