const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2/promise");
const app = express();
const cors = require("cors");

app.use(bodyParser.json());
app.use(cors());

const port = 8900;
let conn;

const initMySQL = async () => {
  conn = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "webdb",
    port: 8830,
  });
};

async function getQueryResult(query, params) {
  return await conn.query(query, params);
}

// Create Task
app.post("/tasks", async (req, res) => {
  const { title, description, status, due_date } = req.body;
  try {
    const [result] = await getQueryResult(
      "INSERT INTO tasks (title, description, status, due_date) VALUES (?, ?, ?, ?)",
      [title, description, status, due_date]
    );
    res.status(201).json({ id: result.insertId, title, description, status, due_date });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Tasks
app.get("/tasks", async (req, res) => {
  try {
    const [tasks] = await getQueryResult("SELECT * FROM tasks");
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Task by ID
app.get("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [task] = await getQueryResult("SELECT * FROM tasks WHERE id = ?", [id]);
    if (task.length === 0) return res.status(404).json({ error: "Task not found" });
    res.json(task[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Task
app.put("/tasks/:id", async (req, res) => {
  console.log("Received data:", req.body); // Debug log
  
  const { id } = req.params;
  const { title, description, status, due_date } = req.body;

  try {
    if (!title || !description || !status || !due_date) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const [result] = await getQueryResult(
      "UPDATE tasks SET title = ?, description = ?, status = ?, due_date = ? WHERE id = ?",
      [title, description, status, due_date, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task updated successfully" });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: error.message });
  }
});



// Delete Task
app.delete("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await getQueryResult("DELETE FROM tasks WHERE id = ?", [id]);
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, async () => {
  await initMySQL();
  console.log(`Server is running on port ${port}`);
});