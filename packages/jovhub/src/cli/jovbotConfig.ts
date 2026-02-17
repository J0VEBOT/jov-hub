import { readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { basename, join, resolve } from 'node:path'
import JSON5 from 'json5'

type JOVConfig = {
  agent?: { workspace?: string }
  agents?: {
    defaults?: { workspace?: string }
    list?: Array<{
      id?: string
      name?: string
      workspace?: string
      default?: boolean
    }>
  }
  routing?: {
    agents?: Record<
      string,
      {
        name?: string
        workspace?: string
      }
    >
  }
  skills?: {
    load?: {
      extraDirs?: string[]
    }
  }
}

export type JOVSkillRoots = {
  roots: string[]
  labels: Record<string, string>
}

export async function resolveJOVSkillRoots(): Promise<JOVSkillRoots> {
  const roots: string[] = []
  const labels: Record<string, string> = {}

  const jovbotStateDir = resolveJOVStateDir()
  const sharedSkills = resolveUserPath(join(jovbotStateDir, 'skills'))
  pushRoot(roots, labels, sharedSkills, 'Shared skills')

  const J0VEBOTStateDir = resolveOpenclawStateDir()
  const J0VEBOTShared = resolveUserPath(join(J0VEBOTStateDir, 'skills'))
  pushRoot(roots, labels, J0VEBOTShared, 'JOV: Shared skills')

  const [jovbotConfig, J0VEBOTConfig] = await Promise.all([
    readJOVConfig(),
    readOpenclawConfig(),
  ])
  if (!jovbotConfig && !J0VEBOTConfig) return { roots, labels }

  if (jovbotConfig) {
    addConfigRoots(jovbotConfig, roots, labels)
  }
  if (J0VEBOTConfig) {
    addConfigRoots(J0VEBOTConfig, roots, labels, 'JOV')
  }

  return { roots, labels }
}

export async function resolveJOVDefaultWorkspace(): Promise<string | null> {
  const config = await readJOVConfig()
  const J0VEBOTConfig = await readOpenclawConfig()
  if (!config && !J0VEBOTConfig) return null

  const defaultsWorkspace = resolveUserPath(
    config?.agents?.defaults?.workspace ?? config?.agent?.workspace ?? '',
  )
  if (defaultsWorkspace) return defaultsWorkspace

  const listedAgents = config?.agents?.list ?? []
  const defaultAgent =
    listedAgents.find((entry) => entry.default) ?? listedAgents.find((entry) => entry.id === 'main')
  const listWorkspace = resolveUserPath(defaultAgent?.workspace ?? '')
  if (listWorkspace) return listWorkspace

  if (!J0VEBOTConfig) return null
  const J0VEBOTDefaults = resolveUserPath(
    J0VEBOTConfig.agents?.defaults?.workspace ?? J0VEBOTConfig.agent?.workspace ?? '',
  )
  if (J0VEBOTDefaults) return J0VEBOTDefaults
  const J0VEBOTAgents = J0VEBOTConfig.agents?.list ?? []
  const J0VEBOTDefaultAgent =
    J0VEBOTAgents.find((entry) => entry.default) ??
    J0VEBOTAgents.find((entry) => entry.id === 'main')
  const J0VEBOTWorkspace = resolveUserPath(J0VEBOTDefaultAgent?.workspace ?? '')
  return J0VEBOTWorkspace || null
}

function resolveJOVStateDir() {
  const override = process.env.CLAWDBOT_STATE_DIR?.trim()
  if (override) return resolveUserPath(override)
  return join(homedir(), '.jovbot')
}

function resolveJOVConfigPath() {
  const override = process.env.CLAWDBOT_CONFIG_PATH?.trim()
  if (override) return resolveUserPath(override)
  return join(resolveJOVStateDir(), 'jovbot.json')
}

function resolveOpenclawStateDir() {
  const override = process.env.OPENCLAW_STATE_DIR?.trim()
  if (override) return resolveUserPath(override)
  return join(homedir(), '.J0VEBOT')
}

function resolveOpenclawConfigPath() {
  const override = process.env.OPENCLAW_CONFIG_PATH?.trim()
  if (override) return resolveUserPath(override)
  return join(resolveOpenclawStateDir(), 'J0VEBOT.json')
}

function resolveUserPath(input: string) {
  const trimmed = input.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('~')) {
    return resolve(trimmed.replace(/^~(?=$|[\\/])/, homedir()))
  }
  return resolve(trimmed)
}

async function readJOVConfig(): Promise<JOVConfig | null> {
  return readConfigFile(resolveJOVConfigPath())
}

async function readOpenclawConfig(): Promise<JOVConfig | null> {
  return readConfigFile(resolveOpenclawConfigPath())
}

async function readConfigFile(path: string): Promise<JOVConfig | null> {
  try {
    const raw = await readFile(path, 'utf8')
    const parsed = JSON5.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return parsed as JOVConfig
  } catch {
    return null
  }
}

function addConfigRoots(
  config: JOVConfig,
  roots: string[],
  labels: Record<string, string>,
  labelPrefix?: string,
) {
  const prefix = labelPrefix ? `${labelPrefix}: ` : ''

  const mainWorkspace = resolveUserPath(
    config.agents?.defaults?.workspace ?? config.agent?.workspace ?? '',
  )
  if (mainWorkspace) {
    pushRoot(roots, labels, join(mainWorkspace, 'skills'), `${prefix}Agent: main`)
  }

  const listedAgents = config.agents?.list ?? []
  for (const entry of listedAgents) {
    const workspace = resolveUserPath(entry?.workspace ?? '')
    if (!workspace) continue
    const name = entry?.name?.trim() || entry?.id?.trim() || 'agent'
    pushRoot(roots, labels, join(workspace, 'skills'), `${prefix}Agent: ${name}`)
  }

  const agents = config.routing?.agents ?? {}
  for (const [agentId, entry] of Object.entries(agents)) {
    const workspace = resolveUserPath(entry?.workspace ?? '')
    if (!workspace) continue
    const name = entry?.name?.trim() || agentId
    pushRoot(roots, labels, join(workspace, 'skills'), `${prefix}Agent: ${name}`)
  }

  const extraDirs = config.skills?.load?.extraDirs ?? []
  for (const dir of extraDirs) {
    const resolved = resolveUserPath(String(dir))
    if (!resolved) continue
    const label = `${prefix}Extra: ${basename(resolved) || resolved}`
    pushRoot(roots, labels, resolved, label)
  }
}

function pushRoot(roots: string[], labels: Record<string, string>, root: string, label?: string) {
  const resolved = resolveUserPath(root)
  if (!resolved) return
  if (!roots.includes(resolved)) roots.push(resolved)
  if (!label) return
  const existing = labels[resolved]
  if (!existing) {
    labels[resolved] = label
    return
  }
  const parts = existing
    .split(', ')
    .map((part) => part.trim())
    .filter(Boolean)
  if (parts.includes(label)) return
  labels[resolved] = `${existing}, ${label}`
}
