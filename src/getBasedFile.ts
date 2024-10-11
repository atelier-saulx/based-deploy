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

export const getBasedFile = async (file: string[]): Promise<Project> => {
  if (!file || !file.length) {
    throw new Error()
  }

  const basedFile = await findUp(file)
  let basedFileContent: Project = {}
  const basedProject: Project = {}

  if (basedFile) {
    if (basedFile.endsWith('.json')) {
      console.log('É JSON')
      basedFileContent = await readJSON(basedFile)
    } else if (basedFile.endsWith('.ts')) {
      console.log('NÃO É JSON')
      // const dir = process.cwd()
      let content = readFileSync(basedFile, 'utf-8')
      // content = content.replace(/export default/, 'module.exports =')
      // const tempFilePath = join(dir, 'temp.ts')
      // writeFileSync(tempFilePath, content)

      // const result = execSync(`npx --yes ts-node ${tempFilePath}`)

      const result = ts.transpileModule(content, {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          target: ts.ScriptTarget.ES2016,
        },
      })

      const jsCode = result.outputText
      const getExportedDefault = new Function('return (' + jsCode + ')')()

      console.log('org', getExportedDefault.org)
      console.log('project', getExportedDefault.project)
      console.log('env', getExportedDefault.env)

      // execSync(`npx typescript --yes ${basedFile}`)
      // const jsFilePath = basedFile.replace(/\.ts$/, '.js')
      // console.log('jsFilePath', jsFilePath)
      // const result = execSync(`node ${jsFilePath}`)

      console.log('jsCode', jsCode)
      console.log('result', result)

      basedFileContent = JSON.parse(result.toString())
    }

    Object.assign(basedProject, basedFileContent)
    return basedProject
  } else {
    throw new Error()
  }
}
