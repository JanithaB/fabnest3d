import { unlink } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

/**
 * Deletes a file from the filesystem if it exists
 * @param filePath The absolute path to the file
 * @returns true if file was deleted or didn't exist, false if deletion failed
 */
export async function deleteFileFromDisk(filePath: string): Promise<boolean> {
  try {
    if (existsSync(filePath)) {
      await unlink(filePath)
      return true
    }
    // File doesn't exist, consider it "deleted"
    return true
  } catch (error) {
    console.error(`Failed to delete file ${filePath}:`, error)
    return false
  }
}

/**
 * Deletes multiple files from the filesystem
 * @param filePaths Array of absolute paths to files
 * @returns Array of booleans indicating success for each file
 */
export async function deleteFilesFromDisk(filePaths: string[]): Promise<boolean[]> {
  const results = await Promise.all(
    filePaths.map(path => deleteFileFromDisk(path))
  )
  return results
}

