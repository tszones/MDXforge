import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

type BumpKind = "patch" | "minor" | "major";

const PACKAGE_JSON_PATHS = [
  "package.json",
  "apps/desktop/package.json",
  "apps/web/package.json",
  "packages/mdx/package.json",
  "packages/mdx-components/package.json",
  "packages/ui/package.json",
];

function normalizeTag(version: string): string {
  const trimmed = version.trim();
  return trimmed.startsWith("v") ? trimmed : `v${trimmed}`;
}

function bumpVersion(version: string, kind: BumpKind): string {
  const match = /^(\d+)\.(\d+)\.(\d+)(.*)$/.exec(version.trim());
  if (!match) throw new Error(`Unsupported semver: ${version}`);

  let major = Number(match[1]);
  let minor = Number(match[2]);
  let patch = Number(match[3]);

  if (kind === "major") {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (kind === "minor") {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }

  return `${major}.${minor}.${patch}`;
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

async function bumpAllPackageVersions(cwd: string, kind: BumpKind) {
  const changed: Array<{ file: string; from: string; to: string }> = [];

  for (const relativePath of PACKAGE_JSON_PATHS) {
    const file = path.join(cwd, relativePath);
    const raw = await readFile(file, "utf8");
    const parsed = JSON.parse(raw) as { version?: unknown };
    if (typeof parsed.version !== "string") continue;

    const next = bumpVersion(parsed.version, kind);
    const updated = raw.replace(
      /("version"\s*:\s*")([^"\r\n]+)(")/,
      `$1${next}$3`,
    );

    if (updated === raw) continue;
    await writeFile(file, updated, "utf8");
    changed.push({ file: relativePath, from: parsed.version, to: next });
  }

  return changed;
}

export default function autoReleaseTagExtension(pi: ExtensionAPI) {
  pi.registerCommand("release-bump", {
    description:
      "Bump all package.json versions, commit, tag, push. Usage: /release-bump patch|minor|major",
    handler: async (args, ctx) => {
      const kind = args.trim() || "patch";
      if (!["patch", "minor", "major"].includes(kind)) {
        ctx.ui.notify("Usage: /release-bump patch|minor|major", "warn");
        return;
      }

      const status = await pi.exec("git", ["status", "--porcelain"]);
      if (status.code !== 0) {
        ctx.ui.notify(`Not a git repo.\n${status.stderr || status.stdout}`, "error");
        return;
      }

      if (status.stdout.trim().length > 0) {
        ctx.ui.notify("Working tree dirty. Commit/stash before release-bump.", "warn");
        return;
      }

      let changed: Array<{ file: string; from: string; to: string }>;
      try {
        changed = await bumpAllPackageVersions(process.cwd(), kind as BumpKind);
      } catch (error) {
        ctx.ui.notify(`Version bump failed: ${(error as Error).message}`, "error");
        return;
      }

      if (changed.length === 0) {
        ctx.ui.notify("No package.json versions found.", "warn");
        return;
      }

      const nextVersion = changed[0]?.to;
      const tag = normalizeTag(nextVersion);
      const message = `chore: release ${tag}`;

      await pi.exec("git", ["add", ...changed.map((item) => item.file)]);
      const commit = await pi.exec("git", ["commit", "-m", message]);
      if (commit.code !== 0) {
        ctx.ui.notify(`Commit failed.\n${commit.stderr || commit.stdout}`, "error");
        return;
      }

      const created = await pi.exec("git", ["tag", tag]);
      if (created.code !== 0) {
        ctx.ui.notify(`git tag ${tag} failed.\n${created.stderr || created.stdout}`, "error");
        return;
      }

      const pushedBranch = await pi.exec("git", ["push", "origin", "HEAD"]);
      if (pushedBranch.code !== 0) {
        ctx.ui.notify(
          `git push origin HEAD failed.\n${pushedBranch.stderr || pushedBranch.stdout}`,
          "error",
        );
        return;
      }

      const pushedTag = await pi.exec("git", ["push", "origin", tag]);
      if (pushedTag.code !== 0) {
        ctx.ui.notify(`git push origin ${tag} failed.\n${pushedTag.stderr || pushedTag.stdout}`, "error");
        return;
      }

      ctx.ui.notify(
        `Released ${tag}. Updated ${changed.length} package.json files.`,
        "info",
      );
    },
  });

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
