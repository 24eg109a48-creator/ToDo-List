package com.smarttask;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class TaskControllerTest extends AbstractIntegrationTest {

    private static String bearer(String token) {
        return "Bearer " + token;
    }

    // ------------------------------------------------------------ create

    @Test
    @DisplayName("Create task returns 201 and the saved task")
    void createTask() throws Exception {
        String token = registerAndLogin("Asha Rao", "asha@example.com");

        mockMvc.perform(post("/api/tasks")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(taskBody("Finish project report", "HIGH", "PENDING", 5))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title").value("Finish project report"))
                .andExpect(jsonPath("$.priority").value("HIGH"))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.overdue").value(false));
    }

    @Test
    @DisplayName("Create task with invalid data returns validation errors")
    void createTaskValidation() throws Exception {
        String token = registerAndLogin("Asha Rao", "asha@example.com");

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("title", " ");
        body.put("description", "x");

        mockMvc.perform(post("/api/tasks")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.title").exists())
                .andExpect(jsonPath("$.errors.dueDate").exists())
                .andExpect(jsonPath("$.errors.priority").exists())
                .andExpect(jsonPath("$.errors.status").exists());
    }

    // ---------------------------------------------------------- retrieve

    @Test
    @DisplayName("Get all tasks and a single task")
    void getTasks() throws Exception {
        String token = registerAndLogin("Asha Rao", "asha@example.com");
        long id = createTask(token, taskBody("Write unit tests", "MEDIUM", "PENDING", 2));
        createTask(token, taskBody("Prepare viva", "LOW", "IN_PROGRESS", 4));

        mockMvc.perform(get("/api/tasks").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));

        mockMvc.perform(get("/api/tasks/" + id).header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(id))
                .andExpect(jsonPath("$.title").value("Write unit tests"));
    }

    @Test
    @DisplayName("Getting a task that does not exist returns 404")
    void getMissingTask() throws Exception {
        String token = registerAndLogin("Asha Rao", "asha@example.com");

        mockMvc.perform(get("/api/tasks/99999").header("Authorization", bearer(token)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Task not found"));
    }

    // ------------------------------------------------------------ update

    @Test
    @DisplayName("Update task changes its fields")
    void updateTask() throws Exception {
        String token = registerAndLogin("Asha Rao", "asha@example.com");
        long id = createTask(token, taskBody("Old title", "LOW", "PENDING", 3));

        mockMvc.perform(put("/api/tasks/" + id)
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(taskBody("New title", "HIGH", "IN_PROGRESS", 7))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("New title"))
                .andExpect(jsonPath("$.priority").value("HIGH"))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }

    @Test
    @DisplayName("Complete and change-status endpoints work")
    void completeAndChangeStatus() throws Exception {
        String token = registerAndLogin("Asha Rao", "asha@example.com");
        long id = createTask(token, taskBody("Submit assignment", "MEDIUM", "PENDING", 3));

        mockMvc.perform(patch("/api/tasks/" + id + "/status")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"IN_PROGRESS\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        mockMvc.perform(patch("/api/tasks/" + id + "/complete")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }

    // ------------------------------------------------------------ delete

    @Test
    @DisplayName("Delete task returns 204 and the task is gone")
    void deleteTask() throws Exception {
        String token = registerAndLogin("Asha Rao", "asha@example.com");
        long id = createTask(token, taskBody("Temporary task", "LOW", "PENDING", 1));

        mockMvc.perform(delete("/api/tasks/" + id).header("Authorization", bearer(token)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/tasks/" + id).header("Authorization", bearer(token)))
                .andExpect(status().isNotFound());
    }

    // ----------------------------------------------- search/filter/sort

    @Test
    @DisplayName("Search, filter, overdue detection and sorting work")
    void searchFilterSort() throws Exception {
        String token = registerAndLogin("Asha Rao", "asha@example.com");
        createTask(token, taskBody("Project report", "HIGH", "PENDING", 3));
        createTask(token, taskBody("Buy groceries", "LOW", "COMPLETED", 1));
        createTask(token, taskBody("Old overdue job", "MEDIUM", "PENDING", -4));

        // search in the title
        mockMvc.perform(get("/api/tasks").param("search", "project").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Project report"));

        // search in the description ("Description for Buy groceries")
        mockMvc.perform(get("/api/tasks").param("search", "for buy").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Buy groceries"));

        // status filter
        mockMvc.perform(get("/api/tasks").param("status", "COMPLETED").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Buy groceries"));

        // overdue filter
        mockMvc.perform(get("/api/tasks").param("status", "OVERDUE").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Old overdue job"))
                .andExpect(jsonPath("$[0].overdue").value(true));

        // priority filter
        mockMvc.perform(get("/api/tasks").param("priority", "HIGH").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Project report"));

        // sort by title ascending
        mockMvc.perform(get("/api/tasks").param("sortBy", "title").param("direction", "asc")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Buy groceries"))
                .andExpect(jsonPath("$[2].title").value("Project report"));

        // sort by priority descending: HIGH, MEDIUM, LOW
        mockMvc.perform(get("/api/tasks").param("sortBy", "priority").param("direction", "desc")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].priority").value("HIGH"))
                .andExpect(jsonPath("$[1].priority").value("MEDIUM"))
                .andExpect(jsonPath("$[2].priority").value("LOW"));

        // invalid sort field
        mockMvc.perform(get("/api/tasks").param("sortBy", "password").header("Authorization", bearer(token)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Stats count tasks per status and overdue")
    void stats() throws Exception {
        String token = registerAndLogin("Asha Rao", "asha@example.com");
        createTask(token, taskBody("One", "HIGH", "PENDING", 3));
        createTask(token, taskBody("Two", "LOW", "COMPLETED", 1));
        createTask(token, taskBody("Three", "MEDIUM", "IN_PROGRESS", -2));

        mockMvc.perform(get("/api/tasks/stats").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(3))
                .andExpect(jsonPath("$.completed").value(1))
                .andExpect(jsonPath("$.pending").value(1))
                .andExpect(jsonPath("$.inProgress").value(1))
                .andExpect(jsonPath("$.overdue").value(1));
    }

    // ------------------------------------------------- unauthorized access

    @Test
    @DisplayName("Requests without a token are rejected with 401")
    void noTokenIsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));

        mockMvc.perform(get("/api/users/profile"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("A forged or invalid token is rejected with 401")
    void invalidTokenIsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/tasks").header("Authorization", "Bearer this.is.not-a-real-token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("A user cannot read, edit, complete or delete another user's task")
    void cannotAccessAnotherUsersTask() throws Exception {
        String ownerToken = registerAndLogin("Owner", "owner@example.com");
        String intruderToken = registerAndLogin("Intruder", "intruder@example.com");
        long ownersTaskId = createTask(ownerToken, taskBody("Private task", "HIGH", "PENDING", 3));

        // read
        mockMvc.perform(get("/api/tasks/" + ownersTaskId).header("Authorization", bearer(intruderToken)))
                .andExpect(status().isNotFound());

        // edit
        mockMvc.perform(put("/api/tasks/" + ownersTaskId)
                        .header("Authorization", bearer(intruderToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(taskBody("Hacked", "LOW", "COMPLETED", 1))))
                .andExpect(status().isNotFound());

        // complete
        mockMvc.perform(patch("/api/tasks/" + ownersTaskId + "/complete")
                        .header("Authorization", bearer(intruderToken)))
                .andExpect(status().isNotFound());

        // delete
        mockMvc.perform(delete("/api/tasks/" + ownersTaskId).header("Authorization", bearer(intruderToken)))
                .andExpect(status().isNotFound());

        // the intruder's own list is empty
        mockMvc.perform(get("/api/tasks").header("Authorization", bearer(intruderToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        // the owner's task is untouched
        mockMvc.perform(get("/api/tasks/" + ownersTaskId).header("Authorization", bearer(ownerToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Private task"))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }
}
