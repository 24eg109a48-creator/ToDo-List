package com.smarttask.dto;

import java.time.LocalDateTime;

/** Public view of a user. The password hash is deliberately NOT included. */
public record UserResponse(Long id, String name, String email, LocalDateTime createdAt) {
}
