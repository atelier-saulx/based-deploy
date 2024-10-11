import { findUp } from 'find-up'
import { readJSON, readFileSync, writeFileSync, unlinkSync } from 'fs-extra'
import { join } from 'path'
import { execSync } from 'child_process'
import ts from 'typescript'

export type Project = {
  cluster?: string
  project?: string
  org?: string
  env?: string
  apiKey?: string
}

export const getBasedFile = async (
  file: string[],
): Promise<Project | undefined> => {
  if (!file || !file.length) {
    throw new Error()
  }

  const basedFile = await findUp(file)
  let basedFileContent: Project = {}
  const basedProject: Project = {}

  if (basedFile) {
    if (basedFile.endsWith('.json')) {
      basedFileContent = await readJSON(basedFile)
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
          module.exports = exports.default;
        `

        const script = new Function('module', modifiedCode)
        const module = { exports: {} }
        script(module)
        basedFileContent = module.exports
      } catch (error: any) {
        throw new Error(error)
      }

      Object.assign(basedProject, basedFileContent)

      return basedProject
    } else {
      throw new Error()
    }
  }
}
