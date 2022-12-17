import nock from 'nock'
import createOrUpdateRef from '../src/lib/create-or-update-ref'
import { generateToolkit } from './helpers'
import { Toolkit } from 'actions-toolkit'

describe('create-or-update-ref', () => {
  let tools: Toolkit

  beforeEach(() => {
    tools = generateToolkit()
  })

  it('updates the major ref if it already exists', async () => {
    nock('https://api.github.com')
      .patch('/repos/JasonEtco/test/git/refs/tags%2Fv1')
      .reply(200)
      .get('/repos/JasonEtco/test/git/matching-refs/tags%2Fv1')
      .reply(200, [{ ref: 'tags/v1' }])

    await createOrUpdateRef(tools, '123abc', 'v1')

    expect(nock.isDone()).toBe(true)
  })

  it('creates a new major ref if it does not already exist', async () => {
    let params: any

    nock('https://api.github.com')
      .post('/repos/JasonEtco/test/git/refs')
      .reply(200, (_, body) => {
        params = body
      })
      .get('/repos/JasonEtco/test/git/matching-refs/tags%2Fv1')
      .reply(200, [])

    await createOrUpdateRef(tools, '123abc', 'v1')

    expect(nock.isDone()).toBe(true)
    expect(params.ref).toBe('refs/tags/v1')
  })

  it('creates a new minor ref if it does not already exist', async () => {
    let params: any

    nock('https://api.github.com')
      .post('/repos/JasonEtco/test/git/refs')
      .reply(200, (_, body) => {
        params = body
      })
      .get('/repos/JasonEtco/test/git/matching-refs/tags%2Fv1.0')
      .reply(200, [])

    await createOrUpdateRef(tools, '123abc', 'v1.0')

    expect(nock.isDone()).toBe(true)
    expect(params.ref).toBe('refs/tags/v1.0')
  })
})
