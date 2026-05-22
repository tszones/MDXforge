import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const WRITE_TOOLS = new Set(["write", "edit"]);

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
  });
}
