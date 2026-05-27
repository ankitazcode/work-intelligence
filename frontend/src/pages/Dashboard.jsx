import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard({ token }) {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [ranking, setRanking] = useState([]);



  // Load tasks
  const loadTasks = async () => {
    try {
      const res = await axios.get("http://localhost:5000/tasks", {
        headers: { Authorization: token },
      });
      setTasks(res.data);
    } catch (err) {
      console.log(err.message);
    }
  };

  //ranking

  const loadRanking = async () => {
  try {
    const res = await axios.get("http://localhost:5000/ranking", {
      headers: { Authorization: token },
    });

    setRanking(res.data);
  } catch (err) {
    console.log(err.message);
  }
};

  // Add task
  const addTask = async () => {
    try {
      await axios.post(
        "http://localhost:5000/task",
        { title },
        { headers: { Authorization: token } }
      );

      setTitle("");
      loadTasks(); // refresh list
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    loadTasks();
    loadRanking();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard 🚀</h1>

      {/* ADD TASK */}
      <h2>Add Task ➕</h2>
      <input
        placeholder="Enter task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button onClick={addTask} style={{ marginLeft: 10 }}>
        Add
      </button>

      {/* TASK LIST */}
      <h2 style={{ marginTop: 30 }}>Tasks 📋</h2>

{tasks.length === 0 ? (
  <p>No tasks found</p>
) : (
  tasks.map((task) => (
    <div
      key={task.id}
      style={{
        padding: 10,
        margin: 5,
        border: "1px solid gray",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* ranking area */}
      
      <h2 style={{ marginTop: 30 }}>🏆 Employee Ranking</h2>

{ranking.length === 0 ? (
  <p>No ranking data</p>
) : (
  ranking.map((r, index) => (
    <div
      key={r.user_id}
      style={{
        padding: 10,
        margin: 5,
        border: "1px solid gold",
      }}
    >
      🥇 Rank {index + 1}
      <br />
      User ID: {r.user_id}
      <br />
      Tasks: {r.total_tasks}
    </div>
  ))
)}

      <span>{task.title}</span>

      <button
  onClick={async () => {
    const userId = prompt("Enter Employee ID");

    await axios.put(
      `http://localhost:5000/task/assign/${task.id}`,
      { user_id: userId },
      { headers: { Authorization: token } }
    );

    loadTasks();
  }}
>
  Assign 👤
</button>

      <button
        onClick={async () => {
          try {
            await axios.delete(
              `http://localhost:5000/task/${task.id}`,
              {
                headers: { Authorization: token },
              }
            );

            loadTasks();
          } catch (err) {
            console.log(err.message);
          }
        }}
      >
        Delete ❌
      </button>
    </div>
  ))
)}
    </div>
  );
}