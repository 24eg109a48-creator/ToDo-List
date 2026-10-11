# SmartTask – Full Stack To-Do Management System

SmartTask is a full-stack task manager built as a 3rd-year CSE project. Users register, log in, and manage **their own** tasks (create, edit, delete, complete, search, filter, sort, overdue detection) from a responsive React dashboard. The backend is a secured Spring Boot REST API that stores data in MySQL.

---

## 1. Features

- Register and log in with **JWT authentication** (passwords hashed with **BCrypt**)
- Each user only ever sees and changes **their own tasks** (ownership is enforced on the server)
- Create, view, edit, delete tasks; mark complete; change status (Pending / In progress / Completed)
- **Search** in title and description, **filter** by status (incl. *Overdue*) and priority, **sort** by title, due date, created date or priority (ascending/descending)
- Dashboard with statistic cards: total, completed, pending, in progress, overdue
- Profile page: name, email, account created date, task statistics, update your name
- Validation on both sides (Jakarta Validation on the server, instant checks in the React forms)
- Structured JSON errors, loading spinners, empty states, error states, delete confirmation dialog
- Responsive layout for desktop, tablet and mobile
- Swagger / OpenAPI documentation and automated JUnit tests

## 2. Technologies

| Layer | Technology |
|-------|------------|
| Frontend | React 18, JavaScript, React Router 6, Axios, HTML5, CSS3, Vite (dev server/build tool) |
| Backend | Java 17, Spring Boot 3.2, Spring Web, Spring Data JPA, Hibernate, Spring Security, JWT (jjwt), Jakarta Validation, Maven |
| Database | MySQL 8 (JPA/Hibernate) |
| API docs | springdoc-openapi (Swagger UI) |
| Testing | JUnit 5, Spring Boot Test, MockMvc (H2 in-memory database for tests only) |

> Node.js is needed **only** to run the React/Vite frontend. The backend is 100 % Java + Spring Boot.

## 3. Architecture

```
React (browser, :5173)
   │  Axios  – adds "Authorization: Bearer <JWT>"
   ▼
REST API  (Spring Boot, :8080)
   │  JwtAuthenticationFilter → SecurityConfig
   ▼
Controller  →  Service  →  Repository
                              │  Spring Data JPA / Hibernate
                              ▼
                           MySQL (smarttask_db)
```

- **Controller** – receives HTTP requests, validates the body (`@Valid`), returns DTOs and status codes.
- **Service** – business rules (ownership checks, search/filter/sort logic, overdue calculation).
- **Repository** – database access with Spring Data JPA (`TaskSpecifications` builds the dynamic search/filter query).
- **DTOs** – requests/responses are separate classes, so entities (and password hashes) are never exposed.
- **GlobalExceptionHandler** (`@RestControllerAdvice`) – turns every error into the same JSON shape.

## 4. Folder structure

```
smarttask-fullstack/
├── frontend/                     React app (Vite)
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── .env.example              only needed if the backend URL changes
│   └── src/
│       ├── components/           Navbar, Sidebar, TaskCard, TaskForm, TaskList, SearchBar, FilterBar,
│       │                         DashboardStats, LoadingSpinner, ConfirmDialog, ProtectedRoute,
│       │                         TaskManager, AppLayout, Icon
│       ├── pages/                Login, Register, Dashboard, Tasks, Profile, NotFound
│       ├── services/             api.js (Axios + interceptors), authService, taskService, userService
│       ├── context/              AuthContext.jsx (login state)
│       ├── hooks/                useAuth.js
│       ├── utils/                helpers.js
│       ├── styles/               global.css
│       ├── App.jsx               routes
│       └── main.jsx              entry point
├── backend/                      Spring Boot app
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/smarttask/
│       │   ├── SmartTaskApplication.java
│       │   ├── controller/       AuthController, TaskController, UserController
│       │   ├── service/          AuthService, TaskService, UserService
│       │   ├── repository/       UserRepository, TaskRepository, TaskSpecifications
│       │   ├── entity/           User, Task, TaskStatus, TaskPriority
│       │   ├── dto/              request/response classes
│       │   ├── security/         JwtService, JwtAuthenticationFilter, SecurityConfig, CustomUserDetailsService
│       │   ├── exception/        GlobalExceptionHandler + custom exceptions
│       │   └── config/           CorsConfig, OpenApiConfig
│       ├── main/resources/application.properties
│       └── test/                 integration tests (+ test application.properties using H2)
├── database/schema.sql           table creation script
├── README.md
└── .gitignore
```

## 5. Prerequisites

- **JDK 17 or newer** (`java -version`)
- **Maven 3.8+** (`mvn -version`)
- **MySQL 8** running locally (`mysql --version`)
- **Node.js 18 or newer** and npm (`node -v`)

## 6. Database setup

Create the database (choose one way):

```bash
# Option A - run the provided script (creates the database AND both tables)
mysql -u root -p < database/schema.sql

# Option B - only create the empty database; Spring Boot/Hibernate creates the tables on first start
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS smarttask_db CHARACTER SET utf8mb4;"
```

Even without either option the backend creates `smarttask_db` automatically (`createDatabaseIfNotExist=true` in the JDBC URL) as long as your MySQL user has permission to create databases.

### Tell the backend your MySQL username and password

No password is hard-coded. `application.properties` reads environment variables and falls back to defaults (`root` / empty password):

| Variable | Default | Meaning |
|----------|---------|---------|
| `DB_USERNAME` | `root` | MySQL user |
| `DB_PASSWORD` | *(empty)* | MySQL password |
| `DB_HOST` / `DB_PORT` / `DB_NAME` | `localhost` / `3306` / `smarttask_db` | where the database is |
| `JWT_SECRET` | a development-only key | secret used to sign JWTs (min. 32 characters) – change it for real deployments |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | allowed frontend origin(s), comma-separated |

Set them in the same terminal before starting the backend:

```bash
# Windows PowerShell
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_mysql_password"

# Windows Command Prompt
set DB_USERNAME=root
set DB_PASSWORD=your_mysql_password

# macOS / Linux
export DB_USERNAME=root
export DB_PASSWORD=your_mysql_password
```

(Alternatively edit `spring.datasource.username` / `spring.datasource.password` in `backend/src/main/resources/application.properties` – just don't commit your real password to GitHub.)

## 7. Run the project

**Terminal 1 – backend**

```bash
cd backend
mvn spring-boot:run
```

**Terminal 2 – frontend**

```bash
cd frontend
npm install
npm run dev
```

| What | URL |
|------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |

Open http://localhost:5173, click **Create an account**, register, log in, and add your first task.

### Run the tests

```bash
cd backend
mvn test
```

The tests start the real Spring application with an in-memory H2 database, so MySQL is **not** required for them. They cover registration, login, task creation, retrieval, update, deletion, search/filter/sort, and unauthorized access (no token, forged token, another user's task).

### Build the frontend for production (optional)

```bash
cd frontend
npm run build
```

If your backend is not on `http://localhost:8080`, copy `frontend/.env.example` to `frontend/.env` and change `VITE_API_BASE_URL`.

## 8. API documentation

Interactive documentation: **http://localhost:8080/swagger-ui.html** (click *Authorize* and paste the token from the login response).

| Method | Endpoint | Auth | Description | Success |
|--------|----------|------|-------------|---------|
| POST | `/api/auth/register` | public | Create an account | 201 |
| POST | `/api/auth/login` | public | Log in, returns JWT | 200 |
| GET | `/api/users/profile` | JWT | Get my profile | 200 |
| PUT | `/api/users/profile` | JWT | Update my name | 200 |
| GET | `/api/tasks` | JWT | List my tasks (search/filter/sort) | 200 |
| GET | `/api/tasks/stats` | JWT | Counts for dashboard/profile | 200 |
| GET | `/api/tasks/{id}` | JWT | Get one task | 200 |
| POST | `/api/tasks` | JWT | Create a task | 201 |
| PUT | `/api/tasks/{id}` | JWT | Update a task | 200 |
| DELETE | `/api/tasks/{id}` | JWT | Delete a task | 204 |
| PATCH | `/api/tasks/{id}/complete` | JWT | Mark as completed | 200 |
| PATCH | `/api/tasks/{id}/status` | JWT | Change status | 200 |

**Query parameters for `GET /api/tasks`** (all optional)

| Parameter | Values | Example |
|-----------|--------|---------|
| `search` | any text (title or description) | `?search=project` |
| `status` | `ALL`, `PENDING`, `IN_PROGRESS`, `COMPLETED`, `OVERDUE` | `?status=OVERDUE` |
| `priority` | `ALL`, `LOW`, `MEDIUM`, `HIGH` | `?priority=HIGH` |
| `sortBy` | `title`, `dueDate`, `createdAt`, `priority` | `?sortBy=dueDate` |
| `direction` | `asc`, `desc` | `?direction=asc` |

Parameters can be combined: `/api/tasks?search=report&status=PENDING&priority=HIGH&sortBy=dueDate&direction=asc`

**Example – register**

```json
POST /api/auth/register
{ "name": "Asha Rao", "email": "asha@example.com", "password": "secret123", "confirmPassword": "secret123" }
```

**Example – create a task**

```json
POST /api/tasks
Authorization: Bearer <token>

{ "title": "Finish DBMS assignment", "description": "Normalisation questions",
  "dueDate": "2026-12-01", "priority": "HIGH", "status": "PENDING" }
```

**Error format** (all errors look like this; `errors` only appears for validation problems)

```json
{ "timestamp": "2026-01-01T10:00:00", "status": 404, "message": "Task not found" }

{ "timestamp": "2026-01-01T10:00:00", "status": 400, "message": "Validation failed",
  "errors": { "title": "Title is required", "dueDate": "Due date is required" } }
```

| Status | Meaning |
|--------|---------|
| 400 | Validation failed / bad input |
| 401 | Missing, expired or invalid JWT, or wrong email/password |
| 404 | Not found – also returned when a task belongs to another user |

## 9. How JWT authentication works

1. **Register** – `POST /api/auth/register` validates the data, checks the email is not taken, hashes the password with **BCrypt** and saves the user.
2. **Login** – `POST /api/auth/login` finds the user by email and compares the password with the stored hash. If it matches, the server creates a **JWT**: a signed string containing the user's email (`sub`), the issue time and an expiry time (24 h by default). It is signed with the server's secret (`JWT_SECRET`), so nobody can change it without being detected.
3. **React stores the session** – `AuthContext` keeps the token and user in state and in `localStorage` (so a refresh keeps you logged in).
4. **Every later request** – the Axios interceptor in `services/api.js` adds `Authorization: Bearer <token>`.
5. **The server checks it first** – `JwtAuthenticationFilter` runs before the controllers: it verifies the signature and expiry, loads the user, and marks the request as authenticated. `SecurityConfig` only allows `/api/auth/register` and `/api/auth/login` without a token; everything else returns **401**.
6. **Ownership** – controllers pass the authenticated email to the service; the service looks tasks up with `findByIdAndUserId(...)`. Changing a task ID in the URL therefore returns *404*, never someone else's data.
7. **Expired/invalid token** – the Axios response interceptor sees the 401, clears the saved session and redirects to `/login`.
8. **Logout** – the token and user are removed from state and `localStorage`. (JWTs are stateless, so "logout" means the browser forgets the token.)

## 10. Common errors and solutions

| Problem | Solution |
|---------|----------|
| `Access denied for user 'root'@'localhost'` | Wrong MySQL password. Set `DB_USERNAME` / `DB_PASSWORD` (section 6) in the same terminal you run `mvn spring-boot:run` from. |
| `Communications link failure` / `Connection refused` | MySQL is not running. Start the MySQL service and check the port (default 3306). |
| `Unknown database 'smarttask_db'` | Create it (section 6), or give your MySQL user permission to create databases. |
| `Port 8080 was already in use` | Stop the other program using 8080, or run with `--server.port=8081` and set `VITE_API_BASE_URL=http://localhost:8081/api` in `frontend/.env`. |
| `release version 17 not supported` / `invalid target release` | Your JDK is older than 17. Install JDK 17+ and check `mvn -version` shows it. |
| `Cannot reach the server...` shown in the browser | The backend is not running, or runs on another port. |
| CORS error in the browser console | The frontend must run on `http://localhost:5173`. For another origin set `CORS_ALLOWED_ORIGINS` and restart the backend. |
| Port 5173 already in use | Vite is configured with `strictPort`; close the other Vite server (or edit `vite.config.js`). |
| `npm install` fails | Use Node.js 18+; delete `node_modules` and run `npm install` again. |
| Redirected to the login page again and again | The token expired or `JWT_SECRET` changed. Just log in again. |
| `Invalid email or password` for a correct password | Emails are stored in lower case; make sure you registered with that email. |
| Swagger "Authorize" button gives 401 | Paste only the token (without the word `Bearer`) from the login response. |

## 11. Verification checklist

Before running the application, verify the local toolchain:

```bash
node --version
npm --version
java -version
mvn -version
```

Recommended versions are Node.js 18+ and JDK 17+. Maven 3.8+ is required for the backend.

Then run the checks below from the project root:

```bash
cd frontend
npm install
npm run build

cd ../backend
mvn test
mvn package
```

The frontend build must finish with a `dist/` directory, and all backend tests must pass before treating the project as ready for submission.

## 12. Viva cheat-sheet

- **Why DTOs?** They control exactly which fields leave the server (the password hash never does) and decouple the API from the database tables.
- **Why `STATELESS` sessions?** The JWT carries the identity, so the server stores no session; any request is authenticated on its own.
- **How is search implemented?** `TaskSpecifications` builds a `WHERE` condition (`LOWER(title) LIKE ... OR LOWER(description) LIKE ...`) with Spring Data JPA Specifications; filters are added with `.and(...)`.
- **Why sort priority in Java?** Priority is stored as text, so the database would sort `HIGH, LOW, MEDIUM` alphabetically. The service sorts by enum order (`LOW < MEDIUM < HIGH`) instead.
- **How is overdue decided?** `dueDate < today AND status != COMPLETED` – the same rule is used for the filter, the flag in each task and the dashboard count.
- **How do you prevent accessing another user's task?** Every query includes the owner's id (`findByIdAndUserId`); a foreign id returns 404.
- **Why is CSRF disabled?** The API uses a header token and no cookies, so classic CSRF attacks do not apply.
- **What is JPA/Hibernate doing?** JPA is the standard (annotations like `@Entity`, `@ManyToOne`); Hibernate is the implementation that generates the SQL.
