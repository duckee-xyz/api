import { S3 } from '@aws-sdk/client-s3';
import { PutObjectCommandOutput } from '@aws-sdk/client-s3/dist-types/commands/PutObjectCommand';
import { Upload } from '@aws-sdk/lib-storage';
import { Duplex, PassThrough } from 'stream';

export interface S3UploadStream {
  url: string;
  stream: Duplex;
  done: Promise<PutObjectCommandOutput>;
}

const BUCKET = 'static.duckee.xyz';

export async function uploadToS3(path: string): Promise<S3UploadStream> {
  const stripPath = path.replace(/^\/+/, '');
  const stream = new PassThrough();

  const upload = new Upload({
    client: new S3({}),
    queueSize: 4, // optional concurrency configuration
    leavePartsOnError: false, // optional manually handle dropped parts
    params: {
      Bucket: BUCKET,
      Key: stripPath,
      Body: stream,
    },
  });
  return {
    url: `https://${BUCKET}/${stripPath}`,
    stream,
    done: upload.done(),
  };
}
