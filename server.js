const express = require("express");
const { MongoClient } = require("mongodb");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3005;

// MongoDB setup
const MONGO_URI = "mongodb://localhost:27017";
const client = new MongoClient(MONGO_URI);
const dbName = "aimyable";

const imagesPath = '/Users/apoorvagarwal/Desktop/aimyable/backend-server/images';



app.use(express.static(path.join(__dirname, "public")));

app.use('/images', express.static(imagesPath));



// Endpoint to fetch task details by task_id
app.get("/api/task/:taskId", async (req, res) => {
    const taskId = req.params.taskId;

    try {
        await client.connect();
        const db = client.db(dbName);

        // Fetch the task from MongoDB
        const task = await db.collection("tasks").findOne({ task_id: taskId });

        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.json(task);
    } catch (error) {
        console.error("Error fetching task details:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Endpoint to fetch instructions by task_id
app.get("/api/instructions/:instructionId", async (req, res) => {
    const instructionId = req.params.instructionId;

    try {
        await client.connect();
        const db = client.db(dbName);

        // Fetch instructions for the given task_id
        const instruction = await db
            .collection("instructions")
            .findOne({ instruction_id: instructionId });

        if (!instruction) {
            return res.status(404).json({ error: "Instruction not found" });
        }

        // Create a sanitized version of the instruction object

        const sanitizedInstruction = {
            instruction_id: instruction.instruction_id,
            instruction: instruction.instruction,
            generated_instruction: instruction.generated_instruction,
            status: instruction.status,
            start_time: instruction.start_time,
            actions: instruction.actions,
            screenshot_path: instruction.screenshot_path,
            notes : instruction.notes,
            prompt: instruction.prompt,
        };

        res.json(sanitizedInstruction);
    } catch (error) {
        console.error("Error fetching instructions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



// Endpoint to fetch actions by action_id
app.get("/api/actions/:actionId", async (req, res) => {
    const actionId = req.params.actionId;

    try {
        await client.connect();
        const db = client.db(dbName);

        // Fetch actions for the given action_id
        const action = await db
            .collection("actions")
            .findOne({ action_id: actionId });

        if (!action) {
            return res.status(404).json({ error: "Action not found" });
        }

        console.log(action.prompt)

        // Create a sanitized version of the action object
        const sanitizedAction = {
            action_id: action.action_id,
            task: action.task || "N/A",
            status: action.status || "N/A",
            start_time: action.start_time || null,
            end_time: action.end_time || null,
            screenshot_path: action.screenshot_path || null,
            google_vision_plot: action.google_vision_plot || null,
            yolo_plot: action.yolo_plot || null,
            yolo_icons_plot: action.yolo_icons_plot || null,
            annotated_plot: action.annotated_plot || null,
            llm_output: action.llm_output || null,
            prompt: action.prompt || null,
        };

        res.json(sanitizedAction);
    } catch (error) {
        console.error("Error fetching actions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



// Endpoint to fetch all tasks ordered by time
app.get("/api/tasks", async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const tasks = await db
            .collection("tasks")
            .find()
            .sort({ start_time: -1 }) // Sort by start_time in descending order
            .toArray();
        res.json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



app.get("/api/tasks/:taskId/instructions", async (req, res) => {
    const taskId = req.params.taskId;

    try {
        await client.connect();
        const db = client.db(dbName);

        // Fetch instructions where "task_id" matches
        const instructions = await db
            .collection("instructions")
            .find({ task_id: taskId })
            .sort({ start_time: -1 }) // optional sort by most recent
            .toArray();

        res.json(instructions);
    } catch (error) {
        console.error("Error fetching instructions for task:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Endpoint to fetch all instructions ordered by time
app.get("/api/instructions", async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const instructions = await db
            .collection("instructions")
            .find()
            .sort({ start_time: -1 }) // Sort by start_time in descending order
            .toArray();
        res.json(instructions);
    } catch (error) {
        console.error("Error fetching instructions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Endpoint to fetch all actions ordered by time
app.get("/api/actions", async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const actions = await db
            .collection("actions")
            .find()
            .sort({ start_time: -1 }) // Sort by start_time in descending order
            .toArray();
        res.json(actions);
    } catch (error) {
        console.error("Error fetching actions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// ─────────────────────────────────────────────────────────────────────────────
// NEW ENDPOINT: Fetch actions by instruction_id
// ─────────────────────────────────────────────────────────────────────────────
app.get("/api/instructions/:instructionId/actions", async (req, res) => {
    const instructionId = req.params.instructionId;

    try {
        await client.connect();
        const db = client.db(dbName);

        // Fetch actions where "instruction_id" matches
        const actions = await db
            .collection("actions")
            .find({ instruction_id: instructionId })
            .sort({ start_time: -1 }) // optional sort by most recent
            .toArray();

        res.json(actions);
    } catch (error) {
        console.error("Error fetching actions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
// ─────────────────────────────────────────────────────────────────────────────


// API endpoint to serve images using absolute path
app.get('/api/image-path/*', (req, res) => {
    try {
        // Get the absolute path from the URL and decode it
        const imagePath = decodeURIComponent(req.params[0]);
        
        // Check if file exists
        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ error: 'Image not found' });
        }

        // Determine content type based on file extension
        const ext = path.extname(imagePath).toLowerCase();
        let contentType = 'image/jpeg'; // default
        if (ext === '.png') contentType = 'image/png';
        else if (ext === '.gif') contentType = 'image/gif';
        else if (ext === '.webp') contentType = 'image/webp';

        // Stream the image file
        res.setHeader('Content-Type', contentType);
        fs.createReadStream(imagePath).pipe(res);
    } catch (error) {
        console.error('Error serving image:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
