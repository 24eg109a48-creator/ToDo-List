package com.smarttask.repository;

import com.smarttask.entity.Task;
import com.smarttask.entity.TaskPriority;
import com.smarttask.entity.TaskStatus;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

/**
 * Small reusable query building blocks. Each method returns one WHERE condition;
 * TaskService joins the ones it needs with .and(...).
 */
public final class TaskSpecifications {

    private TaskSpecifications() {
    }

    /** Only the tasks owned by this user. */
    public static Specification<Task> belongsToUser(Long userId) {
        return (root, query, cb) -> cb.equal(root.get("user").get("id"), userId);
    }

    /** Case-insensitive search in the title OR the description. */
    public static Specification<Task> titleOrDescriptionContains(String text) {
        String pattern = "%" + escapeLike(text.toLowerCase()) + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.<String>get("title")), pattern, '\\'),
                cb.like(cb.lower(root.<String>get("description")), pattern, '\\'));
    }

    public static Specification<Task> hasStatus(TaskStatus status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<Task> hasPriority(TaskPriority priority) {
        return (root, query, cb) -> cb.equal(root.get("priority"), priority);
    }

    /** Overdue = due date is before today AND the task is not completed. */
    public static Specification<Task> isOverdue(LocalDate today) {
        return (root, query, cb) -> cb.and(
                cb.lessThan(root.<LocalDate>get("dueDate"), today),
                cb.notEqual(root.get("status"), TaskStatus.COMPLETED));
    }

    /** Stops the characters % and _ typed by the user from acting as SQL wildcards. */
    private static String escapeLike(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }
}
