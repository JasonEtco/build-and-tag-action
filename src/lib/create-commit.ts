import { Toolkit } from 'actions-toolkit'
import readFile from './read-file'

export default async function createCommit(tools: Toolkit) {
  const { main, files } = tools.getPackageJSON<{ main?: string, files?: string[] }>()

  if (!main && !files?.length) {
    throw new Error('Neither property "main" or "files" exist in your `package.json`.')
  }

  const mainFiles = await getMainFilesTree(tools, main)
  const additionalFiles = await getAdditionFilesTree(tools, files)

  tools.log.info('Creating tree')
  const tree = await tools.github.git.createTree({
    ...tools.context.repo,
    tree: [
      ...mainFiles,
      ...additionalFiles
    ]
  })

  tools.log.complete('Tree created')

  tools.log.info('Creating commit')
  const commit = await tools.github.git.createCommit({
    ...tools.context.repo,
    message: 'Automatic compilation',
    tree: tree.data.sha,
    parents: [tools.context.sha]
  })
  tools.log.complete('Commit created')

  return commit.data
}

async function getMainFilesTree(tools: Toolkit, main?: string): Promise<any[]> {
  if (!main) {
    return []
  }
  
  tools.log.info('Adding main files to tree')
  return [{
    path: 'action.yml',
    mode: '100644',
    type: 'blob',
    content: await readFile(tools.workspace, 'action.yml')
  },
  {
    path: main,
    mode: '100644',
    type: 'blob',
    content: await readFile(tools.workspace, main)
  }]
}

async function getAdditionFilesTree(tools: Toolkit, files?: string[]): Promise<any[]> {
  if (!files?.length) {
    return []
  }

  tools.log.info('Adding additional files into tree')
  return Promise.all(files.map(async (fileName) => ({
    path: fileName,
    mode: '100644',
    type: 'blob',
    content: await readFile(tools.workspace, fileName)
  })))
}

