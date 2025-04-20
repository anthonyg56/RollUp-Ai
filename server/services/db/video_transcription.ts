import db from "@server/db";
import { NewVideoTranscript, videoTranscripts } from "@server/db/models";
import { createTmpPath } from "../fs-io";
import { putVideoAsset } from "../r2";
import { insertNewVideoAsset } from "./assets.services";
import { unlink } from "node:fs/promises";

export async function insertVideoTranscript(data: NewVideoTranscript) {
  const results = await db
    .insert(videoTranscripts)
    .values(data)
    .returning();

  return results[0];
}

export async function uploadTranscripts(userId: string, videoSubmissionId: string, transripts: { srtTranscript: string, plainTranscript: string }) {
  let srtFilePath = `${videoSubmissionId}-${Date.now()}.srt`;
  let plainFilePath = `${videoSubmissionId}-${Date.now()}.txt`;

  srtFilePath = await createTmpPath(`transcripts/${srtFilePath}`);
  plainFilePath = await createTmpPath(`transcripts/${plainFilePath}`);

  await Bun.write(srtFilePath, transripts.srtTranscript);
  await Bun.write(plainFilePath, transripts.plainTranscript);

  const srtFile = Bun.file(srtFilePath);
  const plainFile = Bun.file(plainFilePath);

  const [srtResponse, plainResponse] = await Promise.all([
    putVideoAsset(srtFile, "srt_transcripts"),
    putVideoAsset(plainFile, "plain_transcripts"),
  ]);

  await unlink(srtFilePath).catch(() => { });
  await unlink(plainFilePath).catch(() => { });

  const [srtTranscriptAsset, plainTranscriptAsset] = await Promise.all([
    insertNewVideoAsset({
      userId,
      assetType: "srt_transcript",
      r2ETag: srtResponse.eTag,
      r2Key: srtResponse.key,
      videoSubmissionId,
    }),
    insertNewVideoAsset({
      userId,
      assetType: "plain_transcript",
      r2ETag: plainResponse.eTag,
      r2Key: plainResponse.key,
      videoSubmissionId,
    }),
  ]);

  return {
    srtTranscriptAsset,
    plainTranscriptAsset,
  };
};