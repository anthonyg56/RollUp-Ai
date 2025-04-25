import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "@server/lib/configs/s3-client";
import { HTTPException } from "hono/http-exception";
import { AssetBucket } from "@server/lib/constants";
import { createWriteStream, WriteStream } from "node:fs";
import { createStreamFromPath } from "@server/services/FileIO.service";
import { IncomingMessage } from "node:http";
import { SdkStream } from "@aws-sdk/types";
import { serverLogger } from "@server/lib/configs/logger";
import { handleError } from "@server/lib/utils";

export const getR2Obj = async (key: string, bucket: AssetBucket) => {
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

export const uploadR2Obj = async (inputPath: string, fileName: string, bucket: AssetBucket) => {
  const stream = await createStreamFromPath(inputPath, 'read');

  const key = generateObjectKey(fileName);
  const contentType = Bun.file(inputPath).type;

  const { ETag } = await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: stream,
      ContentType: contentType,
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

export const writeR2ObjToFile = async (assetR2Key: string, bucket: AssetBucket, inputPath: string) => {
  let stream: SdkStream<IncomingMessage> | undefined;
  let writeStream: WriteStream | undefined;

  try {
    stream = await getR2Obj(assetR2Key, bucket);
    writeStream = createWriteStream(inputPath);

    await new Promise((resolve, reject) => {
      writeStream!
        .on('finish', () => resolve(true))
        .on('error', reject);

      stream!
        .on('error', reject)
        .pipe(writeStream!);
    });

    return;
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