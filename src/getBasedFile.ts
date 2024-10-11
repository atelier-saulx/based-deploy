import { findUp } from 'find-up'
import { readJSON, readFileSync, writeFileSync } from 'fs-extra'
import { join } from 'path'
import { execSync } from 'child_process'

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
      const dir = process.cwd()
      const content = readFileSync(basedFile, 'utf-8')
      const tempFilePath = join(dir, 'temp.mts')
      writeFileSync(tempFilePath, content)

      // Execute o arquivo TypeScript usando ts-node
      const result = execSync(`npx --yes ts-node ${tempFilePath}`)
      console.log('Resultado da execução:', result.toString())

      basedFileContent = JSON.parse(result.toString())
    }

    Object.assign(basedProject, basedFileContent)
    return basedProject
  } else {
    throw new Error()
  }
}
