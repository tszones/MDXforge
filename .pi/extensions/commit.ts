import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

function quoteArg(arg: string): string {
  return arg.includes(" ") ? JSON.stringify(arg) : arg;
}

function normalizeMessage(args: string): string {
  const message = args.trim();
  return message.length > 0 ? message : "Update project";
}

export default function commitExtension(pi: ExtensionAPI) {
  pi.registerCommand("commit", {
    description: "Stage all changes and create an English git commit. Usage: /commit <English message>",
    handler: async (args, ctx) => {
      const { stdout: status, code: statusCode } = await pi.exec("git", ["status", "--porcelain"]);

      if (statusCode !== 0) {
        ctx.ui.notify("Not a git repository.", "error");
        return;
      }

      if (status.trim().length === 0) {
        ctx.ui.notify("Nothing to commit.", "info");
        return;
      }

      const message = normalizeMessage(args);
      await pi.exec("git", ["add", "-A"]);
      const { stdout, stderr, code } = await pi.exec("git", ["commit", "-m", message]);

      if (code !== 0) {
        ctx.ui.notify(`Commit failed.\n${stderr || stdout}`, "error");
        return;
      }

      const { stdout: head } = await pi.exec("git", ["rev-parse", "--short", "HEAD"]);
      ctx.ui.notify(`Committed ${head.trim()}: ${quoteArg(message)}`, "info");
    },
  });
}
