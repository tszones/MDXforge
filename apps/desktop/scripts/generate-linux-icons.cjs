#!/usr/bin/env node
const { mkdirSync } = require('node:fs')
const { join } = require('node:path')
const { spawnSync } = require('node:child_process')

const sizes = [16, 24, 32, 48, 64, 128, 256, 512, 1024]
const input = join(__dirname, '..', 'build', 'icon.png')
const outRoot = join(__dirname, '..', 'build', 'icons')

const python = spawnSync(
  'python3',
  [
    '-c',
    String.raw`
import sys
from pathlib import Path
from PIL import Image

input_path = Path(sys.argv[1])
out_root = Path(sys.argv[2])
sizes = [int(size) for size in sys.argv[3:]]

img = Image.open(input_path).convert('RGBA')
for size in sizes:
    out_dir = out_root / f'{size}x{size}' / 'apps'
    out_dir.mkdir(parents=True, exist_ok=True)
    resized = img.resize((size, size), Image.Resampling.LANCZOS)
    resized.save(out_dir / 'mdxforge.png')
    resized.save(out_root / f'{size}x{size}.png')
`,
    input,
    outRoot,
    ...sizes.map(String)
  ],
  { stdio: 'inherit' }
)

if (python.status !== 0) {
  process.exit(python.status ?? 1)
}
