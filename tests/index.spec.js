// @flow
import { expect } from 'chai';
import { generichash, tcrypto, utils } from '@tanker/crypto';
import { generateUserToken } from '../src';

describe('user token generation', () => {
  it('returns a valid token signed with the trustchain private key', () => {
    const trustchain = {
      id: 'AzES0aJwDCej9bQVY9AUMZBCLdX0msEc/TJ4DOhZaQs=',
      pk: 'dOeLBpHz2IF37UQkS36sXomqEcEAjSyCsXZ7irn9UQA=',
      sk: 'cBAq6A00rRNVTHicxNHdDFuq6LNUo6gAz58oKqy9CGd054sGkfPYgXftRCRLfqxeiaoRwQCNLIKxdnuKuf1RAA=='
    }

    const user_id = 'brendan.eich@tanker.io'

    const b64_token = generateUserToken(trustchain.id, trustchain.sk, user_id)
    const token = utils.fromB64Json(b64_token)

    // check valid control byte in user secret
    const hashed_user_id = utils.fromBase64(token.user_id)
    const user_secret = utils.fromBase64(token.user_secret)
    expect(hashed_user_id).to.have.lengthOf(32);
    expect(user_secret).to.have.lengthOf(32);
    const something = utils.concatArrays(user_secret.slice(0, user_secret.length - 1), hashed_user_id);
    const control = generichash(something, 16);
    expect(user_secret[user_secret.length - 1]).to.equal(control[0])

    // verify signature
    const signed_data = utils.concatArrays(
      utils.fromBase64(token.ephemeral_public_signature_key),
      utils.fromBase64(token.user_id)
    );

    expect(tcrypto.verifySignature(
      signed_data,
      utils.fromBase64(token.delegation_signature),
      utils.fromBase64(trustchain.pk)
    )).to.equal(true);
  });
});
