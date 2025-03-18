import { Toolkit } from 'actions-toolkit'

export default async function createOrUpdateRef(
  tools: Toolkit,
  sha: string,
  tagName: string
) {
  const refName = `tags/${tagName}`
  tools.log.info(`Checking if version tag ${refName} already exists...`)
  const { data: matchingRefs } = await tools.github.git.listMatchingRefs({
    ...tools.context.repo,
    ref: refName
  })

  const matchingRef = matchingRefs.find((refObj) => {
    return refObj.ref.endsWith(refName)
  })

  if (matchingRef !== undefined) {
    tools.log.info(`Tag ${refName} already exists, updating it.`)
    await tools.github.git.updateRef({
      ...tools.context.repo,
      force: true,
      ref: refName,
      sha
    })
  } else {
    tools.log.info(`Tag ${refName} does not exist, creating it.`)
    await tools.github.git.createRef({
      ...tools.context.repo,
      ref: `refs/${refName}`,
      sha
    })
  }
}
