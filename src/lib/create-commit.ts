import { Toolkit } from 'actions-toolkit'
import readFile from './read-file'

export default async function createCommit(tools: Toolkit) {
  const { main } = tools.getPackageJSON<{ main?: string }>()

  if (!main) {
    throw new Error('Property "main" does not exist in your `package.json`.')
  }

  let additional_files: any[] = []
  if (tools.inputs.additional_files) {
    if (tools.inputs.additional_files.indexOf('\n') > -1) {
      additional_files = tools.inputs.additional_files.split('\n').map(async (f: any) => {
        return {
          path: f,
          mode: '100644',
          type: 'blob',
          content: await readFile(tools.workspace, f)
        }
      })
    } else {
      additional_files = [
        {
          path: tools.inputs.additional_files,
          mode: '100644',
          type: 'blob',
          content: await readFile(tools.workspace, tools.inputs.additional_files)
        }
      ]
    }
  }

  tools.log.info('Creating tree')
  const tree = await tools.github.git.createTree({
    ...tools.context.repo,
    tree: [
      {
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
      },
      ...additional_files
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
