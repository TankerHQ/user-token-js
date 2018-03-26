// @flow
import { generichash, tcrypto, utils, createUserSecretB64, type b64string } from '@tanker/crypto';

function logError(step: string, err: Error): void {
  if (console && 'error' in console) {
    console.error(`Failed to ${step}: ${err}`);
  }
}

function run<T>(step: string, fun: () => T): T {
  try {
    return fun();
  } catch (err) {
    logError(step, err);
    throw err;
  }
}

// trustchainId = base64 encoded trustchain id
// trustchainPrivateKey = base64 encoded trustchain private key
// userId = user id, as a string
export function generateUserToken(trustchainId: b64string, trustchainPrivateKey: b64string, userId: string) {
  const obfuscatedUserId = run('hash the user id', () => {
    const userIdBuffer = utils.concatArrays(utils.fromString(userId), utils.fromBase64(trustchainId));
    return generichash(userIdBuffer);
  });

  const ephemeralKeyPair = run('generate an ephemeral key pair', () => {
    return tcrypto.makeSignKeyPair();
  });

  const delegationSignature = run('create a delegation signature', () => {
    const toSign = utils.concatArrays(ephemeralKeyPair.publicKey, obfuscatedUserId);
    return tcrypto.sign(toSign, utils.fromBase64(trustchainPrivateKey));
  });

  const userSecret = run('create a user secret', () => {
    return createUserSecretB64(trustchainId, userId);
  });

  const userToken = run('serialize the user token', () => {
    return utils.toBase64(utils.fromString(JSON.stringify({
      ephemeral_public_signature_key: utils.toBase64(ephemeralKeyPair.publicKey),
      ephemeral_private_signature_key: utils.toBase64(ephemeralKeyPair.privateKey),
      user_id: utils.toBase64(obfuscatedUserId),
      delegation_signature: utils.toBase64(delegationSignature),
      user_secret: userSecret
    })));
  });

  return userToken;
}
