package com.smarttask.service;

import com.smarttask.dto.StatusUpdateRequest;
import com.smarttask.dto.TaskRequest;
import com.smarttask.dto.TaskResponse;
import com.smarttask.dto.TaskStatsResponse;
import com.smarttask.entity.Task;
import com.smarttask.entity.TaskPriority;
import com.smarttask.entity.TaskStatus;
import com.smarttask.entity.User;
import com.smarttask.exception.BadRequestException;
import com.smarttask.exception.ResourceNotFoundException;
import com.smarttask.repository.TaskRepository;
import com.smarttask.repository.TaskSpecifications;
import com.smarttask.repository.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

/**
 * All task business rules live here.
 * Every method receives the logged-in user's email (taken from the JWT) and only ever
 * touches tasks that belong to that user - this is what stops one user from reading or
 * changing another user's tasks by guessing an ID.
 */
@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    // ------------------------------------------------------------------ read

    /**
     * @param search    text to look for in title or description (optional)
     * @param status    ALL, PENDING, IN_PROGRESS, COMPLETED or OVERDUE (optional)
     * @param priority  ALL, LOW, MEDIUM or HIGH (optional)
     * @param sortBy    title, dueDate, createdAt or priority (default createdAt)
     * @param direction asc or desc (default desc)
     */
    @Transactional(readOnly = true)
    public List<TaskResponse> getTasks(String email, String search, String status, String priority,
                                       String sortBy, String direction) {
        User user = getUser(email);

        Specification<Task> spec = Specification.where(TaskSpecifications.belongsToUser(user.getId()));

        if (hasText(search)) {
            spec = spec.and(TaskSpecifications.titleOrDescriptionContains(search.trim()));
        }
        if (hasText(status) && !"ALL".equalsIgnoreCase(status)) {
            if ("OVERDUE".equalsIgnoreCase(status)) {
                spec = spec.and(TaskSpecifications.isOverdue(LocalDate.now()));
            } else {
                spec = spec.and(TaskSpecifications.hasStatus(parseStatus(status)));
            }
        }
        if (hasText(priority) && !"ALL".equalsIgnoreCase(priority)) {
            spec = spec.and(TaskSpecifications.hasPriority(parsePriority(priority)));
        }

        Sort.Direction sortDirection = parseDirection(direction);
        String sortField = hasText(sortBy) ? sortBy.trim() : "createdAt";

        List<Task> tasks;
        if (sortField.equals("title") || sortField.equals("dueDate") || sortField.equals("createdAt")) {
            // The database does the sorting. "id" is a tie-breaker so the order is always stable.
            Sort sort = Sort.by(sortDirection, sortField).and(Sort.by(Sort.Direction.ASC, "id"));
            tasks = taskRepository.findAll(spec, sort);
        } else if (sortField.equals("priority")) {
            // Priority is stored as text ("HIGH"), so alphabetical order would be wrong.
            // We sort by the enum order instead: LOW < MEDIUM < HIGH.
            tasks = new ArrayList<>(taskRepository.findAll(spec));
            Comparator<Task> byPriority = Comparator.comparing(Task::getPriority);
            tasks.sort(sortDirection == Sort.Direction.ASC ? byPriority : byPriority.reversed());
        } else {
            throw new BadRequestException("Invalid sortBy value. Use title, dueDate, createdAt or priority");
        }

        return tasks.stream().map(TaskService::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public TaskResponse getTask(String email, Long taskId) {
        return toResponse(findOwnedTask(email, taskId));
    }

    @Transactional(readOnly = true)
    public TaskStatsResponse getStats(String email) {
        Long userId = getUser(email).getId();
        long total = taskRepository.countByUserId(userId);
        long completed = taskRepository.countByUserIdAndStatus(userId, TaskStatus.COMPLETED);
        long pending = taskRepository.countByUserIdAndStatus(userId, TaskStatus.PENDING);
        long inProgress = taskRepository.countByUserIdAndStatus(userId, TaskStatus.IN_PROGRESS);
        long overdue = taskRepository.countByUserIdAndDueDateBeforeAndStatusNot(
                userId, LocalDate.now(), TaskStatus.COMPLETED);
        return new TaskStatsResponse(total, completed, pending, inProgress, overdue);
    }

    // ----------------------------------------------------------------- write

    @Transactional
    public TaskResponse createTask(String email, TaskRequest request) {
        Task task = new Task();
        task.setUser(getUser(email));
        applyRequest(task, request);
        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse updateTask(String email, Long taskId, TaskRequest request) {
        Task task = findOwnedTask(email, taskId);
        applyRequest(task, request);
        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse completeTask(String email, Long taskId) {
        Task task = findOwnedTask(email, taskId);
        task.setStatus(TaskStatus.COMPLETED);
        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public TaskResponse updateStatus(String email, Long taskId, StatusUpdateRequest request) {
        Task task = findOwnedTask(email, taskId);
        task.setStatus(request.getStatus());
        return toResponse(taskRepository.save(task));
    }

    @Transactional
    public void deleteTask(String email, Long taskId) {
        Task task = findOwnedTask(email, taskId);
        taskRepository.delete(task);
    }

    // --------------------------------------------------------------- helpers

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    /**
     * Looks the task up by id AND owner. If the task exists but belongs to somebody else
     * we answer "not found" - we do not even reveal that the id exists.
     */
    private Task findOwnedTask(String email, Long taskId) {
        User user = getUser(email);
        return taskRepository.findByIdAndUserId(taskId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
    }

    private void applyRequest(Task task, TaskRequest request) {
        task.setTitle(request.getTitle().trim());
        String description = request.getDescription();
        task.setDescription(description == null || description.isBlank() ? null : description.trim());
        task.setDueDate(request.getDueDate());
        task.setPriority(request.getPriority());
        task.setStatus(request.getStatus());
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    private TaskStatus parseStatus(String value) {
        try {
            return TaskStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid status filter. Use ALL, PENDING, IN_PROGRESS, COMPLETED or OVERDUE");
        }
    }

    private TaskPriority parsePriority(String value) {
        try {
            return TaskPriority.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid priority filter. Use ALL, LOW, MEDIUM or HIGH");
        }
    }

    private Sort.Direction parseDirection(String direction) {
        if (!hasText(direction) || "desc".equalsIgnoreCase(direction)) {
            return Sort.Direction.DESC;
        }
        if ("asc".equalsIgnoreCase(direction)) {
            return Sort.Direction.ASC;
        }
        throw new BadRequestException("Invalid direction. Use asc or desc");
    }

    /** Entity -> DTO. "overdue" is true when the due date has passed and the task is not completed. */
    private static TaskResponse toResponse(Task task) {
        boolean overdue = task.getStatus() != TaskStatus.COMPLETED
                && task.getDueDate().isBefore(LocalDate.now());
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getDueDate(),
                task.getPriority(),
                task.getStatus(),
                overdue,
                task.getCreatedAt(),
                task.getUpdatedAt());
    }
}
