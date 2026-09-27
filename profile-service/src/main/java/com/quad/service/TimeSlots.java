package com.quad.service;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * The weekly grid volunteers mark their availability on: a day and a part of it, e.g. "SAT_MORNING".
 * Morning is before noon, afternoon until 5pm, evening after that.
 */
public final class TimeSlots {

    public static final List<String> DAYS = List.of("MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN");
    public static final List<String> PARTS = List.of("MORNING", "AFTERNOON", "EVENING");
    // Monday morning, Monday afternoon, ..., Sunday evening.
    public static final List<String> ALL;

    static {
        List<String> all = new ArrayList<>();
        for (String day : DAYS) {
            for (String part : PARTS) {
                all.add(day + "_" + part);
            }
        }
        ALL = List.copyOf(all);
    }

    private static final Set<String> VALID = Set.copyOf(ALL);

    private TimeSlots() {
    }

    public static boolean isValid(String slot) {
        return slot != null && VALID.contains(slot);
    }

    // The slot an event starting at this time falls in.
    public static String of(LocalDateTime start) {
        String day = DAYS.get(start.getDayOfWeek().getValue() - DayOfWeek.MONDAY.getValue());
        int hour = start.getHour();
        String part = hour < 12 ? "MORNING" : hour < 17 ? "AFTERNOON" : "EVENING";
        return day + "_" + part;
    }
}
