import nock from 'nock'
import { Toolkit } from 'actions-toolkit'
import * as exec from '@actions/exec'
import buildAndTagAction from '../src/lib'
import { generateToolkit } from './helpers'

jest.mock('@actions/exec')

describe('build-and-tag-action', () => {
  let tools: Toolkit

  beforeEach(() => {
    nock.cleanAll()
    tools = generateToolkit()
    delete process.env.INPUT_SETUP
    delete process.env.INPUT_TAG_NAME
  })

  it('updates the ref and updates an existing major ref', async () => {
    nock('https://api.github.com')
      .patch('/repos/JasonEtco/test/git/refs/tags%2Fv1.0.0')
      .reply(200)
      .patch('/repos/JasonEtco/test/git/refs/tags%2Fv1')
      .reply(200)
      .patch('/repos/JasonEtco/test/git/refs/tags%2Fv1.0')
      .reply(200)
      .get('/repos/JasonEtco/test/git/matching-refs/tags%2Fv1')
      .reply(200, [{ ref: 'tags/v1' }])
      .get('/repos/JasonEtco/test/git/matching-refs/tags%2Fv1.0')
      .reply(200, [{ ref: 'tags/v1.0' }])
      .post('/repos/JasonEtco/test/git/commits')
      .reply(200, { commit: { sha: '123abc' } })
      .post('/repos/JasonEtco/test/git/trees')
      .reply(200)

    await buildAndTagAction(tools)

    expect(nock.isDone()).toBe(true)
  })

  it('updates the ref and creates a new major & minor ref', async () => {
    nock('https://api.github.com')
      .patch('/repos/JasonEtco/test/git/refs/tags%2Fv1.0.0')
      .reply(200)
      .post('/repos/JasonEtco/test/git/refs')
      .times(2)
      .reply(200)
      .get('/repos/JasonEtco/test/git/matching-refs/tags%2Fv1')
      .reply(200, [])
      .get('/repos/JasonEtco/test/git/matching-refs/tags%2Fv1.0')
      .reply(200, [])
      .post('/repos/JasonEtco/test/git/commits')
      .reply(200, { commit: { sha: '123abc' } })
      .post('/repos/JasonEtco/test/git/trees')
      .reply(200)

    await buildAndTagAction(tools)

    expect(nock.isDone()).toBe(true)
  })

  it('does not update the major ref if the release is a draft', async () => {
    nock('https://api.github.com')
      .patch('/repos/JasonEtco/test/git/refs/tags%2Fv1.0.0')
      .reply(200)
      .post('/repos/JasonEtco/test/git/commits')
      .reply(200, { commit: { sha: '123abc' } })
      .post('/repos/JasonEtco/test/git/trees')
      .reply(200)

    tools.context.payload.release.draft = true

    await buildAndTagAction(tools)

    expect(nock.isDone()).toBe(true)
  })

  it('does not update the major ref if the release is a prerelease', async () => {
    nock('https://api.github.com')
      .patch('/repos/JasonEtco/test/git/refs/tags%2Fv1.0.0')
      .reply(200)
      .post('/repos/JasonEtco/test/git/commits')
      .reply(200, { commit: { sha: '123abc' } })
      .post('/repos/JasonEtco/test/git/trees')
      .reply(200)

    tools.context.payload.release.prerelease = true

    await buildAndTagAction(tools)

    expect(nock.isDone()).toBe(true)
  })

  it('does not run the setup command if its empty', async () => {
    nock('https://api.github.com')
      .patch('/repos/JasonEtco/test/git/refs/tags%2Fv1.0.0')
      .reply(200)
      .patch('/repos/JasonEtco/test/git/refs/tags%2Fv1')
      .reply(200)
      .get('/repos/JasonEtco/test/git/matching-refs/tags%2Fv1')
      .reply(200, [{ ref: 'tags/v1' }])
      .post('/repos/JasonEtco/test/git/commits')
      .reply(200, { commit: { sha: '123abc' } })
      .post('/repos/JasonEtco/test/git/trees')
      .reply(200)

    const spy = jest.spyOn(exec, 'exec')
    process.env.INPUT_SETUP = ''

    await buildAndTagAction(tools)
    expect(spy).not.toHaveBeenCalled()
  })

  it('runs the setup command if it is not empty', async () => {
    nock('https://api.github.com')
      .patch('/repos/JasonEtco/test/git/refs/tags%2Fv1.0.0')
      .reply(200)
      .patch('/repos/JasonEtco/test/git/refs/tags%2Fv1')
      .reply(200)
      .get('/repos/JasonEtco/test/git/matching-refs/tags%2Fv1')
      .reply(200, [{ ref: 'tags/v1' }])
      .post('/repos/JasonEtco/test/git/commits')
      .reply(200, { commit: { sha: '123abc' } })
      .post('/repos/JasonEtco/test/git/trees')
      .reply(200)

    const spy = jest.spyOn(exec, 'exec')
    process.env.INPUT_SETUP = 'echo "Hello!"'

    await buildAndTagAction(tools)
    expect(spy).toHaveBeenCalled()
    expect(spy).toHaveBeenCalledWith('bash -c', ['echo "Hello!"'])
  })

  it('updates the ref and creates a new major ref for an event other than `release`', async () => {
    nock('https://api.github.com')
      .patch('/repos/JasonEtco/test/git/refs/tags%2Fv2.0.0')
      .reply(200)
      .post('/repos/JasonEtco/test/git/refs')
      .times(2)
      .reply(200)
      .get('/repos/JasonEtco/test/git/matching-refs/tags%2Fv2')
      .reply(200, [])
      .get('/repos/JasonEtco/test/git/matching-refs/tags%2Fv2.0')
      .reply(200, [])
      .post('/repos/JasonEtco/test/git/commits')
      .reply(200, { commit: { sha: '123abc' } })
      .post('/repos/JasonEtco/test/git/trees')
      .reply(200)

    tools.context.event = 'pull_request'
    process.env.INPUT_TAG_NAME = 'v2.0.0'

    await buildAndTagAction(tools)

    expect(nock.isDone()).toBe(true)
  })
})
