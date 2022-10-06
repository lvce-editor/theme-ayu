import { copyFiles, packageExtension } from '@lvce-editor/package-extension'
import path, { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

await copyFiles({
  root,
  files: ['README.md', 'extension.json', 'color-theme.json'],
  outDir: join(root, 'dist'),
})

await packageExtension({
  highestCompression: true,
  inDir: join(root, 'dist'),
  outFile: join(root, 'extension.tar.br'),
})
