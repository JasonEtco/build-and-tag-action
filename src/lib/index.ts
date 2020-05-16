import { Toolkit } from 'actions-toolkit'
import { exec } from '@actions/exec'
import createOrUpdateMajorRef from './create-or-update-major-ref'
import createCommit from './create-commit'
import updateTag from './update-tag'
import getTagName from './get-tag-name'

export default async function buildAndTagAction(tools: Toolkit) {
  if (tools.inputs.setup) {
    // Run the setup script
    tools.log.info(`Running setup script: ${tools.inputs.setup}`)
    await exec(tools.inputs.setup)
  } else {
    tools.log.info('Skipping setup script, none provided.')
  }

  // Get the tag to update
  const tagName = getTagName(tools)
  tools.log.info(`Updating tag [${tagName}]`)

  // Create a new commit, with the new tree
  const commit = await createCommit(tools)

  // Update the tag to point to the new commit
  await updateTag(tools, commit.sha, tagName)

  // Also update the major version tag.
  // For example, for version v1.0.0, we'd also update v1.
  let shouldRewriteMajorRef = true

  // If this is a release event, only update the major ref for a full release.
  if (tools.context.event === 'release') {
    const { draft, prerelease } = tools.context.payload.release
    if (draft || prerelease) {
      shouldRewriteMajorRef = false
    }
  }

  if (shouldRewriteMajorRef) {
    return createOrUpdateMajorRef(tools, commit.sha, tagName)
  }
}
