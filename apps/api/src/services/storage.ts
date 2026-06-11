import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { logger } from "../logger";

// Initialize the standard AWS S3 Client
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "linkbhejo-uploads";

/**
 * Uploads a file buffer directly to S3
 */
export async function uploadFile(
  key: string,
  body: Buffer,
  contentType: string
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
      // ACL: "public-read" // Uncomment if bucket policies allow ACLs
    });

    await s3Client.send(command);
    
    // Return the public URL if defined, otherwise construct the standard AWS URL
    const publicUrlBase = process.env.AWS_S3_PUBLIC_URL;
    if (publicUrlBase) {
      return `${publicUrlBase}/${key}`;
    }
    
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;
  } catch (error) {
    logger.error("Failed to upload file to S3", { error, key });
    throw error;
  }
}

/**
 * Generates a presigned URL for secure uploads directly from the client (Next.js)
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 3600
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    logger.error("Failed to generate presigned URL", { error, key });
    throw error;
  }
}

/**
 * Deletes an object from S3
 */
export async function deleteFile(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    logger.error("Failed to delete file from S3", { error, key });
    throw error;
  }
}
