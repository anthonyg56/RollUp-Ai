import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "@server/lib/configs/s3-client";
import { HTTPException } from "hono/http-exception";
import { BunFile } from "bun";
import { R2Bucket } from "@server/lib/constants";
import { createWriteStream, WriteStream } from "node:fs";
import { createTmpPath } from "./fs-io";
import { IncomingMessage } from "node:http";
import { SdkStream } from "@aws-sdk/types";
import { serverLogger } from "@server/lib/configs/logger";
import { handleError } from "@server/lib/utils";

export const getVideoAsset = async (key: string, bucket: R2Bucket) => {
  const getObjectCommand = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const { Body } = await s3Client.send(getObjectCommand)
    .catch(err => {
      serverLogger.error(err);

      throw new HTTPException(500, {
        message: "Failed to get file from R2",
        cause: err,
      });
    });;

  if (!Body) {
    throw new HTTPException(404, {
      message: "File not found",
    });
  }

  return Body
}

export const putVideoAsset = async (file: File | BunFile, bucket: R2Bucket) => {
  if (!file.name) {
    throw new HTTPException(400, {
      message: "File name is required",
    });
  };

  const key = generateObjectKey(file.name);

  const { ETag } = await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: file.type,
    }))
    .catch(err => {
      serverLogger.error(err);

      throw new HTTPException(500, {
        message: "Failed to upload file to R2",
        cause: err,
      });
    });

  if (!ETag) {
    throw new HTTPException(500, {
      message: "ETag is undefined",
    });
  };

  return {
    eTag: ETag,
    key,
  };
};

export const pipeAssetToPath = async (assetR2Key: string, bucket: R2Bucket) => {
  let stream: SdkStream<IncomingMessage> | undefined;
  let writeStream: WriteStream | undefined;

  try {
    stream = await getVideoAsset(assetR2Key, bucket);
    const inputPath = await createTmpPath(`${bucket}/input-${assetR2Key}`);
    writeStream = createWriteStream(inputPath);

    await new Promise((resolve, reject) => {
      writeStream!
        .on('finish', () => resolve(true))
        .on('error', reject);

      stream!
        .on('error', reject)
        .pipe(writeStream!);
    });

    return inputPath;
  } catch (error) {
    throw handleError(error, "Failed to create stream from asset");
  } finally {
    stream?.destroy();
    writeStream?.destroy();
  }
}

export const generateObjectKey = (name: string) => {
  const timestamp = Date.now();
  const uniqueId = crypto.randomUUID();
  const originalName = name.replace(/[^a-zA-Z0-9.-]/g, '_');

  return `${timestamp}-${uniqueId}-${originalName}`;
}