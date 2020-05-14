import { Toolkit } from 'actions-toolkit'
import buildAndTagAction from './lib'

Toolkit.run(buildAndTagAction, {
  event: 'release',
  secrets: ['GITHUB_TOKEN']
})
