package com.smarttask.dto;

/** Numbers shown on the dashboard and profile page. */
public record TaskStatsResponse(long total, long completed, long pending, long inProgress, long overdue) {
}
