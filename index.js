const fs = require('fs')
const path = require('path')
const { Toolkit } = require('actions-toolkit')
const semver = require('semver')

Toolkit.run(async tools => {
  const { main } = tools.getPackageJSON()

  const readFile = name => fs.promises.readFile(path.join(tools.workspace, name), 'utf8')
  const [actionYaml, code] = await Promise.all([
    readFile('action.yml'),
    readFile(main)
  ])

  const tree = await tools.github.git.createTree({
    ...tools.context.repo,
    tree: [
      {
        path: 'action.yml',
        mode: '100644',
        type: 'blob',
        content: actionYaml,
        base_tree: tools.context.sha
      },
      {
        path: main,
        mode: '100644',
        type: 'blob',
        content: code,
        base_tree: tools.context.sha
      }
    ]
  })

  tools.log.complete('Tree created')

  const commit = await tools.github.git.createCommit({
    ...tools.context.repo,
    message: 'Automatic compilation',
    tree: tree.data.sha,
    parents: [tools.context.sha]
  })

  tools.log.complete('Commit created')

  const { tag_name: tagName, draft } = tools.context.payload.release

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
