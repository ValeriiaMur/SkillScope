import Anthropic from "@anthropic-ai/sdk";

export interface ScoreResult {
  score: number;
  rationale: string;
}

export async function scoreExecution(
  skillName: string,
  input: string,
  output: string,
  apiKey: string,
  model: string = "claude-sonnet-4-20250514"
): Promise<ScoreResult> {
  const client = new Anthropic({ apiKey: apiKey });

  const response = await client.messages.create({
    model,
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `You are an AI skill quality evaluator. Grade the following skill execution on a scale of 0-100.

Skill: ${skillName}
Input: ${input}
Output: ${output}

Evaluate based on:
- Correctness: Does the output correctly address the input?
- Completeness: Is the output thorough and complete?
- Quality: Is the output well-structured and clear?
- Relevance: Is the output relevant to the skill's purpose?

Respond ONLY with valid JSON: {"score": <number 0-100>, "rationale": "<brief explanation>"}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const parsed = JSON.parse(text);
    return {
      score: Math.max(0, Math.min(100, Number(parsed.score))),
      rationale: String(parsed.rationale),
    };
  } catch {
    return { score: 50, rationale: "Failed to parse scoring response" };
  }
}
