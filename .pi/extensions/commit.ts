import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

function quoteArg(arg: string): string {
  return arg.includes(" ") ? JSON.stringify(arg) : arg;
}

function normalizeMessage(args: string): string {
  const message = args.trim();
  return message.length > 0 ? message : "";
}

export default function commitExtension(pi: ExtensionAPI) {
  pi.registerCommand("commit", {
    description:
      "Stage all changes and create an English git commit. Usage: /commit <English message> (auto-generates via AI if no message provided)",
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

      if (message) {
        // User provided a message — commit directly
        await pi.exec("git", ["add", "-A"]);
        const { stdout, stderr, code } = await pi.exec("git", ["commit", "-m", message]);

        if (code !== 0) {
          ctx.ui.notify(`Commit failed.\n${stderr || stdout}`, "error");
          return;
        }

        const { stdout: head } = await pi.exec("git", ["rev-parse", "--short", "HEAD"]);
        ctx.ui.notify(`Committed ${head.trim()}: ${quoteArg(message)}`, "info");
      } else {
        // No message provided — stage and let AI amend
        await pi.exec("git", ["add", "-A"]);

        // Get diff for AI context
        const { stdout: diff } = await pi.exec("git", ["diff", "--cached", "--stat"]);

        // Commit with placeholder
        const { stdout: stubStderr, code: stubCode } = await pi.exec("git", ["commit", "-m", "WIP"]);

        if (stubCode !== 0) {
          ctx.ui.notify(`Commit failed.\n${stubStderr}`, "error");
          return;
        }

        const { stdout: head } = await pi.exec("git", ["rev-parse", "--short", "HEAD"]);
        ctx.ui.notify(`Committed ${head.trim()} as WIP — requesting AI to amend...`, "info");

        // Ask the agent to generate a proper commit message and amend
        pi.sendUserMessage(
          `I just staged all changes and committed them with message "WIP". \n` +
            `Here's the diff stat:\n${diff}\n\n` +
            `Please generate a concise, descriptive English commit message (max 72 chars) ` +
            `based on the changes, then run:\n` +
            `git commit --amend -m "your-generated-message"`,
          { deliverAs: "followUp" },
        );
      }
    },
  });
}
