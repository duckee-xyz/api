import { ec as EC } from 'elliptic';
import { SHA3 } from 'sha3';

const p256 = new EC('p256');

/**
 * Generates a P256-SHA3 (i.e. secp256p1) keypair.
 */
export async function generateKeys() {
  const newKeyPair = p256.genKeyPair();

  const privateKey = newKeyPair.getPrivate().toString('hex');
  const publicKeyEC = newKeyPair.getPublic();

  const pkX = publicKeyEC.getX().toString('hex');
  const pkY = publicKeyEC.getY().toString('hex');

  const publicKeyXY = `${pkX}${pkY}`;
  const publicKey = publicKeyXY.length % 2 === 1 ? `0${publicKeyXY}` : publicKeyXY; // add leading-zero padding

  return { privateKey, publicKey };
}

export async function sign(payloadHex: string, privateKeyHex: string) {
  const keyHexBuffer = Buffer.from(privateKeyHex, 'hex');

  const ecKeyPair = p256.keyFromPrivate(keyHexBuffer);

  const payloadBuffer = Buffer.from(payloadHex, 'hex');

  const sha3HasherSize = 256;
  const sha3Hasher = new SHA3(sha3HasherSize);
  const payloadBufferDigest = sha3Hasher.update(payloadBuffer).digest();

  const ecSignature = ecKeyPair.sign(payloadBufferDigest);

  const bufferEndianness = 'be';
  const ecSignatureN = 32;

  const signature = Buffer.concat([
    ecSignature.r.toBuffer(bufferEndianness, ecSignatureN),
    ecSignature.s.toBuffer(bufferEndianness, ecSignatureN),
  ]).toString('hex');

  return signature;
}
