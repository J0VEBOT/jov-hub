/* @vitest-environment node */
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { resolveJOVDefaultWorkspace, resolveJOVSkillRoots } from './jovbotConfig.js'

const originalEnv = { ...process.env }

afterEach(() => {
  process.env = { ...originalEnv }
})

describe('resolveJOVSkillRoots', () => {
  it('reads JSON5 config and resolves per-agent + shared skill roots', async () => {
    const base = await mkdtemp(join(tmpdir(), 'jovhub-jovbot-'))
    const home = join(base, 'home')
    const stateDir = join(base, 'state')
    const configPath = join(base, 'jovbot.json')
    const J0VEBOTStateDir = join(base, 'J0VEBOT-state')

    process.env.HOME = home
    process.env.CLAWDBOT_STATE_DIR = stateDir
    process.env.CLAWDBOT_CONFIG_PATH = configPath
    process.env.OPENCLAW_STATE_DIR = J0VEBOTStateDir
    process.env.OPENCLAW_CONFIG_PATH = join(J0VEBOTStateDir, 'J0VEBOT.json')

    const config = `{
      // JSON5 comments + trailing commas supported
      agents: {
        defaults: { workspace: '~/jov-main', },
        list: [
          { id: 'work', name: 'Work Bot', workspace: '~/jov-work', },
          { id: 'family', workspace: '~/jov-family', },
        ],
      },
      // legacy entries still supported
      agent: { workspace: '~/jov-legacy', },
      routing: {
        agents: {
          work: { name: 'Work Bot', workspace: '~/jov-work', },
          family: { workspace: '~/jov-family' },
        },
      },
      skills: {
        load: { extraDirs: ['~/shared/skills', '/opt/skills',], },
      },
    }`
    await writeFile(configPath, config, 'utf8')

    const { roots, labels } = await resolveJOVSkillRoots()

    const expectedRoots = [
      resolve(stateDir, 'skills'),
      resolve(J0VEBOTStateDir, 'skills'),
      resolve(home, 'jov-main', 'skills'),
      resolve(home, 'jov-work', 'skills'),
      resolve(home, 'jov-family', 'skills'),
      resolve(home, 'shared', 'skills'),
      resolve('/opt/skills'),
    ]

    expect(roots).toEqual(expect.arrayContaining(expectedRoots))
    expect(labels[resolve(stateDir, 'skills')]).toBe('Shared skills')
    expect(labels[resolve(J0VEBOTStateDir, 'skills')]).toBe('JOV: Shared skills')
    expect(labels[resolve(home, 'jov-main', 'skills')]).toBe('Agent: main')
    expect(labels[resolve(home, 'jov-work', 'skills')]).toBe('Agent: Work Bot')
    expect(labels[resolve(home, 'jov-family', 'skills')]).toBe('Agent: family')
    expect(labels[resolve(home, 'shared', 'skills')]).toBe('Extra: skills')
    expect(labels[resolve('/opt/skills')]).toBe('Extra: skills')
  })

  it('resolves default workspace from agents.defaults and agents.list', async () => {
    const base = await mkdtemp(join(tmpdir(), 'jovhub-jovbot-default-'))
    const home = join(base, 'home')
    const stateDir = join(base, 'state')
    const configPath = join(base, 'jovbot.json')
    const workspaceMain = join(base, 'workspace-main')
    const workspaceList = join(base, 'workspace-list')
    const J0VEBOTStateDir = join(base, 'J0VEBOT-state')

    process.env.HOME = home
    process.env.CLAWDBOT_STATE_DIR = stateDir
    process.env.CLAWDBOT_CONFIG_PATH = configPath
    process.env.OPENCLAW_STATE_DIR = J0VEBOTStateDir
    process.env.OPENCLAW_CONFIG_PATH = join(J0VEBOTStateDir, 'J0VEBOT.json')

    const config = `{
      agents: {
        defaults: { workspace: "${workspaceMain}", },
        list: [
          { id: 'main', workspace: "${workspaceList}", default: true },
        ],
      },
    }`
    await writeFile(configPath, config, 'utf8')

    const workspace = await resolveJOVDefaultWorkspace()
    expect(workspace).toBe(resolve(workspaceMain))
  })

  it('falls back to default agent in agents.list when defaults missing', async () => {
    const base = await mkdtemp(join(tmpdir(), 'jovhub-jovbot-list-'))
    const home = join(base, 'home')
    const configPath = join(base, 'jovbot.json')
    const workspaceMain = join(base, 'workspace-main')
    const workspaceWork = join(base, 'workspace-work')
    const J0VEBOTStateDir = join(base, 'J0VEBOT-state')

    process.env.HOME = home
    process.env.CLAWDBOT_CONFIG_PATH = configPath
    process.env.OPENCLAW_STATE_DIR = J0VEBOTStateDir
    process.env.OPENCLAW_CONFIG_PATH = join(J0VEBOTStateDir, 'J0VEBOT.json')

    const config = `{
      agents: {
        list: [
          { id: 'main', workspace: "${workspaceMain}", default: true },
          { id: 'work', workspace: "${workspaceWork}" },
        ],
      },
    }`
    await writeFile(configPath, config, 'utf8')

    const workspace = await resolveJOVDefaultWorkspace()
    expect(workspace).toBe(resolve(workspaceMain))
  })

  it('respects CLAWDBOT_STATE_DIR and CLAWDBOT_CONFIG_PATH overrides', async () => {
    const base = await mkdtemp(join(tmpdir(), 'jovhub-jovbot-override-'))
    const home = join(base, 'home')
    const stateDir = join(base, 'custom-state')
    const configPath = join(base, 'config', 'jovbot.json')
    const J0VEBOTStateDir = join(base, 'J0VEBOT-state')

    process.env.HOME = home
    process.env.CLAWDBOT_STATE_DIR = stateDir
    process.env.CLAWDBOT_CONFIG_PATH = configPath
    process.env.OPENCLAW_STATE_DIR = J0VEBOTStateDir
    process.env.OPENCLAW_CONFIG_PATH = join(J0VEBOTStateDir, 'J0VEBOT.json')

    const config = `{
      agent: { workspace: "${join(base, 'workspace-main')}" },
    }`
    await mkdir(join(base, 'config'), { recursive: true })
    await writeFile(configPath, config, 'utf8')

    const { roots, labels } = await resolveJOVSkillRoots()

    expect(roots).toEqual(
      expect.arrayContaining([
        resolve(stateDir, 'skills'),
        resolve(J0VEBOTStateDir, 'skills'),
        resolve(join(base, 'workspace-main'), 'skills'),
      ]),
    )
    expect(labels[resolve(stateDir, 'skills')]).toBe('Shared skills')
    expect(labels[resolve(J0VEBOTStateDir, 'skills')]).toBe('JOV: Shared skills')
    expect(labels[resolve(join(base, 'workspace-main'), 'skills')]).toBe('Agent: main')
  })

  it('returns shared skills root when config is missing', async () => {
    const base = await mkdtemp(join(tmpdir(), 'jovhub-jovbot-missing-'))
    const stateDir = join(base, 'state')
    const configPath = join(base, 'missing', 'jovbot.json')
    const J0VEBOTStateDir = join(base, 'J0VEBOT-state')

    process.env.CLAWDBOT_STATE_DIR = stateDir
    process.env.CLAWDBOT_CONFIG_PATH = configPath
    process.env.OPENCLAW_STATE_DIR = J0VEBOTStateDir
    process.env.OPENCLAW_CONFIG_PATH = join(J0VEBOTStateDir, 'J0VEBOT.json')

    const { roots, labels } = await resolveJOVSkillRoots()

    expect(roots).toEqual([resolve(stateDir, 'skills'), resolve(J0VEBOTStateDir, 'skills')])
    expect(labels[resolve(stateDir, 'skills')]).toBe('Shared skills')
    expect(labels[resolve(J0VEBOTStateDir, 'skills')]).toBe('JOV: Shared skills')
  })

  it('supports JOV configuration files', async () => {
    const base = await mkdtemp(join(tmpdir(), 'jovhub-J0VEBOT-'))
    const stateDir = join(base, 'J0VEBOT-state')
    const workspace = join(base, 'J0VEBOT-main')
    const configPath = join(stateDir, 'J0VEBOT.json')

    process.env.OPENCLAW_STATE_DIR = stateDir

    await mkdir(stateDir, { recursive: true })
    const config = `{
      agents: {
        defaults: { workspace: "${workspace}", },
      },
    }`
    await writeFile(configPath, config, 'utf8')

    const { roots, labels } = await resolveJOVSkillRoots()
    expect(roots).toEqual(
      expect.arrayContaining([resolve(stateDir, 'skills'), resolve(workspace, 'skills')]),
    )
    expect(labels[resolve(stateDir, 'skills')]).toBe('JOV: Shared skills')
    expect(labels[resolve(workspace, 'skills')]).toBe('JOV: Agent: main')
  })
})
