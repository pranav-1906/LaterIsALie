from fastapi import FastAPI, Header, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import uuid

app = FastAPI(title="LaterIsALie API")

# --- DATABASE SETUP ---
def get_db():
    conn = sqlite3.connect("tasks.db", check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            duration INTEGER,
            priority INTEGER,
            energy INTEGER,
            completed BOOLEAN NOT NULL CHECK (completed IN (0, 1))
        )
    """)
    conn.commit()

init_db()

# --- PYDANTIC MODEL ---
class Task(BaseModel):
    id: Optional[str] = None
    title: str
    duration: int
    priority: int
    energy: int
    completed: bool = False

# --- API ROUTES ---
@app.get("/api/tasks", response_model=List[Task])
async def get_tasks(user_id: str = Header(..., alias="User-Id")):
    conn = get_db()
    cursor = conn.execute("SELECT * FROM tasks WHERE user_id = ?", (user_id,))
    rows = cursor.fetchall()
    
    tasks = []
    for row in rows:
        tasks.append(Task(
            id=row["id"],
            title=row["title"],
            duration=row["duration"],
            priority=row["priority"],
            energy=row["energy"],
            completed=bool(row["completed"])
        ))
    return tasks

@app.post("/api/tasks", response_model=Task)
async def add_task(task: Task, user_id: str = Header(..., alias="User-Id")):
    task.id = str(uuid.uuid4())
    conn = get_db()
    conn.execute(
        "INSERT INTO tasks (id, user_id, title, duration, priority, energy, completed) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (task.id, user_id, task.title, task.duration, task.priority, task.energy, int(task.completed))
    )
    conn.commit()
    return task

@app.put("/api/tasks/{task_id}/complete")
async def complete_task(task_id: str, user_id: str = Header(..., alias="User-Id")):
    conn = get_db()
    cursor = conn.execute("SELECT completed FROM tasks WHERE id = ? AND user_id = ?", (task_id, user_id))
    row = cursor.fetchone()
    
    if not row:
        raise HTTPException(status_code=404, detail="Task not found")
        
    new_status = 0 if row["completed"] else 1
    conn.execute("UPDATE tasks SET completed = ? WHERE id = ? AND user_id = ?", (new_status, task_id, user_id))
    conn.commit()
    
    return {"message": "Task updated"}

@app.delete("/api/tasks/completed")
async def clear_completed_tasks(user_id: str = Header(..., alias="User-Id")):
    conn = get_db()
    conn.execute("DELETE FROM tasks WHERE completed = 1 AND user_id = ?", (user_id,))
    conn.commit()
    
    return {"message": "Completed tasks cleared"}

# --- STATIC FILES ---
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return FileResponse("static/favicon.png")

@app.get("/")
async def serve_frontend():
    return FileResponse("static/index.html")