import { Toolkit } from 'actions-toolkit'
import buildAndTagAction from './utils'

Toolkit.run(buildAndTagAction, {
  event: 'release',
  secrets: ['GITHUB_TOKEN']
})
