# HealthFitnessPro

## Table of Contents

- [General Info](#general-information)
- [Technologies Used](#technologies-used)
- [Features](#features)
- [Screenshots](#screenshots)
- [Setup](#setup)
- [Usage](#usage)
- [Project Status](#project-status)
- [Room for Improvement](#room-for-improvement)
- [Acknowledgements](#acknowledgements)
- [Contact](#contact)
<!-- * [License](#license) -->

## General Information

- The project consists of Diego Dominguez-Albiter, Saroj Gautam, Connor Lopez, Abhinesh Dahal, and Angel Verde-Salas.
- We are creating a Fitness App. This will have precreated workouts, a workout history, and a list of exercises.
- We are creating this application to improve the fitness knowledge of the general public.
- We undertook this project as we found fitness to be very closely correlated to health which has great importance. This app will hopefully lead people to have a more positive relationship with working out which will help their health.
  <!-- You don't have to answer all the questions - just the ones relevant to your project. -->
  ![App Cover](app/src/images/coverphoto.jpg)

## Technologies Used

- FastAPI
- ASCENDAPI
- Languages - Javascript, Python, CSS, HTML

## Sprint 1

### Contributions

---

#### Diego — Frontend UI, Wireframes & Unit Tests

> Designed the initial frontend and UI visualization through wireframes. Created the frontend for two user stories and wrote unit tests for multiple features.

- **SCRUM-50:** Design - Frontend UI Layout (Front Page) — [Jira](https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-50) | [PR #1](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/1)
- **SCRUM-10:** Design - UI Flow (Exercise Templates) — [Jira](https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-10) | [PR #2](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/2)
- **SCRUM-54:** Unit Testing - Front Page — [Jira](https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-54) | [PR #18](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/18)
- **SCRUM-33:** UI/Frontend - Workout History — [Jira](https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-33) | [PR #22](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/22)
- **SCRUM-25:** UI/Frontend - Custom Workout — [Jira](https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-25) | [PR #24](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/24)
- **SCRUM-27:** Unit Testing - Custom Workout — [Jira](https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-27) | [PR #33](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/33)
- **SCRUM-6:** Unit Testing - Exercise Library — [Jira](https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-6) | [PR #32](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/32)

---

#### Abhinesh — Backend API Client, Exercise Templates & Integration

> Built the backend exercise API client and connected the frontend to the FastAPI backend. Implemented exercise templates on both backend and frontend, and wrote unit tests for template endpoints.

- **SCRUM-53:** Integration - Exercise Data Loading (ExRx API via FastAPI) — [Jira](https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-53) | [PR #7](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/7)
- **SCRUM-52:** Implementation - Connect Navigation to Backend (FastAPI) — [Jira](https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-52) | [PR #21](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/21)
- **SCRUM-9:** Implementation - Backend (Exercise Templates) — [Jira](https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-9) | [PR #21](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/21)
- **SCRUM-11:** Implementation - Frontend (Exercise Templates) — [Jira](https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-11) | [PR #25](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/25)
- **SCRUM-12:** Unit Testing - Templates — [Jira](https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-12) | [PR #26](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/26)

---

#### Angel — Database Schemas, Data Models & Custom Workout Creator

> Designed database schema for exercise templates, data model and API for the exercise library, and the schema for the custom workout creator. Implemented the custom workout creator and built the UI for the calendar view.

- **SCRUM-35:** Calendar View - Workout History — [Jira](https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-35) | [PR #19](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/19)
- **SCRUM-8:** Design - Database Schema (Exercise Templates) — [Jira](https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-8) | [PR #3](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/3)
- **SCRUM-2:** Design - API & Data Model (Exercise Library) — [Jira](https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-2) | [PR #10](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/10)
- **SCRUM-22:** Design - Schema (Custom Workout Creator) — [Jira](https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-22) | [PR #14](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/14)
- **SCRUM-26:** Implementation - Custom Workout Creator — [Jira](https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-26) | [PR #28](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/28)

---

#### Connor — Backend for Workout History, Custom Workouts & Progress Tracking

> Designed the UI wireframe for the workout library. Created the backend for workout history, custom workout creator, and progress tracker. Built the workout logging API and integrated it into the frontend.

- **SCRUM-7:** Design - UI Wireframe (Exercise Library) — [Jira](https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-7) | [PR #4](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/4)
- **SCRUM-31:** Backend - Workout History — [Jira](https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-31) | [PR #15](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/15)
- **SCRUM-24:** Backend - Custom Workout Creator — [Jira](https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-24) | [PR #16](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/16)
- **SCRUM-32:** Workout Logging API - Workout History — [Jira](https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-32) | [PR #23](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/23)
- **SCRUM-36:** Progress Tracking - Workout History — [Jira](https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-36) | [PR #27](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/27)

---

#### Saroj

> Developed the homepage, implemented the workout library frontend, and integrated it with the backend to ensure seamless functionality and data flow.

- **SCRUM-51:** Implementation – Build Home Screen(Home Screen) - [Jira](https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-51) | [PR #13](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/13)
- **SCRUM-4:** Implementation – Frontend: Workout Library(Workout Library) - [Jira](https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-4) | [PR #29](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/29) 
- **SCRUM-5:** Implementation – Backend Integration: Workout Library - [Jira](https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-4) | [PR #30](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/30)

---

### Burnup Chart

![Burnup Chart](app/src/images/image.png)


## Sprint 2

### Contributions

---

#### Diego — React Refactoring, Unit Testing, File Clean Up

> Led the charge when refactoring/migrating legacy HTML code into React. Added all the logic from the frontend which connected it to the backend after the refactor. Integrated an API for the Calorie Tracker which was used to find the different foods used for it. Updated legacy unit tests for the frontend. Added unit tests for the new features added. Also cleaned up the React files so that they were sufficiently and cleanly following SRP. This is through taking out hook logic from pages and making sure the UI is in components.

- **SCRUM-70:** Migrate Dashboard HTML layout to React component structure | [PR](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/39)
- **SCRUM-72:** Migrate Library to React | [PR](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/47)
- **SCRUM-73:** Migrate History to React | [PR](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/46)
- **SCRUM-74:** Unit Testing Reach Functionality | [PR](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/56)
- **SCRUM-67:** Backend Logic Consolidation + Connection to Frontend | [PR](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/54)
- **SCRUM-43:** API Integration | [PR](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/61)
- **SCRUM-30:** Unit Testing - Timer | [PR](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/66)
- **SCRUM-49:** Unit Testing - Calorie Tracker | [PR](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/67)
- **SCRUM-59:** Unit Testing - Security | [PR](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/68)
- **SCRUM-85:** Cleaning Up Frontend Functions//SOLID Principles | [PR](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/64)
- **SCRUM-86:** Hook Unit Tests | [PR](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/69)

---

#### Abhinesh — 

---

#### Angel — 

---

#### Connor — Backend for User Authentication, Protection of Routes, and Implementation of Reset Function

- **SCRUM-55:** Design - User Authentication Mmodel (FastAPI) - [Jira] (https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-55) | [PR #51](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/51)
- **SCRUM-56:** Implementation - Backend Authentication (FastAPI) - [Jira] (https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-56) | [PR #53](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/53)
- **SCRUM-58:** Secure API Protection (FastAPI) - [Jira] (https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-58) | [PR #60](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/60)
- **SCRUM-48:** Logic - History - Nutrition & Calorie Tracker - [jira] (https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-48) | [Pr #65](https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/65)

---

#### Saroj —

---


### Burnup Chart

![Burnup Chart](app/src/images/sprintBurnUp2.png)

## Features

User Stories:

1.  As a health enthusiast I would like a library of exercises so that I can know what muscles to target per exercise.

1.  As a gym enthusiast I would like some exercise templates so that I can thoroughly and consistently exercise every week.

1.  As a gym enthusiast, I want to create my own custom workout routines from the exercise library so that I can follow a personalized plan that fits my specific goals.

1.  As a dedicated athlete, I want to log my actual sets, reps, and weight during a workout so that I can see my progress over time.

1.  As a health-conscious user, I want to log my daily food intake so that I can monitor my calorie balance against my activity levels.

1.  As a runner, I want to track my distance, time, and route via GPS so that I can see a map of my run and analyze my pace.

1.  As a disciplined lifter, I want a dedicated rest timer and clock within the app, so that I don't have to switch to my phone's clock app between sets.

1.  As a mobile-first athlete, I want to access my workout library, track my runs via GPS, and receive haptic notifications, so that I can train anywhere—from the gym floor to outdoor trails—without needing a laptop.

1.  As a customer, I would like a nice and easily interpretable front page so I can navigate and use the application.

1.  As a customer, I would like to have a secure account to protect sensitive information so I can use my account across platforms.

## Screenshots

<!-- Add screenshots here as they become available -->

## Setup

### Prerequisites

- Python 3.10+
- Node.js (for running frontend tests)
- A [RapidAPI](https://rapidapi.com/) key for the ExerciseDB API

### Dependencies

- **Backend (Python):** Listed in `requirements.txt` — includes FastAPI, Uvicorn, SQLAlchemy, httpx, python-dotenv, and Pydantic.
- **Frontend tests (Node):** Listed in `package.json` — includes Jest and Babel for unit testing.

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd main_application
   ```

2. **Create a Python virtual environment and install dependencies**

   ```bash
   python -m venv venv
   source venv/bin/activate   # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Set up environment variables**

   Create a `.env` file in the project root with your RapidAPI key:

   ```
   XRAPID_API_KEY=your_rapidapi_key_here
   ```

4. **Install Node dependencies** (only needed for running frontend tests)
   ```bash
   npm install
   ```

### Running the Application

1. **Start the backend server**

   ```bash
   uvicorn app.backend.main:app --reload
   ```

   The API will be available at `http://127.0.0.1:8000` and the interactive docs at `http://127.0.0.1:8000/docs`.

2. **Open the frontend**

   Open `app/frontend/front_page/index.html` in your browser, or serve the `app/frontend/` directory with any static file server.

### Running Tests

```bash
npm test
```

## Usage

Once the backend server is running, the app provides the following features:

**Exercise Library** — Browse a catalog of exercises pulled from the ExerciseDB API. Each exercise includes target muscles and detailed information.

**Exercise Templates** — View pre-built workout templates or create your own. Templates group exercises together into a structured routine.

**Custom Workout Creator** — Build personalized workouts by selecting exercises from the library and organizing them into your own routine.

**Workout History** — Log your completed workouts with sets, reps, and weight. View past sessions through the calendar view to track consistency.

**Progress Tracker** — Monitor your performance over time to see how your lifts and activity are improving.

**API Docs** — Visit `http://127.0.0.1:8000/docs` to explore and test all backend endpoints interactively.

## Project Status

Project is currently: **In Progress** 🔧


## Room for Improvement

### To do:

- Library of Exercises
  - The library of exercises will be a huge catalog of different exercises a person can do and can find in depth information. This will help users who are not familar with different exercises so that they can learn a variety of them.
- Workout Templates
  - This will be prebuilt workouts with different exercises within them. This will be the main appeal of the application. This will be used for people who are not sure which exercises pair up together or who just want to boot up a workout without thinking of what to do beforehand.
- History of Workouts
  - This will be a place in which a person may catalog the workouts which they have done previously. This is helpful for a user so that they know what they have done previously and what they must do in the future.

## Acknowledgements

- [ExerciseDB API](https://rapidapi.com/) for providing exercise data
- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
