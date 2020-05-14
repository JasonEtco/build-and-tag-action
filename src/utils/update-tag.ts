import { Toolkit } from 'actions-toolkit'

export default async function updateTag(
  tools: Toolkit,
  sha: string,
  tagName: string
) {
  const ref = `tags/${tagName}`

  tools.log.info(`Updating ${ref}`)
  return tools.github.git.updateRef({
    ...tools.context.repo,
    ref,
    force: true,
    sha
  })
}
