import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as github from '@actions/github'
import { BasedClient } from '@based/client'
import { wait } from '@saulx/utils'
import { getBasedFile, Project } from './getBasedFile'

const getEnvByName = async (
  client: BasedClient,
  org: string,
  project: string,
  env: string,
) => {
  try {
    core.info(`🕘 Checking if the environment '${env}' exists.`)

    await client.query('env', { org, project, env }).get()

    core.info(`✅ Environment '${env}' found! Working on it.`)

    return true
  } catch (_) {
    core.info(`⚠️ Environment '${env}' not found!`)

    return false
  }
}

const deploy = async (token: string) => {
  core.info('☁️ Starting the Deploy using the Based CLI...')

  await exec.exec('npx --yes @based/cli@latest deploy', ['--api-key', token])

  core.info('🎉 Success! Enjoy your fastest deploy ever!')
}

async function run() {
  try {
    const userId = core.getInput('userID')
    const token = core.getInput('apiKey')
    const size = core.getInput('size') || 'small'
    const region = core.getInput('region') || 'eu-central-1'
    const action = core.getInput('action') || 'create-env'
    let isToCreateEnv = action === 'create-env'
    const branchName = isToCreateEnv
      ? github.context?.ref?.replace('refs/heads/', '')
      : github.context?.payload?.ref

    if (!userId || !token) {
      throw new Error(
        'You need to set the userID and the apiKey as input to the function to deploy your files.',
      )
    }

    core.info('✅ UserID and APIKey')

    let basedJson: Project | undefined = {}

    try {
      basedJson = await getBasedFile(['based.json', 'based.js', 'based.ts'])

      core.info('✅ Loaded "based.json".')
    } catch (error) {
      throw new Error(
        'Was not possible to find the based configuration file in the branch. Add the file and try again.',
      )
    }

    let { org, project, env } = basedJson!

    if (!org || !project || !env) {
      throw new Error(
        'Was not possible to read the based configuration file in the branch.',
      )
    }

    core.info('✅ Parsed "based.json".')

    env = env.endsWith('#branch') ? branchName : env
    const envInfo = env!.split('/')
    const isCleanEnvironment = envInfo.length === 1 && envInfo[0] === '#branch'
    const isAClonedEnv = envInfo.length === 2 && envInfo[1] === '#branch'
    const cloneEnvFrom = envInfo.length === 2 ? envInfo[0] : ''

    if (isCleanEnvironment) {
      core.info('🌟 A clean environment will be created.')
    } else if (isAClonedEnv && cloneEnvFrom) {
      core.info(`👯‍♀️ The env ${cloneEnvFrom} will be cloned.`)
    }

    const client = new BasedClient({
      org: 'saulx',
      project: 'based-cloud',
      env: 'platform',
      name: '@based/admin-hub',
    })

    core.info('✅ Based Client created.')

    try {
      await client.setAuthState({
        token,
        type: 'serviceAccount',
        userId,
      })

      core.info('✅ Based AuthState set.')
    } catch (error: any) {
      throw new Error(
        `Was not possible to log in using your credentials. Error: ${error.message}.`,
      )
    }

    const isEnvFound = await getEnvByName(client, org, project, env as string)

    if (!isToCreateEnv) {
      if (!isEnvFound) {
        throw new Error(
          "Is not possible to delete an environment that doesn't exist.",
        )
      }

      core.info('🕘 Trying to delete the environment...')

      try {
        await client.call('remove-env', {
          org,
          project,
          env,
        })

        core.info(`✅ Environment '${env}' deleted successfully.`)

        process.exit()
      } catch (error: any) {
        throw new Error(`Error deleting the environment: ${error.message}.`)
      }
    }

    if (isToCreateEnv && !isEnvFound && isCleanEnvironment) {
      try {
        core.info(`🕘 Trying to create a new environment named ${env}.`)
        core.info('✅ Waiting for the creation of the environment...')

        await client.call('create-env', {
          org,
          project,
          env: branchName,
          config: size,
          region,
        })

        await wait(60e3)

        core.info('✅ Environment created successfully.')
      } catch (error: any) {
        throw new Error(`Error creating the environment: ${error.message}.`)
      }
    }

    if (isToCreateEnv && !isEnvFound && isAClonedEnv) {
      try {
        core.info(
          `🕘 Trying to clone the env ${cloneEnvFrom} as new environment named ${env}.`,
        )
        core.info('✅ Waiting for the creation of the environment...')

        await client.call('clone-env', {
          source: {
            org,
            project,
            env: cloneEnvFrom,
          },
          dest: {
            org,
            project,
            env,
          },
          keepConfig: false,
        })

        await wait(60e3)

        core.info('✅ Environment created successfully.')
      } catch (error: any) {
        throw new Error(`Error creating the environment: ${error.message}.`)
      }
    }

    await deploy(token)

    process.exit()
  } catch (error: any) {
    core.setFailed(`🧨 Error: ${error.message}.`)

    process.exit()
  }
}

run()
