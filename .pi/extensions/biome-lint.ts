import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const WRITE_TOOLS = new Set(["write", "edit"]);
const MAX_NOTIFY_CHARS = 4000;

export default function biomeLintExtension(pi: ExtensionAPI) {
  pi.on("turn_end", async (event, ctx) => {
    // Only trigger if this turn produced file changes
    const didWrite = event.toolResults.some(
      (t: { toolName: string }) => WRITE_TOOLS.has(t.toolName),
    );
    if (!didWrite) return;

    // Run biome lint + auto-fix
    const { stdout, stderr, code } = await pi.exec("node_modules/.bin/biome", [
      "check",
      "--write",
      ".",
    ]);

    if (code !== 0) {
      // biome returned non-zero — there are remaining issues it couldn't auto-fix
      ctx.ui.notify(
        `Biome lint issues remaining (manual fix needed).\n${stderr || stdout}`,
        "warn",
      );
    }
    // Run file length guard
    const fileLines = await pi.exec("node", ["scripts/check-file-lines.cjs"]);

    if (fileLines.code !== 0) {
      ctx.ui.notify(
        `File line limit exceeded.\n${truncate(fileLines.stderr || fileLines.stdout)}`,
        "warn",
      );
    }
  });
}

function truncate(value: string): string {
  if (value.length <= MAX_NOTIFY_CHARS) return value;
  return `${value.slice(0, MAX_NOTIFY_CHARS)}\n... truncated`;
}
