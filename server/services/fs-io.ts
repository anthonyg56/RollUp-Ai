import { tmpdir } from "node:os";
import { join } from "node:path";
import { mkdir } from "node:fs/promises";
import { BunFile } from "bun";
import { createReadStream as fsCreateReadStream, createWriteStream as fsCreateWriteStream } from 'fs';
import { ReadStream, WriteStream } from "node:fs";

export async function createTmpPath(path = '') {
  const tempPath = join(tmpdir(), `tmp/${path}`);
  await mkdir(tempPath, { recursive: true });

  return tempPath;
};

export async function convertFileToStream(file: BunFile, streamType: 'read'): Promise<ReadStream>;
export async function convertFileToStream(file: BunFile, streamType: 'write'): Promise<WriteStream>;
export async function convertFileToStream(file: BunFile, streamType: 'read' | 'write'): Promise<ReadStream | WriteStream>;

export async function convertFileToStream(file: File | BunFile, streamType: 'read' | 'write') {
  if (streamType === 'read') {
    const stream = fsCreateReadStream(file.toString());

    stream.on('error', (error) => {
      stream.destroy();
      throw error;
    });

    return stream;
  } else {
    const stream = fsCreateWriteStream(file.toString());

    stream.on('error', (error) => {
      stream.destroy();
      throw error;
    });

    return stream;
  }
}