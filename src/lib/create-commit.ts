import { Toolkit } from 'actions-toolkit'
import readFileBase64 from './read-file'

// This isn't exported from @octokit/types
declare type GitCreateTreeParamsTree = {
  path?: string;
  mode?: "100644" | "100755" | "040000" | "160000" | "120000";
  type?: "blob" | "tree" | "commit";
  sha?: string | null;
  content?: string;
}

export default async function createCommit(tools: Toolkit) {
  const { main } = tools.getPackageJSON<{ main?: string }>()

  if (!main) {
    throw new Error('Property "main" does not exist in your `package.json`.')
  }

  tools.log.info('Creating tree')
  let files: GitCreateTreeParamsTree[] = [
    {
      path: 'action.yml',
      mode: '100644',
      type: 'blob',
      sha: (await createBlob(tools, 'action.yml')).sha
    },
    {
      path: main,
      mode: '100644',
      type: 'blob',
      sha: (await createBlob(tools, main)).sha
    }
  ];

  // Add any additional files
  if (tools.inputs.additional_files) {
    const additional: GitCreateTreeParamsTree[] = await Promise.all(tools.inputs.additional_files.split(",")
    .map(async path =>{
      path = path.trim();
      return {
        path,
        mode: '100644',
        type: 'blob',
        sha: (await createBlob(tools, path)).sha
      } as GitCreateTreeParamsTree;
    }));

    files = files.concat(additional);
  }

  const tree = await tools.github.git.createTree({
    ...tools.context.repo,
    tree: files
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

async function createBlob(tools: Toolkit, filePath: string) {
  const content = await readFileBase64(tools.workspace, filePath)
  const blobData = await tools.github.git.createBlob({
    ...tools.context.repo,
    content,
    encoding: 'base64',
  })
  return blobData.data
}
