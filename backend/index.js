const express = require("express");
const cors = require("cors");
const app = express();

const pool = require("./db");

app.use(cors());
app.use(express.json());

//this is aded for auth in task and tasks

function auth(req, res, next) {
    const token = req.header("Authorization");

    if (!token) {
        return res.status(401).json({ message: "No token, access denied" });
    }

    try {
        const verified = require("jsonwebtoken").verify(token, "mysecret123");
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid token" });
    }
}

app.get("/", (req, res) => {
    res.send("Server is running 🚀");
});


//login api

const jwt = require("jsonwebtoken");

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (user.rows.length === 0) {
            return res.status(400).json({ message: "User not found" });
        }

        const validPassword = await bcrypt.compare(
            password,
            user.rows[0].password
        );

        if (!validPassword) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const token = jwt.sign(
            { id: user.rows[0].id },
            "mysecret123",
            { expiresIn: "1h" }
        );

        res.json({
            token,
            user: {
                id: user.rows[0].id,
                email: user.rows[0].email
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

//add auth here after working if its not worckeble remove it from task and tasks ok

app.post("/task",auth, async (req, res) => {
    try {
        const { title } = req.body;

        const newTask = await pool.query(
            "INSERT INTO tasks (title) VALUES ($1) RETURNING *",
            [title]
        );

        res.json(newTask.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});


app.get("/tasks", auth, async (req, res) => {
    try {
        const tasks = await pool.query("SELECT * FROM tasks");
        res.json(tasks.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

const bcrypt = require("bcryptjs");

app.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
            [name, email, hashedPassword]
        );

        res.json(newUser.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

//users api

app.get("/users", async (req, res) => {
    try {
        const users = await pool.query("SELECT * FROM users");
        res.json(users.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

//delete task api

app.delete("/task/:id", auth, async (req, res) => {
    try {
        const { id } = req.params;

        await pool.query(
            "DELETE FROM tasks WHERE id = $1",
            [id]
        );

        res.json({ message: "Task deleted successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

//assing task to user API

app.put("/task/assign/:id", auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.body;

        const updated = await pool.query(
            "UPDATE tasks SET user_id = $1 WHERE id = $2 RETURNING *",
            [user_id, id]
        );

        res.json(updated.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// user table view api

app.get("/users", auth, async (req, res) => {
    try {
        const users = await pool.query("SELECT id, name, email FROM users");
        res.json(users.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// task count per user

app.get("/ranking", auth, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT user_id, COUNT(*) as total_tasks
            FROM tasks
            WHERE user_id IS NOT NULL
            GROUP BY user_id
            ORDER BY total_tasks DESC
        `);

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

//last line

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
