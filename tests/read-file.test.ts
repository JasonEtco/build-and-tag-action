import path from 'path'
import readFileBase64 from '../src/lib/read-file'
import {Buffer} from 'buffer'

describe('read-file', () => {
  const baseDir = path.join(__dirname, 'fixtures')

  it('reads the file and returns the contents', async () => {
    const result = await readFileBase64(baseDir, 'file.md')
    expect(result).toBe(convertToBase64('Hello!\n'))
  })

  it('throws if the file does not exist', async () => {
    await expect(readFileBase64(baseDir, 'nope')).rejects.toThrowError(
      'nope does not exist.'
    )
  })
})

function convertToBase64(value: string) {
  return Buffer.from(value, 'utf8').toString('base64')
}