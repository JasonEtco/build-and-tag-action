import fs from 'fs'
import path from 'path'
import { Toolkit } from 'actions-toolkit'

export default async function readFile(tools: Toolkit, file: string) {
  const pathToFile = path.join(tools.workspace, file)
  if (!fs.existsSync(file)) {
    throw new Error(`${file} does not exist.`)
  }

  return fs.promises.readFile(pathToFile, 'utf8')
}
