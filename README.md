# HealthFitnessPro
> Our application is simple place in which a person can catalog their workouts and learn many new ones as well.
> Live demo [_here_](https://www.example.com). <!-- If you have the project hosted somewhere, include the link here. -->

## Table of Contents
* [General Info](#general-information)
* [Technologies Used](#technologies-used)
* [Features](#features)
* [Screenshots](#screenshots)
* [Setup](#setup)
* [Usage](#usage)
* [Project Status](#project-status)
* [Room for Improvement](#room-for-improvement)
* [Acknowledgements](#acknowledgements)
* [Contact](#contact)
<!-- * [License](#license) -->


## General Information
- The project consists of Diego Dominguez-Albiter, Saroj Gautam, Connor Lopez, Abhinesh Dahal, and Angel Verde-Salas.
- We are creating a Fitness App. This will have precreated workouts, a workout history, and a list of exercises.
- We are creating this application to improve the fitness knowledge of the general public.
- We undertook this project as we found fitness to be very closely correlated to health which has great importance. This app will hopefully lead people to have a more positive relationship with working out which will help their health.
<!-- You don't have to answer all the questions - just the ones relevant to your project. -->
![App Cover](./src/coverphoto.jpg)

## Technologies Used
- React Native
- FastAPI
- ExRx.net Exercise JSON Rest API 

## Sprint 1 

### Contributions

**Diego** "Designed some of the intial frontend and UI visualization through wireframes. Created the frontend for two of the user stories. Also created unit tests for some user stories."

SCRUM-50: Design – frontend UI layout -- Front Page <br>
Jira - https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-50 <br>
Pull Request - https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/1


SCRUM-10: Design – ui flow -- Exercise Templates <br>
Jira - https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-10 <br>
Pull Request - https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/2

SCRUM-54: Unit Testing Front Page <br>
Jira - https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-54 <br>
Pull Request - https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/18

SCRUM-33: UI/Frontend Workout History <br>
Jira - https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-33 <br>
Pull Request - https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/22

SCRUM-25: UI/Frontend Custom Workout <br>
Jira - https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-25 <br>
Pull Request - https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/24

SCRUM-27: Unit Testing Custom Workout <br>
Jira - https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-27 <br>
Pull Request - https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/33

SCRUM-6: Unit Testing Exercise Library <br>
Jira - https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-6 <br>
Pull Request - https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/32

**Abhinesh** "Built the backend exercise API client and connected the frontend to the FastAPI backend. Implemented exercise templates on both backend and frontend, and wrote unit tests for template endpoints."

SCRUM-53: Integration - Exercise Data Loading (ExRx API via FastAPI) <br>
Jira - https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-53 <br>
Pull Request - https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/7

SCRUM-52: Implementation - Connect Navigation to Backend (FastAPI) <br>
Jira - https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-52 <br>
Pull Request - https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/21

SCRUM-9: Implementation - Backend (Exercise Templates) <br>
Jira - https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-9 <br>
Pull Request - https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/21

SCRUM-11: Implementation - Frontend (Exercise Templates) <br>
Jira - https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-11 <br>
Pull Request - https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/25

SCRUM-12: Unit Testing - Template <br>
Jira - https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-12 <br>
Pull Request - https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/26


**Angel** "Designed database schema for Exercise template, Data model and api for Exercise library and the schema for custom workout creator. Implemented the custom workoout creator andmade the UI for the Calender View"


SCRUM-35:Calender View-WORKOUT HISTORY<br>
Jira - https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-35<br>
Pull Request - https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/19


SCRUM-8: Design - Database Schema-EXERCISE TEMPLATES <br>
Jira - https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-8 <br>
Pull Request - https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/3

SCRUM-2: Design - API & Data Model-EXERCISE LIBRARY <br>
Jira - https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-2 <br>
Pull Request - https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/10

SCRUM-22: Design - Schema, CUSTOM WORKOUT CREATOR <br>
Jira - https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-22 <br>
Pull Request - https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/14

SCRUM-26: Implementation-CUSTOM WORKOUT CREATOR <br>
Jira - https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-26 <br>
Pull Request - https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/28

**Connor** "Designed UI wireframe for the workout library. Created the backend for the workout history page, custom workout creator page, and prgress tracker.
Created backend for logging workouts, and implemented it in the frontend."

SCRUM-7: Design - UI Wireframe -- Exercise Library <br>
Jira - https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-7 <br>
Pull Request - https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/4 

SCRUM-31: Backend -- Workout History <br>
Jira - https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-31 <br>
Pull Request - https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/15

SCRUM-24 Backend -- Custom Workout Creator <br>
Jira - https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-24 <br>
Pull Request - https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/16

SCRUM-32: Workout Logging API -- Workout History <br>
Jira - https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-32 <br>
Pull Request - https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/23

SCRUM-36: Progress Tracking -- Workout History <br>
Jira - https://cs3398-zabraks-s26.atlassian.net/browse/SCRUM-36 <br>
Pull Request - https://bitbucket.org/cs3398-zabraks-s26/main_application/pull-requests/27 

**Saroj**

### Burnup Chart
![alt text](app\src\images\image.png)
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

1. As a customer, I would like to have a secure account to protect sensitive information so I can use my account across platforms. 
## Screenshots
![Example screenshot](./img/screenshot.png)
<!-- If you have screenshots you'd like to share, include them here. -->


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
How does one go about using it?
Provide various use cases and code examples here.

`write-your-code-here`


## Project Status
Project is: _in progress_ / _complete_ / _no longer being worked on_. If you are no longer working on it, provide reasons why.


## Room for Improvement
Include areas you believe need improvement / could be improved. Also add TODOs for future development.

## Room for improvement:
- Improvement to be done 1
- Improvement to be done 2

## To do:
- Library of Exercises
    - The library of exercises will be a huge catalog of different exercises a person can do and can find in depth information. This will help users who are not familar with different exercises so that they can learn a variety of them.
- Workout Templates
    - This will be prebuilt workouts with different exercises within them. This will be the main appeal of the application. This will be used for people who are not sure which exercises pair up together or who just want to boot up a workout without thinking of what to do beforehand.
- History of Workouts 
    - This will be a place in which a person may catalog the workouts which they have done previously. This is helpful for a user so that they know what they have done previously and what they must do in the future.


## Acknowledgements
Give credit here.
- This project was inspired by...
- This project was based on [this tutorial](https://www.example.com).
- Many thanks to...


<!-- Optional -->
<!-- ## License -->
<!-- This project is open source and available under the [... License](). -->

<!-- You don't have to include all sections - just the one's relevant to your project -->