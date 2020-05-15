import { Toolkit } from 'actions-toolkit'
import buildAndTagAction from './lib'

Toolkit.run(buildAndTagAction, {
  secrets: ['GITHUB_TOKEN']
})
