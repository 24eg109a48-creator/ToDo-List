package com.smarttask.entity;

/**
 * The order of the constants matters: LOW < MEDIUM < HIGH.
 * Sorting by priority relies on this order.
 */
public enum TaskPriority {
    LOW,
    MEDIUM,
    HIGH
}
