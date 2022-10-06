import fs, { cpSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import path, { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const root = path.join(__dirname, '..')
const pathPrefix = process.env.PATH_PREFIX || ''
const name = 'ayu'

const dirents = readdirSync(
  join(root, 'node_modules', '@lvce-editor', 'server', 'static')
)
const RE_COMMIT_HASH = /^[a-z\d]+$/
const isCommitHash = (dirent) => {
  return dirent.length === 7 && dirent.match(RE_COMMIT_HASH)
}
const commitHash = dirents.find(isCommitHash) || ''

fs.rmSync(join(root, 'dist'), { recursive: true, force: true })

fs.mkdirSync(path.join(root, 'dist'))

fs.mkdirSync(
  join(root, 'dist', commitHash, 'extensions', `builtin.theme-${name}`),
  {
    recursive: true,
  }
)
fs.cpSync(
  join(root, 'node_modules', '@lvce-editor', 'server', 'static'),
  join(root, 'dist'),
  {
    recursive: true,
  }
)

const replaceSync = (path, occurrence, replacement) => {
  const oldContent = readFileSync(path, 'utf8')
  // @ts-ignore
  const newContent = oldContent.replaceAll(occurrence, replacement)
  writeFileSync(path, newContent)
}

replaceSync(
  join(
    root,
    'dist',
    commitHash,
    'packages',
    'renderer-process',
    'dist',
    'rendererProcessMain.js'
  ),
  'platform = getPlatform();',
  'platform = "web"'
)
replaceSync(
  join(
    root,
    'dist',
    commitHash,
    'packages',
    'renderer-process',
    'dist',
    'rendererProcessMain.js'
  ),
  `return "/${commitHash}";`,
  `return "${pathPrefix}/${commitHash}";`
)
replaceSync(
  join(
    root,
    'dist',
    commitHash,
    'packages',
    'renderer-worker',
    'dist',
    'rendererWorkerMain.js'
  ),
  'platform = getPlatform();',
  'platform = "web"'
)
replaceSync(
  join(
    root,
    'dist',
    commitHash,
    'packages',
    'renderer-worker',
    'dist',
    'rendererWorkerMain.js'
  ),
  `platform2 = "remote";`,
  'platform2 = "web";'
)
replaceSync(
  join(
    root,
    'dist',
    commitHash,
    'packages',
    'renderer-worker',
    'dist',
    'rendererWorkerMain.js'
  ),
  `return "/${commitHash}";`,
  `return "${pathPrefix}/${commitHash}";`
)
replaceSync(
  join(root, 'dist', commitHash, 'config', 'defaultSettings.json'),
  `"workbench.colorTheme": "slime"`,
  `"workbench.colorTheme": "${name}"`
)
replaceSync(
  join(root, 'dist', commitHash, 'config', 'defaultSettings.json'),
  `"workbench.saveStateOnVisibilityChange": false`,
  `"workbench.saveStateOnVisibilityChange": true`
)

const extensionDirents = readdirSync(
  join(root, 'node_modules', '@lvce-editor', 'shared-process', 'extensions')
)

const isLanguageBasics = (dirent) => {
  return dirent.startsWith('builtin.language-basics')
}

const languageBasicsDirents = extensionDirents.filter(isLanguageBasics)

const readJson = (path) => {
  const content = readFileSync(path, 'utf8')
  return { ...JSON.parse(content), path }
}

const writeJson = (path, json) => {
  const content = JSON.stringify(json, null, 2) + '\n'
  writeFileSync(path, content)
}

const getManifestPath = (dirent) => {
  return join(
    root,
    'node_modules',
    '@lvce-editor',
    'shared-process',
    'extensions',
    dirent,
    'extension.json'
  )
}
const getLanguages = (extension) => {
  const languages = []
  for (const language of extension.languages || []) {
    languages.push({
      ...language,
      tokenize: `${pathPrefix}/${commitHash}/extensions/${extension.id}/${language.tokenize}`,
    })
  }
  return languages
}
const languages = languageBasicsDirents
  .map(getManifestPath)
  .map(readJson)
  .flatMap(getLanguages)
writeJson(join(root, 'dist', commitHash, 'config', 'languages.json'), languages)
cpSync(
  join(root, 'node_modules', '@lvce-editor', 'shared-process', 'extensions'),
  join(root, 'dist', commitHash, 'extensions'),
  {
    recursive: true,
  }
)

replaceSync(
  join(root, 'dist', 'index.html'),
  `/${commitHash}`,
  `${pathPrefix}/${commitHash}`
)
replaceSync(
  join(root, 'dist', 'index.html'),
  `/manifest.json`,
  `${pathPrefix}/manifest.json`
)
replaceSync(
  join(root, 'dist', 'index.html'),
  '</title>',
  `</title>
<link rel="shortcut icon" type="image/x-icon" href="favicon.ico">`
)
replaceSync(
  join(root, 'dist', 'manifest.json'),
  `/${commitHash}`,
  `${pathPrefix}/${commitHash}`
)

fs.copyFileSync(
  join(root, 'README.md'),
  join(
    root,
    'dist',
    commitHash,
    'extensions',
    `builtin.theme-${name}`,
    'README.md'
  )
)
fs.copyFileSync(
  join(root, 'extension.json'),
  join(
    root,
    'dist',
    commitHash,
    'extensions',
    `builtin.theme-${name}`,
    'extension.json'
  )
)
fs.copyFileSync(
  join(root, 'color-theme.json'),
  join(
    root,
    'dist',
    commitHash,
    'extensions',
    `builtin.theme-${name}`,
    'color-theme.json'
  )
)

replaceSync(
  join(root, 'dist', commitHash, 'css', 'App.css'),
  `/${commitHash}`,
  `${pathPrefix}/${commitHash}`
)
