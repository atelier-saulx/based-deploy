import { findUp } from 'find-up'
import { readJSON, readFileSync } from 'fs-extra'
import ts from 'typescript'

export type Project = {
  cluster?: string
  project?: string
  org?: string
  env?: string
  apiKey?: string
}

export type Infra = {
  [key: string]: {
    description: string
    machine: string
    max: number
    min: number
    services: {
      [key: string]: {
        distChecksum: string
        instances: {
          [key: string]: {
            port: number
            name: string
            disableRest: boolean
            disableAllSecurity: boolean
            disableWs: boolean
          }
        }
      }
    }
  }
}

export type BasedFile = {
  content: Project | Infra | undefined
  exports: string
}

export const getBasedFile = async (
  files: string[],
  exports: string = 'default',
): Promise<BasedFile | undefined> => {
  if (!files || !files.length) {
    throw new Error('No files specified.')
  }

  const basedFile = await findUp(files)

  if (basedFile) {
    if (basedFile.endsWith('.json')) {
      return {
        content: await readJSON(basedFile),
        exports: 'default',
      }
    } else if (basedFile.endsWith('.ts')) {
      try {
        let content = readFileSync(basedFile, 'utf-8')

        const result = ts.transpileModule(content, {
          compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2016,
          },
        })

        const jsCode = result.outputText
        const modifiedCode = `
          const exports = {};
          ${jsCode}
          module.used = '${exports}' in exports ? '${exports}' : 'default';
          module.exports = '${exports}' in exports ? exports['${exports}'] : exports.default;
        `

        console.log('modifiedCode', modifiedCode)

        const script = new Function('module', modifiedCode)
        const module = { exports: {}, used: '' }

        script(module)

        console.log('module', module)

        return {
          content: module.exports,
          exports: module.used,
        }
      } catch (error: any) {
        throw new Error(error)
      }
    } else {
      throw new Error('Unsupported file type.')
    }
  }

  return undefined
}
