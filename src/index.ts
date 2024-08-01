import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as github from '@actions/github'
import { BasedClient } from '@based/client'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
// import { exec } from 'child_process'
// import { promisify } from 'util'
import { wait } from '@saulx/utils'

// const execPromise = promisify(exec)

async function run() {
  try {
    const userId = core.getInput('userID')
    const token = core.getInput('apiKey')
    const size = core.getInput('size') ?? 'small'
    const region = core.getInput('region') ?? 'eu-central-1'
    // const repository = github.context.repo.repo
    const branchName = github.context?.ref?.replace('refs/heads/', '')
    // const branchUrl = `https://github.com/${github.context.repo.owner}/${repository}/tree/${branchName}`

    if (!userId || !token) {
      throw new Error(
        'You need to set the userID and the apiKey as input to the function to deploy your files.',
      )
    }

    core.info('✅ UserID and APIKey')

    const basedJsonPath = join(process.cwd(), 'based.json')
    if (!existsSync(basedJsonPath)) {
      throw new Error(
        'Was not possible to find the "based.json" file in the branch. Add the file and try again.',
      )
    }

    core.info('✅ Loaded "based.json"')

    const basedJson = JSON.parse(readFileSync(basedJsonPath, 'utf-8'))
    const { org, project, env } = basedJson

    if (!org || !project || !env) {
      throw new Error(
        'Was not possible to read the "based.json" file in the branch.',
      )
    }

    core.info('✅ Parsed "based.json"')

    const client = new BasedClient({
      org: 'saulx',
      project: 'based-cloud',
      env: 'platform',
      name: '@based/admin-hub',
    })

    core.info('✅ Based Client created')

    try {
      await client.setAuthState({
        token,
        type: 'serviceAccount',
        userId,
      })

      core.info('✅ Based AuthState set')
    } catch (error) {
      throw new Error(
        `Was not possible to log in using your credentials. Error: ${error.message}`,
      )
    }

    if (env === '#branch') {
      core.info(`🕘 Checking if the environment '${branchName}' already exists. If doesn't, it'll be created.`)

      const data = client.query('env', { org, project, env: branchName }).get()

      core.info(`env info ${JSON.stringify(data)}`)

      try {
        await client.call('create-env', {
          org,
          project,
          env: branchName,
          config: size,
          region,
        })

        core.info('🕘 Trying to create a new environment')
        core.info('✅ Waiting for the creation of the environment...')
        await wait(30000)
        core.info('✅ Environment created successfully.')
      } catch (error) {
        core.warning(error.message)
      }
    }

    core.info('☁️ Starting the Deploy using the Based CLI...')

    await exec.exec('npx --yes @based/cli deploy', ['--api-key', token])

    core.info('🎉 Success! Enjoy your fastest deploy ever!')

    process.exit()
  } catch (error) {
    core.setFailed(`🧨 Error deploying your repo: ${error.message}`)
  }
}

run()
