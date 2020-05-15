import { Toolkit } from 'actions-toolkit'
import { Signale } from 'signale'
import * as core from '@actions/core'

export function generateToolkit() {
  const tools = new Toolkit({
    logger: new Signale({ disabled: true })
  })

  // Turn core.setOutput into a mocked noop
  jest.spyOn(core, 'setOutput').mockImplementation(() => {})

  // Turn core.setFailed into a mocked noop
  jest.spyOn(core, 'setFailed').mockImplementation(() => {})

  return tools
}
