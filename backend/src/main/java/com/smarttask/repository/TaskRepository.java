package com.smarttask.repository;

import com.smarttask.entity.Task;
import com.smarttask.entity.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDate;
import java.util.Optional;

/**
 * JpaSpecificationExecutor lets the service combine search + filters dynamically
 * (see TaskSpecifications) instead of writing one query per combination.
 */
public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {

    /** Ownership check: a task is only found if it belongs to the given user. */
    Optional<Task> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, TaskStatus status);

    long countByUserIdAndDueDateBeforeAndStatusNot(Long userId, LocalDate date, TaskStatus status);
}
