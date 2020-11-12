import fs from 'fs'
import path from 'path'
import jsYaml from 'js-yaml'

/**
 * Helper that reads the `action.yml` and includes the default values
 * for each input as an environment variable, like the Actions runtime does.
 */
function getDefaultValues() {
  const yaml = fs.readFileSync(path.join(__dirname, '../action.yml'), 'utf8')
  const { inputs } = jsYaml.safeLoad(yaml) as any
  return Object.keys(inputs).reduce(
    (sum, key) => ({
      ...sum,
      [key]: inputs[key].default
    }),
    {}
  )
}

Object.assign(
  process.env,
  {
    GITHUB_ACTION: 'my-action',
    GITHUB_ACTOR: 'JasonEtco',
    GITHUB_EVENT_NAME: 'release',
    GITHUB_EVENT_PATH: path.join(__dirname, 'fixtures', 'release.json'),
    GITHUB_REF: 'master',
    GITHUB_REPOSITORY: 'JasonEtco/test',
    GITHUB_SHA: '123abc',
    GITHUB_TOKEN: '456def',
    GITHUB_WORKFLOW: 'my-workflow',
    GITHUB_WORKSPACE: path.join(__dirname, 'fixtures', 'workspace'),
    HOME: '?'
  },
  getDefaultValues()
)
