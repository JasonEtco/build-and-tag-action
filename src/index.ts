import fs from 'fs'
import path from 'path'
import { Toolkit } from 'actions-toolkit'
import semver from 'semver'

Toolkit.run(async tools => {
  const { main } = tools.getPackageJSON()

  const [actionYaml, code] = await Promise.all(['action.yml', main].map(name =>
    fs.promises.readFile(path.join(tools.workspace, name), 'utf8')
  ))

  tools.log.info('Creating tree')
  const tree = await tools.github.git.createTree({
    ...tools.context.repo,
    tree: [
      {
        path: 'action.yml',
        mode: '100644',
        type: 'blob',
        content: actionYaml,
        sha: tools.context.sha
      },
      {
        path: main,
        mode: '100644',
        type: 'blob',
        content: code,
        sha: tools.context.sha
      }
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

  const { tag_name: tagName, draft } = tools.context.payload.release

  tools.log.info(`Updating tags/${tagName}`)
  await tools.github.git.updateRef({
    ...tools.context.repo,
    ref: `tags/${tagName}`,
    force: true,
    sha: commit.data.sha
  })

  if (draft) {
    return tools.exit.success('All done!')
  }

  const refName = `tags/v${semver.major(tagName)}`
  tools.log.info(`Updating major version tag ${refName}`)
  const { data: matchingRefs } = await tools.github.git.listMatchingRefs({
    ...tools.context.repo,
    ref: refName
  })

  const matchingRef = matchingRefs.find((refObj) => {
    return refObj.ref.endsWith(refName)
  })

  if (matchingRef !== undefined) {
    await tools.github.git.updateRef({
      ...tools.context.repo,
      force: true,
      ref: refName,
      sha: commit.data.sha
    })
  } else {
    await tools.github.git.createRef({
      ...tools.context.repo,
      ref: `refs/${refName}`,
      sha: commit.data.sha
    })
  }
}, {
  event: 'release',
  secrets: ['GITHUB_TOKEN']
})
