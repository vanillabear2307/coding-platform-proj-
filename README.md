# CodeArena - Competitive Programming Portal

**A full-stack, real-time web portal that functions as a complete Integrated Development Environment (IDE) with a primary focus on competitive coding.**

This project is a highly complex, multi-service application featuring a modern React frontend, an Express.js backend for authentication and data management, and a dedicated Python FastAPI microservice for secure code execution and AI integrations.

---

## 🚀 Key Features

*   **Professional IDE Experience**: Built with **Monaco Editor** (the same engine behind VS Code) featuring syntax highlighting, auto-completion, and a resizable split-pane layout.
*   **Secure Code Execution**: A custom-built execution engine that spins up isolated **Docker containers** on the fly to compile and run user code securely in C, C++, Java, and Python.
*   **Real-time Streaming**: Code execution results and logs stream back to the client instantly via **WebSockets**, providing immediate feedback without HTTP polling.
*   **AI Test Case Generation**: Integrated with **Google Gemini 2.0 AI** to automatically read problem descriptions and generate tricky, edge-case test inputs on demand.
*   **Secure Authentication**: **Google OAuth 2.0** integration via Passport.js for seamless and secure user logins.
*   **Dark/Light Mode**: Full theme support with context-based state management for comfortable coding at night.
*   **Comprehensive Problem Set**: Users can browse, filter (by tags, difficulty, language), and solve algorithmic challenges, or add new problems to the database directly from the UI.

---

## 🛠️ Technology Stack

*   **Python 3 / FastAPI**
*   **Docker SDK for Python** (`docker-py`)
*   **WebSockets** for log streaming
*   **Google Generative AI SDK** (Gemini)

---

## 💻 Local Development Setup

To run this project locally, you must have **Node.js**, **Python 3**, and **Docker Desktop** (running) installed on your machine.

### 1. Build the Docker Sandbox Image
The execution engine relies on a custom Docker image to run user code. 
Create a file named `Dockerfile` anywhere with this content:
```dockerfile
FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y gcc g++ default-jdk python3 && rm -rf /var/lib/apt/lists/*
RUN useradd -m -d /home/sandbox -s /bin/bash sandbox
WORKDIR /home/sandbox/code
USER sandbox
```
Build it via terminal:
```bash
docker build -t code-sandbox .
```

### 2. Environment Variables
You will need two `.env` files.

**Root Directory (`/.env`)**:
```env
DB_MONGO_URI=<your-mongodb-atlas-uri>
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<your-google-oauth-client-secret>
COOKIE_KEY=any_random_string
PORT=5000
NODE_ENV=development
```

**FastAPI Directory (`/fastapi-service/.env`)**:
```env
GEMINI_API_KEY=<your-gemini-api-key>
CORS_ORIGIN=http://localhost:3000
```

### 3. Install Dependencies
```bash
# Install Express backend dependencies
npm install

# Install React frontend dependencies
cd client
npm install
cd ..

# Install FastAPI dependencies
cd fastapi-service
python -m venv venv
# Activate venv: `source venv/bin/activate` (Mac/Linux) or `.\venv\Scripts\activate` (Windows)
pip install -r requirements.txt
```

### 4. Run the Application
You need two terminals to run the full stack:

**Terminal 1 (FastAPI Executor)**:
```bash
cd fastapi-service
# (Ensure venv is activated)
uvicorn main:app --host 127.0.0.1 --port 8000
```

**Terminal 2 (Express + React)**:
```bash
npm run dev
```
The React frontend will automatically open at `http://localhost:3000`.

---

## 🌐 Deployment Architecture

This project is built to support a distributed, cross-origin architecture:
*   **Frontend**: Deployed as a static SPA on **Vercel**.
*   **Backends**: Hosted on a persistent server (e.g., Oracle Cloud Free Tier or a local machine via Cloudflare Tunnels) capable of running the Docker daemon.
*   **Routing**: The React application dynamically routes API requests and WebSocket connections to the backend domain via the `VITE_API_URL` environment variable.

---
