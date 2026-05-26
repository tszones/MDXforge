import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

function normalizeTag(version: string): string {
  const trimmed = version.trim();
  return trimmed.startsWith("v") ? trimmed : `v${trimmed}`;
}

async function readPackageVersion(cwd: string): Promise<string> {
  const packageJsonPath = path.join(cwd, "package.json");
  const raw = await readFile(packageJsonPath, "utf8");
  const parsed = JSON.parse(raw) as { version?: unknown };

  if (typeof parsed.version !== "string" || parsed.version.trim().length === 0) {
    throw new Error("package.json missing string version");
  }

  return parsed.version;
}

export default function autoReleaseTagExtension(pi: ExtensionAPI) {
  pi.registerCommand("release-tag", {
    description:
      "Create and push git tag from package.json version. Usage: /release-tag [version|vX.Y.Z]",
    handler: async (args, ctx) => {
      const cwd = process.cwd();
      const requested = args.trim();

      let tag: string;
      try {
        tag = normalizeTag(requested || (await readPackageVersion(cwd)));
      } catch (error) {
        ctx.ui.notify(`Release tag failed: ${(error as Error).message}`, "error");
        return;
      }

      const status = await pi.exec("git", ["status", "--porcelain"]);
      if (status.code !== 0) {
        ctx.ui.notify(`Not a git repo.\n${status.stderr || status.stdout}`, "error");
        return;
      }

      if (status.stdout.trim().length > 0) {
        ctx.ui.notify("Working tree dirty. Commit/stash before release-tag.", "warn");
        return;
      }

      const existing = await pi.exec("git", ["tag", "--list", tag]);
      if (existing.code !== 0) {
        ctx.ui.notify(`Could not list tags.\n${existing.stderr || existing.stdout}`, "error");
        return;
      }

      if (!existing.stdout.trim()) {
        const created = await pi.exec("git", ["tag", tag]);
        if (created.code !== 0) {
          ctx.ui.notify(`git tag ${tag} failed.\n${created.stderr || created.stdout}`, "error");
          return;
        }
      }

      const pushed = await pi.exec("git", ["push", "origin", tag]);
      if (pushed.code !== 0) {
        ctx.ui.notify(`git push origin ${tag} failed.\n${pushed.stderr || pushed.stdout}`, "error");
        return;
      }

      ctx.ui.notify(`Released ${tag}: git tag ${tag}; git push origin ${tag}`, "info");
    },
  });
}
