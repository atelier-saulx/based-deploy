import fs from 'fs'
import { parse, stringify } from 'yaml'

const publish = async () => {
    const file = fs.readFileSync('./.github/workflows/main.yaml', 'utf8')
    const yaml = parse(file)

    console.log(yaml)

}

publish()