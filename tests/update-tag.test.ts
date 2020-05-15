import nock from 'nock'
import updateTag from '../src/lib/update-tag'
import { generateToolkit } from './helpers'
import { Toolkit } from 'actions-toolkit'

describe('update-tag', () => {
  let tools: Toolkit
  let params: any

  beforeEach(() => {
    nock('https://api.github.com')
      .patch('/repos/JasonEtco/test/git/refs/tags%2Fv1.0.0')
      .reply(200, (_, body) => {
        params = body
      })

    tools = generateToolkit()
  })

  it('updates the tag', async () => {
    await updateTag(tools, '123abc', 'v1.0.0')

    expect(nock.isDone()).toBe(true)
    expect(params).toEqual({
      force: true,
      sha: '123abc'
    })
  })
})
