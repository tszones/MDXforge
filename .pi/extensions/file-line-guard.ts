import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const MAX_NOTIFY_CHARS = 4000;

export default function fileLineGuardExtension(pi: ExtensionAPI) {
  pi.on("message_end", async (event, ctx) => {
    if (event.message.role !== "assistant") return;

    const result = await pi.exec("node", ["scripts/check-file-lines.cjs"]);

    if (result.code !== 0) {
      ctx.ui.notify(
        `File line limit exceeded.\n${truncate(result.stderr || result.stdout)}`,
        "warn",
      );
    }
  });

  pi.registerCommand("line-check", {
    description: "Check project source files against the 500-line limit",
    handler: async (_args, ctx) => {
      const result = await pi.exec("node", ["scripts/check-file-lines.cjs"]);
      ctx.ui.notify(
        result.code === 0
          ? result.stdout.trim()
          : `File line limit exceeded.\n${truncate(result.stderr || result.stdout)}`,
        result.code === 0 ? "info" : "warn",
      );
    },
  });
}

function truncate(value: string): string {
  if (value.length <= MAX_NOTIFY_CHARS) return value;
  return `${value.slice(0, MAX_NOTIFY_CHARS)}\n... truncated`;
}
