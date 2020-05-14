import { Toolkit } from 'actions-toolkit'
import createOrUpdateMajorRef from './utils/create-or-update-major-ref'
import createCommit from './utils/create-commit'
import updateTag from './utils/update-tag'
import { exec } from '@actions/exec'

Toolkit.run<{ setup: string }>(async tools => {
  if (tools.inputs.setup) {
    // Run the setup script
    await exec(tools.inputs.setup)
  }

  const {
    tag_name: tagName,
    draft,
    prerelease
  } = tools.context.payload.release
  
  // Create a new commit, with the new tree
  const commit = await createCommit(tools)

  // Update the tag to point to the new commit
  await updateTag(tools, commit.sha, tagName)

  // If this is a full release, also update the major version tag.
  // For example, for version v1.0.0, we'd also update v1.
  if (!draft && !prerelease) {
    return createOrUpdateMajorRef(tools, commit.sha, tagName)
  }
}, {
  event: 'release',
  secrets: ['GITHUB_TOKEN']
})
