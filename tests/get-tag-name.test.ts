import getTagName from '../src/lib/get-tag-name'
import { generateToolkit } from './helpers'
import { Toolkit } from 'actions-toolkit'

describe('update-tag', () => {
  let tools: Toolkit

  beforeEach(() => {
    tools = generateToolkit()
    delete process.env.INPUT_TAG_NAME
  })

  it('gets the tag from the release payload', () => {
    const result = getTagName(tools)
    expect(result).toBe('v1.0.0')
  })

  it('gets the tag from the release payload', () => {
    process.env.INPUT_TAG_NAME = 'v2.1.1'
    const result = getTagName(tools)
    expect(result).toBe('v2.1.1')
  })

  it('gets the tag from the release payload', () => {
    tools.context.event = 'pizza'
    expect(() => getTagName(tools)).toThrowError(
      'No tag_name was found or provided!'
    )
  })
})
