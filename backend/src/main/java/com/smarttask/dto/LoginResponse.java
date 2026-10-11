package com.smarttask.dto;

/** Returned after a successful login: the JWT plus the logged-in user's public details. */
public record LoginResponse(String token, String tokenType, UserResponse user) {
}
