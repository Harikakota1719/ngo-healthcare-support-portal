# CareNet - NGO Healthcare Support Portal

A complete, modern full-stack web application designed for healthcare-oriented Non-Governmental Organizations (NGOs). This portal helps streamline patient intake, volunteer registrations, and public FAQ support using Google Gemini AI integrations.

This application is built as a developer portfolio assignment for a **Full Stack Developer (AI Enabled)** role, showcasing robust frontend forms, a responsive dashboard, and smart AI capabilities.

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Problem Statement](#problem-statement)
3. [Features](#features)
4. [AI Integration & Features](#ai-integration--features)
5. [Tech Stack](#tech-stack)
6. [Folder Structure](#folder-structure)
7. [Installation & Setup](#installation--setup)
8. [Environment Variables](#environment-variables)
9. [Deployment Guide](#deployment-guide)
    - [Deploying to Render (Backend & Frontend)](#deploying-to-render-backend--frontend)
    - [Deploying to Vercel (Serverless Hybrid)](#deploying-to-vercel-serverless-hybrid)
10. [NGO Use Case & Workflow](#ngo-use-case--workflow)

---

## 🌟 Project Overview
**CareNet** bridges the gap between underprivileged patients needing medical assistance and passionate volunteers who want to offer their expertise. Rather than managing applications through manual spreadsheets, CareNet automates intake forms, uses **Google Gemini AI** to write clinical-style patient summaries for rapid triaging, and provides a smart chat assistant to handle standard administrative questions.

---

## ⚠️ Problem Statement
NGOs dealing with medical sponsorships face two major bottlenecks:
1. **Inefficient Triage**: Patient applications contain long, unstructured medical descriptions. Coordinators spend hours reading files just to identify the core ailment, location, and urgency.
2. **Support Overhead**: Volunteers and families continuously ask the same administrative questions (e.g., "What documents do I need to present?", "How can I volunteer?"), which pulls staff away from active field work.

CareNet solves these bottlenecks by integrating lightweight AI services directly into the entry pipeline.

---

## ⚡ Features
- **Responsive Navigation**: A sticky glassmorphic navigation bar with active scrolling observation and a collapsible mobile menu.
- **Home / Hero Dashboard**: Displays dynamic statistics cards (Patients Sourced, Volunteers Registered, Requests Handled) pulled from the server.
- **Patient Intake Request**: Input validation (email, phone, text), custom fields, and an automated backend webhook triggering AI summarization.
- **Volunteer Registry**: Capture contact information, skills/expertise, availability hours, and operation cities.
- **AI FAQ Chatbot**: Responsive dialogue box with auto-scrolling, a bot typing indicator, quick-question chips, and historical context tracking.
- **Admin Dashboard Panel (Concept Level)**: Unified views for NGO staff, featuring distinct tabs for Patient Requests (showing the AI-generated summaries and expandable details) and Volunteers.
- **Sleek Contacts & Toasts**: Validation forms for general inquiries coupled with non-blocking slide-in toast notifications.

---

## 🤖 AI Integration & Features

The application utilizes the **Google Gemini API** (using the `gemini-1.5-flash` model via the official `@google/generative-ai` SDK).

### 1. AI Patient Request Summary
When a patient submits a request, their unstructured "Description of Issue" is sent to the backend API. The backend requests Gemini to generate a **2 to 3-sentence summary** emphasizing:
- The primary medical condition or symptoms
- The type of support (monetary, surgical, consultation) needed
- Location-based urgency

The generated summary is stored in-memory alongside the patient record and displayed on the **Admin Dashboard** in a highlight bubble, allowing coordinators to quickly scan through requests.

### 2. FAQ Conversational Chatbot
The chat panel features a customized system prompt instructing Gemini to act as a CareNet NGO representative. It answers administrative questions regarding:
- NGO programs and hospital collaborations
- Document guidelines (ID proofs, medical records, income proof)
- Volunteer registration methods
- Emergency advice (routing callers immediately to local emergency helplines)

### 3. Graceful Mock Fallback (Offline Mode)
If the application is run without a `GEMINI_API_KEY`, the server automatically logs a warning and shifts into **Mock AI Fallback Mode**. The chatbot utilizes keyword-matching logic to provide accurate, pre-written FAQ answers, and the summarizer writes template summaries. This ensures the application remains fully testable offline or without active API keys.

---

## 🛠️ Tech Stack
- **Frontend**: Semantic HTML5, Vanilla CSS3 (Custom properties, grid layouts, glassmorphism, keyframe animations), Modern ES6 JavaScript.
- **Backend**: Node.js, Express.js.
- **AI Library**: `@google/generative-ai` (Gemini SDK).
- **Environment Management**: `dotenv` (local settings configuration).
- **Cross-Origin Requests**: `cors`.

---

## 📁 Folder Structure

```
ngo-healthcare-portal/
├── api/
│   └── index.js        # Core Express App & Endpoint Router (Vercel Serverless entry)
├── public/             # Static Frontend Files
│   ├── css/
│   │   └── styles.css  # Premium stylesheet
│   ├── js/
│   │   └── app.js      # Form submissions, Chat interface, Dashboard logic
│   └── index.html      # Main application SPA structure
├── .env.example        # Env configuration placeholder template
├── .gitignore          # Files ignored by git
├── package.json        # Dependencies list & start scripts
├── server.js           # Express Local & Render server execution file
├── vercel.json         # Vercel serverless routing configuration
└── README.md           # Documentation (this file)
```

---

## 🚀 Installation & Setup

Follow these steps to run the application locally:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (version 18 or higher recommended).

### 1. Clone or Extract the Project
Open your terminal and navigate to the project directory:
```bash
cd ngo-healthcare-portal
```

### 2. Install Dependencies
Install the required packages defined in `package.json`:
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory. You can copy the template:
```bash
copy .env.example .env
```
Open the `.env` file and replace the placeholder with your actual Gemini API Key:
```env
PORT=3000
GEMINI_API_KEY=AIzaSyYourActualKeyHere...
```
*(You can obtain a free Gemini API Key from [Google AI Studio](https://aistudio.google.com/))*

### 4. Run the Application
Start the server in development mode (using nodemon):
```bash
npm run dev
```
Alternatively, run with standard node:
```bash
npm start
```
Open your browser and visit: **`http://localhost:3000`**

---

## ☁️ Deployment Guide

### Deploying to Render (Backend & Frontend)
Render is ideal for long-running Node.js/Express servers. Since our project serves the static frontend from the Express backend, a single Web Service deployment hosts the entire portal:

1. Create a free account at [Render](https://render.com/).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository containing this project.
4. Set the following configurations:
    - **Language**: `Node`
    - **Build Command**: `npm install`
    - **Start Command**: `node server.js`
5. Click **Advanced** and add the following Environment Variable:
    - `GEMINI_API_KEY` = *[Your Google Gemini API Key]*
6. Click **Deploy Web Service**. Render will build and deploy the app on a public URL.

### Deploying to Vercel (Serverless Hybrid)
This application includes a custom `vercel.json` descriptor that separates the server routes into serverless functions and serves frontend assets through Vercel Edge:

1. Install the Vercel CLI globally or use the Vercel web dashboard:
   ```bash
   npm install -g vercel
   ```
2. Run the deployment command in the root folder:
   ```bash
   vercel
   ```
3. Set up the project linking options (press Enter to accept defaults).
4. Add the environment variable to your project dashboard on Vercel:
    - Set `GEMINI_API_KEY` in the project settings under **Environment Variables**.
5. Deploy to production:
   ```bash
   vercel --prod
   ```
Vercel will build `/api/index.js` as an edge serverless function and serve your `/public` folder as static files.

---

## 🏥 NGO Use Case & Workflow

1. **Intake**: A patient from a remote town fills out a request detailing a complex, paragraph-long medical history of heart disease and high medical costs.
2. **Enrichment**: Upon submission, the API receives the detail and calls Gemini. The AI translates the paragraph into a clear, clinical summary: *"Patient has chronic hypertension and require surgical assistance. Needs medication sponsorship."*
3. **Triaging**: The administrative worker opens the **Admin Panel** and instantly reads the summaries of the latest 10 requests in 30 seconds rather than spending 20 minutes reading full paragraphs.
4. **Matching**: The worker switches to the **Volunteers** tab, filters local volunteers, and connects an available Cardiologist from the matching city to the patient request.
