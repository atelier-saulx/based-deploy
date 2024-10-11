import { findUp } from 'find-up'
import { readJSON } from 'fs-extra'
import { bundle } from '@based/bundle'

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
    } else {
      console.log('NÃO É JSON')
      const bundled = await bundle({
        entryPoints: [basedFile],
      })
      const compiled = bundled.require()

      basedFileContent = compiled.default || compiled
    }

    Object.assign(basedProject, basedFileContent)
    return basedProject
  } else {
    throw new Error()
  }
}
