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
app.use(express.json());  // Add middleware to parse JSON bodies
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

// Endpoint to delete a task by task_id
app.delete("/api/task/:taskId", async (req, res) => {
    const taskId = req.params.taskId;

    try {
        await client.connect();
        const db = client.db(dbName);

        const result = await db.collection("tasks").deleteOne({ task_id: taskId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        console.error("Error deleting task:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Endpoint to fetch instructions by instruction_id
app.get("/api/instructions/:instructionId", async (req, res) => {
    const instructionId = req.params.instructionId;

    try {
        await client.connect();
        const db = client.db(dbName);

        // Fetch instructions by instruction_id
        const instruction = await db
            .collection("instructions")
            .findOne({ instruction_id: instructionId });

        if (!instruction) {
            return res.status(404).json({ error: "Instruction not found" });
        }

        res.json(instruction);
    } catch (error) {
        console.error("Error fetching instructions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Endpoint to delete an instruction by instruction_id
app.delete("/api/instructions/:instructionId", async (req, res) => {
    const instructionId = req.params.instructionId;

    try {
        await client.connect();
        const db = client.db(dbName);

        const result = await db.collection("instructions").deleteOne({ instruction_id: instructionId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Instruction not found" });
        }

        res.json({ message: "Instruction deleted successfully" });
    } catch (error) {
        console.error("Error deleting instruction:", error);
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

        res.json(action);
    } catch (error) {
        console.error("Error fetching actions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Endpoint to delete an action by action_id
app.delete("/api/actions/:actionId", async (req, res) => {
    const actionId = req.params.actionId;

    try {
        await client.connect();
        const db = client.db(dbName);

        const result = await db.collection("actions").deleteOne({ action_id: actionId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: "Action not found" });
        }

        res.json({ message: "Action deleted successfully" });
    } catch (error) {
        console.error("Error deleting action:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Endpoint to fetch all tasks ordered by hierarchy_level
app.get("/api/tasks", async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const tasks = await db
            .collection("tasks")
            .find()
            .sort({ hierarchy_level: 1 }) // Sort by hierarchy_level in ascending order
            .toArray();
        res.json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Endpoint to fetch instructions by parent task_id
app.get("/api/tasks/:taskId/instructions", async (req, res) => {
    const taskId = req.params.taskId;

    try {
        await client.connect();
        const db = client.db(dbName);

        // Fetch instructions where parent.task_id matches
        const instructions = await db
            .collection("instructions")
            .find({ "parent.task_id": taskId })
            .sort({ sequence: 1 }) // Sort by sequence in ascending order
            .toArray();

        res.json(instructions);
    } catch (error) {
        console.error("Error fetching instructions for task:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Endpoint to fetch all instructions ordered by hierarchy_level and sequence
app.get("/api/instructions", async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const instructions = await db
            .collection("instructions")
            .find()
            .sort({ hierarchy_level: 1, sequence: 1 }) // Sort by hierarchy and then sequence
            .toArray();
        res.json(instructions);
    } catch (error) {
        console.error("Error fetching instructions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Endpoint to fetch all actions ordered by hierarchy_level and sequence
app.get("/api/actions", async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const actions = await db
            .collection("actions")
            .find()
            .sort({ hierarchy_level: 1, sequence: 1 }) // Sort by hierarchy and then sequence
            .toArray();
        res.json(actions);
    } catch (error) {
        console.error("Error fetching actions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Endpoint to fetch actions by parent instruction_id
app.get("/api/instructions/:instructionId/actions", async (req, res) => {
    const instructionId = req.params.instructionId;

    try {
        await client.connect();
        const db = client.db(dbName);

        // Fetch actions where parent.instruction_id matches
        const actions = await db
            .collection("actions")
            .find({ "parent.instruction_id": instructionId })
            .sort({ sequence: 1 }) // Sort by sequence in ascending order
            .toArray();

        res.json(actions);
    } catch (error) {
        console.error("Error fetching actions for instruction:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Endpoint to update instruction validation
app.post("/api/instructions/:instructionId/validation", async (req, res) => {
    const instructionId = req.params.instructionId;
    const validation = req.body;

    // Validate request body
    if (!validation || typeof validation.valid !== 'boolean' || typeof validation.validation_comments !== 'string') {
        return res.status(400).json({ 
            error: "Invalid request body. Expected: { valid: boolean, validation_comments: string }" 
        });
    }

    try {
        await client.connect();
        const db = client.db(dbName);

        const result = await db.collection("instructions").findOneAndUpdate(
            { instruction_id: instructionId },
            { $set: { validation: validation } },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({ error: "Instruction not found" });
        }

        res.json(result);
    } catch (error) {
        console.error("Error updating instruction validation:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Endpoint to update action validation
app.post("/api/actions/:actionId/validation", async (req, res) => {
    console.log(`[${new Date().toISOString()}] POST /api/actions/${req.params.actionId}/validation`);
    const actionId = req.params.actionId;
    const validation = req.body;
    
    console.log('Request body:', JSON.stringify(validation, null, 2));

    // Validate request body
    if (!validation || typeof validation.valid !== 'boolean' || typeof validation.validation_comments !== 'string') {
        console.error('Validation error: Invalid request body format');
        return res.status(400).json({ 
            error: "Invalid request body. Expected: { valid: boolean, validation_comments: string }" 
        });
    }

    try {
        await client.connect();
        const db = client.db(dbName);

        console.log(`Updating validation for action: ${actionId}`);
        console.log('Update data:', JSON.stringify(validation, null, 2));

        const result = await db.collection("actions").findOneAndUpdate(
            { action_id: actionId },
            { $set: { validation: validation } },
            { returnDocument: 'after' }
        );

        if (!result) {
            console.error(`Action not found: ${actionId}`);
            return res.status(404).json({ error: "Action not found" });
        }

        console.log('Action validation updated successfully');
        
        res.json(result);
    } catch (error) {
        console.error("Error updating action validation:", error);
        console.error("Stack trace:", error.stack);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

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
