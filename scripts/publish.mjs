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

const publish = async () => {
    const pathYaml = './.github/workflows/main.yaml'
    const pathReadme = './README.md'
    const yaml = parse(fs.readFileSync(pathYaml, 'utf8'))
    const readme = fs.readFileSync(pathReadme, 'utf8')
    const { version } = JSON.parse(fs.readFileSync('./package.json', 'utf8'))

    const finalYaml = stringify({
        ...yaml,
        jobs: {
            ...yaml.jobs,
            deploy: {
                ...yaml.jobs.deploy,
                steps: [
                    ...yaml.jobs.deploy.steps.map((elm) => {
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

    const finalReadme = replaceVersion(readme, version)

    saveFile(pathYaml, finalYaml)
    saveFile(pathReadme, finalReadme)
}

publish()