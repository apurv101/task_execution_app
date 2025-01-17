document.getElementById("fetch-task").addEventListener("click", async () => {
    const taskId = document.getElementById("task-id-input").value.trim();
    if (!taskId) {
        alert("Please enter a valid Task ID");
        return;
    }

    const taskDetailsDiv = document.getElementById("task-details");
    taskDetailsDiv.innerHTML = "Fetching task details...";

    try {
        // Fetch task details
        const taskResponse = await fetch(`/api/task/${taskId}`);
        if (!taskResponse.ok) {
            taskDetailsDiv.innerHTML = "Failed to fetch task details. Please check the Task ID.";
            return;
        }
        const taskData = await taskResponse.json();

        // Fetch instructions linked to the task
        const instructionsResponse = await fetch(`/api/instructions/${taskId}`);
        const instructions = instructionsResponse.ok ? await instructionsResponse.json() : [];

        // Fetch actions for each instruction
        for (const instruction of instructions) {
            const actionsResponse = await fetch(`/api/actions/${instruction.instruction_id}`);
            instruction.actions = actionsResponse.ok ? await actionsResponse.json() : [];
        }

        // Render the hierarchical data
        renderTaskDetails(taskData, instructions, taskDetailsDiv);
    } catch (error) {
        taskDetailsDiv.innerHTML = "An error occurred while fetching task details.";
        console.error(error);
    }
});

function renderTaskDetails(taskData, instructions, container) {
    container.innerHTML = `
        <h2>Task: ${taskData.task_id}</h2>
        <p><strong>Description:</strong> ${taskData.description || 'N/A'}</p>
        <p><strong>Status:</strong> ${taskData.status || 'N/A'}</p>
        <p><strong>Start Time:</strong> ${taskData.start_time ? new Date(taskData.start_time).toLocaleString() : 'N/A'}</p>
        <p><strong>End Time:</strong> ${taskData.end_time ? new Date(taskData.end_time).toLocaleString() : 'In Progress'}</p>
        <p><strong>Additional Data:</strong> ${taskData.additional_data || 'N/A'}</p>
        <p><strong>Instruction History:</strong> <pre>${JSON.stringify(taskData.instructions, null, 2)}</pre></p>
        <h3>Associated Prompts:</h3>
        ${taskData.associated_prompts && taskData.associated_prompts.length > 0 ? `
            <ul>
                ${taskData.associated_prompts.map(prompt => `<li><pre>${prompt}</pre></li>`).join('')}
            </ul>
        ` : '<p>No associated prompts found.</p>'}
        <h3>Instructions:</h3>
        ${instructions.length > 0 ? `
            <ul>
                ${instructions.map(inst => renderInstruction(inst)).join('')}
            </ul>
        ` : '<p>No instructions found for this task.</p>'}
    `;
}

function renderInstruction(instruction) {
    return `
        <li>
            <p><strong>Instruction ID:</strong> ${instruction.instruction_id}</p>
            <p><strong>Instruction:</strong> ${instruction.instruction || 'N/A'}</p>
            <p><strong>Status:</strong> ${instruction.status || 'N/A'}</p>
            <p><strong>Start Time:</strong> ${instruction.start_time ? new Date(instruction.start_time).toLocaleString() : 'N/A'}</p>
            <p><strong>End Time:</strong> ${instruction.end_time ? new Date(instruction.end_time).toLocaleString() : 'In Progress'}</p>
            <p><strong>Screenshot:</strong> ${instruction.screenshot_path ? `<a href="${instruction.screenshot_path}" target="_blank">View</a>` : 'No screenshot available'}</p>
            <h4>Actions:</h4>
            ${instruction.actions && instruction.actions.length > 0 ? `
                <ul>
                    ${instruction.actions.map(action => renderAction(action)).join('')}
                </ul>
            ` : '<p>No actions found for this instruction.</p>'}
        </li>
    `;
}

function renderAction(action) {
    return `
        <li>
            <p><strong>Action ID:</strong> ${action.action_id}</p>
            <p><strong>Task:</strong> ${action.task || 'N/A'}</p>
            <p><strong>Status:</strong> ${action.status || 'N/A'}</p>
            <p><strong>Start Time:</strong> ${action.start_time ? new Date(action.start_time).toLocaleString() : 'N/A'}</p>
            <p><strong>End Time:</strong> ${action.end_time ? new Date(action.end_time).toLocaleString() : 'In Progress'}</p>
            <p><strong>Screenshots and Plots:</strong></p>
            <ul>
                ${action.screenshot_path ? `<li>Screenshot: <a href="${action.screenshot_path}" target="_blank">View</a></li>` : ''}
                ${action.google_vision_plot ? `<li>Google Vision Plot: <a href="${action.google_vision_plot}" target="_blank">View</a></li>` : ''}
                ${action.yolo_plot ? `<li>YOLO Plot: <a href="${action.yolo_plot}" target="_blank">View</a></li>` : ''}
                ${action.yolo_icons_plot ? `<li>YOLO Icons Plot: <a href="${action.yolo_icons_plot}" target="_blank">View</a></li>` : ''}
                ${action.annotated_plot ? `<li>Annotated Plot: <a href="${action.annotated_plot}" target="_blank">View</a></li>` : ''}
            </ul>
            <p><strong>LLM Output:</strong> <pre>${JSON.stringify(action.llm_output, null, 2)}</pre></p>
        </li>
    `;
}
