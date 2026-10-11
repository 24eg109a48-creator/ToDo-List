package com.smarttask;

import com.smarttask.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthControllerTest extends AbstractIntegrationTest {

    private Map<String, String> registerBody(String name, String email, String password, String confirm) {
        Map<String, String> body = new LinkedHashMap<>();
        body.put("name", name);
        body.put("email", email);
        body.put("password", password);
        body.put("confirmPassword", confirm);
        return body;
    }

    @Test
    @DisplayName("Registration succeeds and never returns the password")
    void registerSuccess() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(registerBody("Asha Rao", "asha@example.com", PASSWORD, PASSWORD))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("Asha Rao"))
                .andExpect(jsonPath("$.email").value("asha@example.com"))
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    @DisplayName("Password is stored as a BCrypt hash, not plain text")
    void passwordIsHashed() throws Exception {
        register("Asha Rao", "asha@example.com");

        User saved = userRepository.findByEmail("asha@example.com").orElseThrow();
        assertNotEquals(PASSWORD, saved.getPassword());
        assertTrue(saved.getPassword().startsWith("$2"), "BCrypt hashes start with $2");
    }

    @Test
    @DisplayName("Registering the same email twice is rejected")
    void registerDuplicateEmail() throws Exception {
        register("Asha Rao", "asha@example.com");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(registerBody("Another Asha", "ASHA@example.com", PASSWORD, PASSWORD))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("An account with this email already exists"));
    }

    @Test
    @DisplayName("Invalid registration data returns field-level validation errors")
    void registerValidationErrors() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(registerBody("A", "not-an-email", "123", "123"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errors.name").exists())
                .andExpect(jsonPath("$.errors.email").exists())
                .andExpect(jsonPath("$.errors.password").exists());
    }

    @Test
    @DisplayName("Registration fails when the passwords do not match")
    void registerPasswordMismatch() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(registerBody("Asha Rao", "asha@example.com", PASSWORD, "different1"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Password and confirm password do not match"));
    }

    @Test
    @DisplayName("Login returns a JWT and the user details")
    void loginSuccess() throws Exception {
        register("Asha Rao", "asha@example.com");

        Map<String, String> body = new LinkedHashMap<>();
        body.put("email", "asha@example.com");
        body.put("password", PASSWORD);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.email").value("asha@example.com"))
                .andExpect(jsonPath("$.user.password").doesNotExist());
    }

    @Test
    @DisplayName("Login with a wrong password returns 401")
    void loginWrongPassword() throws Exception {
        register("Asha Rao", "asha@example.com");

        Map<String, String> body = new LinkedHashMap<>();
        body.put("email", "asha@example.com");
        body.put("password", "wrong-password");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(body)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    @DisplayName("Login with an unknown email returns 401")
    void loginUnknownEmail() throws Exception {
        Map<String, String> body = new LinkedHashMap<>();
        body.put("email", "nobody@example.com");
        body.put("password", PASSWORD);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(body)))
                .andExpect(status().isUnauthorized());
    }
}
