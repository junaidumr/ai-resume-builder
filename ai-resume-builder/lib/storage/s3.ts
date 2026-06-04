import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

export const s3 = new S3Client({
  region: process.env.AWS_REGION ?? "us-east-1",
})

export async function createUploadUrl({
  key,
  contentType,
}: {
  key: string
  contentType: string
}) {
  const bucket = process.env.AWS_S3_BUCKET

  if (!bucket) {
    throw new Error("AWS_S3_BUCKET is required to create upload URLs")
  }

  return getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 60 * 5 }
  )
}
