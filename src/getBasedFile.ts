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
      try {
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
        console.log('jsCode', jsCode)

        const modifiedCode = `
                const exports = {};
                ${jsCode}
                module.exports = exports.default; // Adiciona o export default ao module.exports
            `

        // Execute o código modificado
        const script = new Function('module', modifiedCode)
        const module = { exports: {} } // Cria um objeto module
        script(module) // Passa o objeto module para o script

        // Agora você pode acessar as propriedades do objeto
        const exportedValue = module.exports

        console.log('exportedValue', exportedValue)
        console.log('org', exportedValue.org)
        console.log('project', exportedValue.project)
        console.log('env', exportedValue.env)

        // execSync(`npx typescript --yes ${basedFile}`)
        // const jsFilePath = basedFile.replace(/\.ts$/, '.js')
        // console.log('jsFilePath', jsFilePath)
        // const result = execSync(`node ${jsFilePath}`)

        console.log('result', result)

        basedFileContent = JSON.parse(result.toString())
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
