import nock from 'nock'
import createCommit from '../src/lib/create-commit'
import { generateToolkit } from './helpers'
import { Toolkit } from 'actions-toolkit'

describe('create-commit', () => {
  let tools: Toolkit
  let treeParams: any
  let commitParams: any

  beforeEach(() => {
    nock('https://api.github.com')
      .post('/repos/JasonEtco/test/git/commits')
      .reply(200, (_, body) => {
        commitParams = body
      })
      .post('/repos/JasonEtco/test/git/trees')
      .reply(200, (_, body) => {
        treeParams = body
      })

    tools = generateToolkit()
  })

  it('creates the tree and commit', async () => {
    jest.spyOn(tools, 'getPackageJSON').mockReturnValueOnce({ main: "index.js" })
    await createCommit(tools)
    expect(nock.isDone()).toBe(true)

    // Test that our tree was created correctly
    expect(treeParams.tree).toHaveLength(2)
    expect(treeParams.tree.some((obj: any) => obj.path === 'index.js')).toBe(
      true
    )

    // Test that our commit was created correctly
    expect(commitParams.message).toBe('Automatic compilation')
    expect(commitParams.parents).toEqual([tools.context.sha])
  })

  it('fails if neither main or files exists in package.json', async () => {
    jest.spyOn(tools, 'getPackageJSON').mockReturnValueOnce({})
    await expect(() => createCommit(tools)).rejects.toThrow(
      'Neither property "main" or "files" exist in your `package.json`.'
    )
  })

  it('supports only files as input to package', async () => {
    jest.spyOn(tools, 'getPackageJSON').mockReturnValueOnce({ files: [ "README.md", "another-action/action.yml", "another-action/index.js"] })
    await createCommit(tools)

    // Test that our tree was created correctly
    expect(treeParams.tree).toHaveLength(3)
    expect(treeParams.tree.some((obj: any) => obj.path === 'README.md')).toBe(true)
    expect(treeParams.tree.some((obj: any) => obj.path === 'another-action/action.yml')).toBe(true)
    expect(treeParams.tree.some((obj: any) => obj.path === 'another-action/index.js')).toBe(true)
  })

  it('supports both main and files in package', async () => {
    await createCommit(tools)

    // Test that our tree was created correctly
    expect(treeParams.tree).toHaveLength(5)
  })
})
