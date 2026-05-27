import { complete } from "@earendil-works/pi-ai";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const MEMORY_DIR = ".pi/memory";
const MEMORY_FILE = "project-memory.md";
const MAX_CONTEXT_CHARS = 12_000;
const MAX_TRANSCRIPT_CHARS = 24_000;

type ContentBlock = {
  type?: string;
  text?: string;
  thinking?: string;
  name?: string;
  arguments?: Record<string, unknown>;
};

type AgentMessageLike = {
  role?: string;
  content?: unknown;
  toolName?: string;
  isError?: boolean;
};

type MemoryItem = {
  type: "preference" | "decision" | "convention" | "todo" | "fact" | "constraint";
  text: string;
  confidence?: number;
};

const memoryPath = (cwd: string) => path.join(cwd, MEMORY_DIR, MEMORY_FILE);

const textFromContent = (content: unknown): string => {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";

  const parts: string[] = [];
  for (const item of content) {
    if (!item || typeof item !== "object") continue;
    const block = item as ContentBlock;
    if (block.type === "text" && typeof block.text === "string") parts.push(block.text);
    if (block.type === "toolCall" && typeof block.name === "string") {
      parts.push(`[tool_call ${block.name} ${JSON.stringify(block.arguments ?? {})}]`);
    }
  }
  return parts.join("\n");
};

const buildTranscript = (messages: AgentMessageLike[]): string => {
  const chunks: string[] = [];

  for (const message of messages) {
    if (message.role === "user" || message.role === "assistant") {
      const text = textFromContent(message.content).trim();
      if (text) chunks.push(`${message.role.toUpperCase()}:\n${text}`);
    }

    if (message.role === "toolResult" && message.isError) {
      const text = textFromContent(message.content).trim();
      if (text) chunks.push(`TOOL_ERROR ${message.toolName ?? "unknown"}:\n${text.slice(0, 2000)}`);
    }
  }

  const transcript = chunks.join("\n\n---\n\n");
  return transcript.length > MAX_TRANSCRIPT_CHARS
    ? transcript.slice(transcript.length - MAX_TRANSCRIPT_CHARS)
    : transcript;
};

const stripJsonFence = (text: string): string => {
  const trimmed = text.trim();
  const match = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return match ? match[1].trim() : trimmed;
};

const parseItems = (text: string): MemoryItem[] => {
  try {
    const parsed = JSON.parse(stripJsonFence(text));
    const rawItems = Array.isArray(parsed) ? parsed : parsed.items;
    if (!Array.isArray(rawItems)) return [];

    return rawItems
      .filter((item): item is MemoryItem => {
        if (!item || typeof item !== "object") return false;
        const maybe = item as Partial<MemoryItem>;
        return typeof maybe.type === "string" && typeof maybe.text === "string";
      })
      .map((item) => ({ ...item, text: item.text.trim() }))
      .filter((item) => item.text.length >= 12)
      .slice(0, 5);
  } catch {
    return [];
  }
};

const buildExtractionPrompt = (existingTail: string, transcript: string): string =>
  [
    "You extract durable project memory from a Pi coding-agent conversation.",
    "Return ONLY JSON: {\"items\":[{\"type\":\"preference|decision|convention|todo|fact|constraint\",\"text\":\"...\",\"confidence\":0.0}]}",
    "Extract only info worth remembering across future sessions.",
    "Good: user preferences, project-specific decisions, conventions, constraints, recurring gotchas, unresolved TODOs.",
    "Skip: transient command output, obvious repo facts already in AGENTS.md, secrets/API keys/tokens, vague chatter, one-off progress logs, low-confidence guesses.",
    "If nothing valuable, return {\"items\":[]}.",
    "Avoid duplicates from existing memory.",
    "Keep each text one concise sentence, Chinese ok if user used Chinese.",
    "",
    "<existing_memory_tail>",
    existingTail,
    "</existing_memory_tail>",
    "",
    "<conversation>",
    transcript,
    "</conversation>",
  ].join("\n");

const readMemory = async (filePath: string): Promise<string> => {
  try {
    return await readFile(filePath, "utf8");
  } catch {
    return "";
  }
};

const ensureMemoryFile = async (filePath: string) => {
  await mkdir(path.dirname(filePath), { recursive: true });
  const current = await readMemory(filePath);
  if (current.trim()) return current;

  const initial = [
    "# Project Memory",
    "",
    "Auto-extracted durable memories from Pi conversations.",
    "Keep only useful, cross-session project knowledge. Do not store secrets.",
    "",
  ].join("\n");
  await writeFile(filePath, initial, "utf8");
  return initial;
};

const appendItems = async (filePath: string, items: MemoryItem[], sessionFile?: string) => {
  const current = await ensureMemoryFile(filePath);
  const existingLower = current.toLowerCase();
  const unique = items.filter((item) => !existingLower.includes(item.text.toLowerCase()));
  if (unique.length === 0) return 0;

  const timestamp = new Date().toISOString();
  const lines = [
    current.endsWith("\n") ? "" : "\n",
    `## ${timestamp}`,
    sessionFile ? `Session: ${sessionFile}` : undefined,
    "",
    ...unique.map((item) => `- **${item.type}**: ${item.text}`),
    "",
  ].filter((line): line is string => line !== undefined);

  await writeFile(filePath, current + lines.join("\n"), "utf8");
  return unique.length;
};

export default function projectMemoryExtension(pi: ExtensionAPI) {
  pi.on("before_agent_start", async (event, ctx) => {
    const content = await readMemory(memoryPath(ctx.cwd));
    const trimmed = content.trim();
    if (!trimmed) return;

    const tail = trimmed.length > MAX_CONTEXT_CHARS ? trimmed.slice(-MAX_CONTEXT_CHARS) : trimmed;
    return {
      systemPrompt: `${event.systemPrompt}\n\n## Project Memory (.pi/memory/project-memory.md)\nUse this durable project memory when relevant.\n\n${tail}`,
    };
  });

  pi.on("agent_end", async (event, ctx) => {
    const transcript = buildTranscript(event.messages as AgentMessageLike[]);
    if (!transcript.trim()) return;

    const model = ctx.model;
    const cwd = ctx.cwd;
    const sessionFile = ctx.sessionManager.getSessionFile();
    const signal = ctx.signal;
    if (!model) return;

    const auth = await ctx.modelRegistry.getApiKeyAndHeaders(model);
    if (!auth.ok || !auth.apiKey) return;

    const filePath = memoryPath(cwd);
    const current = await ensureMemoryFile(filePath);
    const existingTail = current.slice(-MAX_CONTEXT_CHARS);

    const response = await complete(
      model,
      {
        messages: [
          {
            role: "user" as const,
            content: [{ type: "text" as const, text: buildExtractionPrompt(existingTail, transcript) }],
            timestamp: Date.now(),
          },
        ],
      },
      { apiKey: auth.apiKey, headers: auth.headers, signal },
    );

    const text = response.content
      .filter((part): part is { type: "text"; text: string } => part.type === "text")
      .map((part) => part.text)
      .join("\n");

    await appendItems(filePath, parseItems(text), sessionFile);
  });

  pi.registerCommand("memory-status", {
    description: "Show project memory file status",
    handler: async (_args, ctx) => {
      const filePath = memoryPath(ctx.cwd);
      const content = await ensureMemoryFile(filePath);
      ctx.ui.notify(`${path.relative(ctx.cwd, filePath)} · ${content.length} chars`, "info");
    },
  });
}
