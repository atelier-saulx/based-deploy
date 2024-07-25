import * as core from '@actions/core'
import * as github from '@actions/github'
import { BasedClient } from '@based/client'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

async function run() {
  try {
    const userID = core.getInput('userID')
    const apiKey = core.getInput('apiKey')
    const size = core.getInput('size') ?? 'small'
    const region = core.getInput('region') ?? 'eu-central-1'
    // const repository = github.context.repo.repo
    const branchName = github.context.ref.replace('refs/heads/', '')
    // const branchUrl = `https://github.com/${github.context.repo.owner}/${repository}/tree/${branchName}`

    if (!userID || !apiKey) {
      throw new Error(
        'You need to pass the userID and the apiKey as input to the function to deploy your files.',
      )
    }

    const basedJsonPath = join(process.cwd(), 'based.json')
    if (!existsSync(basedJsonPath)) {
      throw new Error(
        'Was not possible to find the "based.json" file in the branch. Add the file and try again.',
      )
    }

    const basedJson = JSON.parse(readFileSync(basedJsonPath, 'utf-8'))
    const { org, project, env } = basedJson

    // #branch check for env

    if (!org || !project || !env) {
      throw new Error(
        'Was not possible to read the "based.json" file in the branch.',
      )
    }

    const client = new BasedClient({
      org: 'saulx',
      project: 'based-cloud',
      env: 'platform',
      name: '@based/admin-hub',
    })

    await client.setAuthState({
      token: apiKey,
      type: 'serviceAccount',
      userId: userID,
    })

    // does it exist?
    await client.call('create-env', {
      org,
      project,
      env: branchName,
      config: size,
      region,
    })

    core.info('Waiting for the creation of the environment...')
    await new Promise((resolve) => setTimeout(resolve, 30000))

    core.info('Running npx @based/cli deploy')
    const { stdout, stderr } = await execPromise('npx @based/cli deploy')
    core.info(`stdout: ${stdout}`)
    core.error(`stderr: ${stderr}`)

    core.setOutput('response', 'Success!')
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
