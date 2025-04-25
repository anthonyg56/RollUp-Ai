import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { exists, mkdir, writeFile } from "node:fs/promises";
import { createReadStream as fsCreateReadStream, createWriteStream as fsCreateWriteStream } from 'fs';
import { ReadStream, rm, stat, unlink, WriteStream } from "node:fs";
import { serverLogger } from "@server/lib/configs/logger";

export async function createTmpDir(path = 'rollup-tmp') {
  const relativePath = join(tmpdir(), path);
  const resolvedPath = resolve(relativePath);

  await mkdir(resolvedPath, { recursive: true });

  if (!(await exists(resolvedPath))) {
    throw new Error(`Failed to create temporary directory at: ${resolvedPath}`);
  }

  return resolvedPath;
};

export async function createTmpFile(dir: string, name: string) {
  const filePath = join(dir, name);
  const resolvedPath = resolve(filePath);

  try {
    await writeFile(resolvedPath, '');
    return resolvedPath;
  } catch (error) {
    throw new Error(`Failed to create file at: ${resolvedPath}, ${error}`);
  }
};

export const getContentType = (filePath: string): string => {
  const file = Bun.file(filePath);
  return file.type;
};

export async function deleteFile(path: string) {
  return stat(path, async (err, stats) => {
    if (err) {
      return false;
    }
    if (!stats.isFile()) {
      return false;
    }

    return unlink(path, (err) => {
      if (err) {
        return false;
      }
      return true;
    });
  })
}

export async function removeDirRecursiveAsync(dirPath: string) {
  const targetPath = resolve(dirPath); // Ensure absolute path or resolve relative
  serverLogger.info(`Attempting to remove directory: ${targetPath}`);

  rm(targetPath, { recursive: true, force: true }, (err) => {
    if (err) {
      if (err.code === 'ENOENT') {
        serverLogger.info(`Directory does not exist, nothing to remove: ${targetPath}`);
      } else {
        serverLogger.error(`Error removing directory ${targetPath}:`, err);

        throw err;
      }
    }
  })
}

export async function createStreamFromPath(inputPath: string, streamType: 'read'): Promise<ReadStream>;
export async function createStreamFromPath(inputPath: string, streamType: 'write'): Promise<WriteStream>;
export async function createStreamFromPath(inputPath: string, streamType: 'read' | 'write'): Promise<ReadStream | WriteStream>;

export async function createStreamFromPath(inputPath: string, streamType: 'read' | 'write') {
  if (streamType === 'read') {
    const stream = fsCreateReadStream(inputPath);

    stream.on('error', (error) => {
      stream.destroy();
      throw error;
    });

    return stream;
  } else {
    const stream = fsCreateWriteStream(inputPath);

    stream.on('error', (error) => {
      stream.destroy();
      throw error;
    });

    return stream;
  }
}