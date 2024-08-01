import fs from 'fs'
import { parse, stringify } from 'yaml'

const replaceVersion = (inputString, newVersion) => {
    return inputString.replace(/atelier-saulx\/based-deploy@.*/, 'atelier-saulx/based-deploy@v' + newVersion);
}

const saveFile = (file, content) => {
    fs.writeFile(file, content, (err) => {
        if (err) {
            console.error('🧨 Error saving the file:', file, err);
        } else {
            console.log('🎉 File saved successfully!', file);
        }
    });
}

const parseYaml = (yaml, type, version) => {
    return stringify({
        ...yaml,
        jobs: {
            ...yaml.jobs,
            deploy: {
                ...yaml.jobs[type],
                steps: [
                    ...yaml.jobs[type].steps.map((elm) => {
                        if (!elm.uses) return elm

                        const uses = replaceVersion(elm.uses, version)

                        return {
                            ...elm,
                            uses
                        }
                    })
                ]
            }
        }
    })
}

const publish = async () => {
    const pathCreateYaml = './.github/workflows/deploy.yaml'
    const pathDeleteYaml = './.github/workflows/delete.yaml'
    const pathReadme = './README.md'
    const createYaml = parse(fs.readFileSync(pathCreateYaml, 'utf8'))
    const deleteYaml = parse(fs.readFileSync(pathDeleteYaml, 'utf8'))
    const readme = fs.readFileSync(pathReadme, 'utf8')
    const { version } = JSON.parse(fs.readFileSync('./package.json', 'utf8'))

    const finalCreateYaml = parseYaml(createYaml, 'deploy', version)
    const finalDeleteYaml = parseYaml(deleteYaml, 'delete', version)

    const finalReadme = replaceVersion(readme, version)

    saveFile(pathCreateYaml, finalCreateYaml)
    saveFile(pathDeleteYaml, finalDeleteYaml)
    saveFile(pathReadme, finalReadme)
}

publish()