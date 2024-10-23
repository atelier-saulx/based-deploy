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
  let basedFileContent: Project | Infra = {}
  const basedInfo: Project | Infra = {}

  if (basedFile) {
    if (basedFile.endsWith('.json')) {
      basedFileContent = await readJSON(basedFile)

      return {
        content: basedFileContent,
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
          let usedExport;
          ${jsCode}
          usedExport = exports.${exports} ? exports.${exports} : exports.default;
          module.exports = usedExport;
        `

        const script = new Function('module', modifiedCode)
        const module = { exports: {} }

        script(module)

        basedFileContent = module.exports

        const finalExport =
          module.exports && 'default' in module.exports ? 'default' : exports

        Object.assign(basedInfo, basedFileContent)

        return {
          content: basedInfo,
          exports: finalExport,
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
