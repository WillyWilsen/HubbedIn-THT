# Birthday Reminder Application

## Overview

This application is built using **NestJS** and **MongoDB**, with a scheduled worker to send birthday messages to users based on their timezone. The worker runs periodically to check birthdays and logs a message if it's a user's birthday.

## Features

- User management (CRUD operations)
- Automated birthday reminders based on user timezone
- Runs as a **Docker container**
- Uses **MongoDB** as the database

---

## Prerequisites

Ensure you have the following installed:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

---

## Running the Application

### 1. Clone the repository:

```sh
git clone https://github.com/WillyWilsen/HubbedIn-THT.git
cd HubbedIn-THT
```

### 2. Start the application and worker using Docker:

```sh
docker-compose up --build
```

This will spin up:

- A **NestJS** server
- A **MongoDB** database
- The **Birthday Worker**

### 3. Stopping the application:

```sh
docker-compose down
```

---

## API Usage

### 1. Create a new user

**Request:**

```sh
POST /users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "johndoe@example.com",
  "birthday": "1990-04-04",
  "timezone": "America/New_York"
}
```

**Response:**

```json
{
  "_id": "67eefd3e71e94adf356b079d",
  "name": "John Doe",
  "email": "johndoe@example.com",
  "birthday": "1990-04-04T00:00:00.000Z",
  "timezone": "America/New_York",
  "createdAt": "2025-04-03T21:27:26.446Z",
  "updatedAt": "2025-04-03T21:30:29.183Z",
  "__v": 0
}
```

### 2. Get user by id

**Request:**

```sh
GET /users/:id
```

**Response:**

```json
{
  "_id": "67eefd3e71e94adf356b079d",
  "name": "John Doe",
  "email": "johndoe@example.com",
  "birthday": "1990-04-04T00:00:00.000Z",
  "timezone": "America/New_York",
  "createdAt": "2025-04-03T21:27:26.446Z",
  "updatedAt": "2025-04-03T21:27:26.446Z",
  "__v": 0
}
```

---

## Worker Functionality

- The **Birthday Worker** runs **hourly** (`0 * * * *` cron schedule)
- It checks all users to see if their birthday falls on the **current date** and if the local time is **9 AM**
- If so, it logs a **Happy Birthday** message

Example log output:

```
[BirthdayWorker] Running birthday worker...
[BirthdayWorker] 🎉 Happy Birthday, Alice! 🎂
```

---

## Assumptions & Design Decisions

- The worker does **not** send real notifications, only logs messages.
- Birthdays are stored in **UTC** but checked against each user’s **timezone**.
- The application is containerized to ensure an easy setup with **Docker**.
- The database uses **MongoDB** for flexible data storage.
