// @flow

import { generichash, tcrypto, utils, createUserSecretB64, type b64string } from '@tanker/crypto';

// trustchainID = base64 encoded trustchain ID
// trustchainPrivateKey = base64 encoded trustchain private key
// userIdString = userID, as text string
export function generateUserToken(trustchainId: b64string, trustchainPrivateKey: b64string, userId: string) {
  const userIdBuffer = utils.concatArrays(utils.fromString(userId), utils.fromBase64(trustchainId));

  try {
    const obfuscatedUserId = generichash(userIdBuffer);

    const ephemeralKeyPair = tcrypto.makeSignKeyPair();
    const toSign = utils.concatArrays(ephemeralKeyPair.publicKey, obfuscatedUserId);

    try {
      const delegationSignature = tcrypto.sign(toSign, utils.fromBase64(trustchainPrivateKey));


      return utils.toBase64(utils.fromString(JSON.stringify({
        ephemeral_public_signature_key: utils.toBase64(ephemeralKeyPair.publicKey),
        ephemeral_private_signature_key: utils.toBase64(ephemeralKeyPair.privateKey),
        user_id: utils.toBase64(obfuscatedUserId),
        delegation_signature: utils.toBase64(delegationSignature),
        user_secret: createUserSecretB64(trustchainId, userId)
      })));
    } catch (err) {
      console.error(`cannot sign: ${err}`);
    }
  } catch (err) {
    console.error(`cannot hash: ${err}`);
  }
}
