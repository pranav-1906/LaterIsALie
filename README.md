# LaterIsALie. ⚡

> **Because later never comes.**  
> A hyper-focused, anti-procrastination task manager designed to eliminate decision fatigue. 

LaterIsALie isn't just another to-do list. It acts as a personal productivity engine that recommends the exact task you should work on based on your available time, current energy levels, and task priority. 

Answer a single question: *"What should I work on right now?"*

## ✨ Features

### 🧠 Smart Recommendations ("Decide For Me")
Input your available time and current energy (1-5), and the app will instantly filter, sort, and recommend the top 3 tasks from your backlog. It automatically boosts "Quick Wins" (tasks under 5 minutes) and matches tasks to your current mental bandwidth.

### 🎨 Premium Glassmorphism UI
*   **Pro-Designer Aesthetic:** Features a precision dot-grid background, ambient lighting, and frosted glass panels.
*   **Dark/Light Mode:** Seamless theme toggling powered by CSS variables and saved in local storage.
*   **Micro-Interactions:** Satisfying strikethrough animations, dynamic typewriter placeholders, and smooth task-entry transitions.
*   **Fully Responsive:** Mobile-optimized layout that feels like a native app.

### ⚡ Power-User Accessibility
*   **Global Hotkeys:** Press `/` from anywhere in the app to instantly focus the task input.
*   **Enter-to-Submit:** Frictionless task entry without needing to touch the mouse.
*   **Contextual Filters:** One-click "Low Energy" filter and automatic "Quick Win" badging for the 2-Minute Rule.

### 🔒 Anonymous Persistent Memory
*   **No Login Required:** Uses an Anonymous Client ID system generated via `localStorage`.
*   **SQLite Database:** Tasks are permanently saved to a backend database mapped to your unique browser session. You can refresh, close the tab, or return days later, and your specific backlog will still be there.

---

## 🛠️ Tech Stack

This project was intentionally built **without heavy front-end frameworks like React** to demonstrate mastery of native browser APIs, vanilla JavaScript state management, and modern CSS architecture.

*   **Backend:** [FastAPI](https://fastapi.tiangolo.com/) (Python)
*   **Database:** SQLite3 (via Python standard library)
*   **Frontend Logic:** Vanilla JavaScript (ES6+), Fetch API
*   **Styling:** HTML5, CSS3, Custom CSS Properties, [Phosphor Icons](https://phosphoricons.com/)
*   **Deployment:** Render (ASGI Web Service)

---

## 🚀 Running the Project Locally

### Prerequisites
*   Python 3.8+ installed on your machine.

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/YOUR-USERNAME/later-is-a-lie.git](https://github.com/YOUR-USERNAME/later-is-a-lie.git)
   cd later-is-a-lie
   ```

2. **Create and activate a virtual environment:**
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate
   
   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install the dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the FastAPI server (Uvicorn):**
   ```bash
   uvicorn main:app --reload
   ```

5. **Open the app:**
   Navigate to `http://localhost:8000` in your browser. 
   *(Note: You can view the automatically generated API documentation at `http://localhost:8000/docs`)*

---

## 📂 Project Architecture

```text
later-is-a-lie/
├── main.py              # FastAPI server, database logic, and route handlers
├── requirements.txt     # Python dependencies
├── .gitignore           # Ignores venv and local SQLite database
└── static/              # Frontend client files
    ├── index.html       # DOM structure and Phosphor Icons
    ├── style.css        # Glassmorphism, animations, and responsive media queries
    ├── app.js           # Event listeners, state management, and API calls
    └── favicon.png      # Tab icon
```

---

## 👨‍💻 Author

Built for **Pranav** | [LinkedIn](https://www.linkedin.com/in/pranav1906/)
