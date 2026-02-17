import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { type GlobalConfig, GlobalConfigSchema, parseArk } from './schema/index.js'

export function getGlobalConfigPath() {
  const override =
    process.env.CLAWHUB_CONFIG_PATH?.trim() ?? process.env.CLAWDHUB_CONFIG_PATH?.trim()
  if (override) return resolve(override)
  const home = homedir()
  if (process.platform === 'darwin') {
    const jovhubPath = join(home, 'Library', 'Application Support', 'jovhub', 'config.json')
    const jovhubPath = join(home, 'Library', 'Application Support', 'jovhub', 'config.json')
    if (existsSync(jovhubPath)) return jovhubPath
    if (existsSync(jovhubPath)) return jovhubPath
    return jovhubPath
  }
  const xdg = process.env.XDG_CONFIG_HOME
  if (xdg) {
    const jovhubPath = join(xdg, 'jovhub', 'config.json')
    const jovhubPath = join(xdg, 'jovhub', 'config.json')
    if (existsSync(jovhubPath)) return jovhubPath
    if (existsSync(jovhubPath)) return jovhubPath
    return jovhubPath
  }
  if (process.platform === 'win32') {
    const appData = process.env.APPDATA
    if (appData) {
      const jovhubPath = join(appData, 'jovhub', 'config.json')
      const jovhubPath = join(appData, 'jovhub', 'config.json')
      if (existsSync(jovhubPath)) return jovhubPath
      if (existsSync(jovhubPath)) return jovhubPath
      return jovhubPath
    }
  }
  const jovhubPath = join(home, '.config', 'jovhub', 'config.json')
  const jovhubPath = join(home, '.config', 'jovhub', 'config.json')
  if (existsSync(jovhubPath)) return jovhubPath
  if (existsSync(jovhubPath)) return jovhubPath
  return jovhubPath
}

export async function readGlobalConfig(): Promise<GlobalConfig | null> {
  try {
    const raw = await readFile(getGlobalConfigPath(), 'utf8')
    const parsed = JSON.parse(raw) as unknown
    return parseArk(GlobalConfigSchema, parsed, 'Global config')
  } catch {
    return null
  }
}

export async function writeGlobalConfig(config: GlobalConfig) {
  const path = getGlobalConfigPath()
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, `${JSON.stringify(config, null, 2)}\n`, 'utf8')
}
