# Calorie Tracker Backend Unit Testing Plan

## Overview
This document outlines the unit testing plan for the Calorie Tracker backend. The purpose of these tests is to verify that key nutrition-related API endpoints and backend logic function correctly, including handling user input, returning properly structured data, and performing accurate calorie and macro calculations.

## Test 1: Search foods returns nutrition results

**Feature:** Food search for the calorie tracker.

**Code being tested:** `GET /nutrition/search`

**Fields used:**  
- `q`
- `page`
- `max_results`

**Return object:**  
A list of food result objects returned by the nutrition client, each containing fields such as food name, calorie value, and serving information.

**Expected result:**  
When a valid query is sent, the endpoint should return status code 200 and a structured response containing food results.

---

## Test 2: Add meal log creates a calorie tracker entry

**Feature:** Per-user meal logging.

**Code being tested:** `POST /nutrition/logs`

**Fields used:**  
- `log_date`
- `meal_type`
- `food_name`
- `kcal`
- `protein_g`
- `carbs_g`
- `fat_g`

**Return object:**  
A `MealLogRead` object containing fields such as `food_name`, `kcal`, `protein_g`, `carbs_g`, `fat_g`, and `log_date`.

**Expected result:**  
When valid meal log data is sent by an authenticated user, the endpoint should return status code 201 and return the created meal log with the correct food name, calories, macros, and user-owned data.

---

## Test 3: Nutrition trends returns daily macro totals

**Feature:** Daily calorie and macro trend summary.

**Code being tested:** `GET /nutrition/logs/trends`

**Fields used:**  
- optional `days` query parameter
- stored meal log fields: `kcal`, `protein_g`, `carbs_g`, `fat_g`, `log_date`

**Return object:**  
A list of `DailyTrend` objects, where each object includes:
- `date`
- `kcal`
- `protein_g`
- `carbs_g`
- `fat_g`

**Expected result:**  
When a user has multiple meal logs on the same date, the endpoint should correctly add the calories, protein, carbs, and fat together and return the daily totals.