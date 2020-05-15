import { Toolkit } from 'actions-toolkit'
import { Signale } from 'signale'

export function generateToolkit() {
  const tools = new Toolkit({
    logger: new Signale({ disabled: true })
  })

  return tools
}
