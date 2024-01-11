import { Agent } from "../agent/agent";
import { formatKnowledgeCutOffPrompt } from "../llm/llm";

export const getMainAgentSystemPrompt = (agent: Agent): string => {
  return `
You are a virtual assistant named Astra.
${formatKnowledgeCutOffPrompt(agent.llm.getKnowledgeCutOff())}
`;
};

// Do NOT send download links to sandbox files. Use \`send_file\` tool instead.

// You have access to any file sent to you.
export const getWorkerAgentSystemPrompt = (agent: Agent): string => {
  return `
You will be given a task in the following format:
<task> ... </task>

Your goal is to achieve the task.
Take a deep breath and think step by step.
${formatKnowledgeCutOffPrompt(agent.llm.getKnowledgeCutOff())}
  `;
};

export const getSummaryPrompt = (
  status: "done" | "failed" | "timeout",
  task: string,
): string => {
  let prompt = `
<task>
${task}
</task>
\n\n`.trimStart();
  let success = false;

  switch (status) {
    case "done": {
      prompt += `This task is marked as done.`;
      success = true;
      break;
    }
    case "failed": {
      prompt += `This task is marked as failed.`;
      success = false;
      break;
    }
    case "timeout": {
      prompt += `You reached the iteration limit.`;
      success = false;
      break;
    }
    default:
      throw new Error(`Unknown status ${status}`);
  }

  const def = `
Fill the following JSON about the task. It will be sent over API.
\`\`\`
{
  "status": "done" | "failed" | "timeout",
  "results": "
    // Task results. For example derived data.
    // Rewrite content from previous messages here if needed.
    - ...
  ",
  "steps": [
    ${
      !success
        ? `// Describe the reason you failed`
        : `// Describe why you succeeded`
    }
    "1. ...",
    "2. ...,
  ],
  "output_files": [
    {
      "path": "Absolute path",
      "description": "File description",
    }
  ],
  "output_urls": [
    {
      "url": "Url",
      "description": "Url description",
    }
  ],
  ... // Any other relevant information
}
\`\`\`
`.trimEnd();

  prompt += `\n${def}`;

  return prompt;
};

export const getVerificationPrompt = (
  task: string,
  results: string,
): string => {
  let prompt = `
<task>
${task}
</task>
\n\n`.trimStart();

  const def = `
<task_results>
\`\`\`
${results}
</task_results>
\`\`\`

Verify the task results.
The task results must match the task description.
Mark the task results as correct or incorrect.
Use deductive reasoning.
`.trimEnd();

  prompt += `\n${def}`;

  return prompt;
};
