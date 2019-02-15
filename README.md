# User Token

[![Build](https://img.shields.io/travis/TankerHQ/user-token-js.svg?branch=master)](https://travis-ci.org/TankerHQ/user-token-js)

User token generation in JavaScript for the [Tanker SDK](https://tanker.io/docs/latest).

## Installation

The preferred way of using the component is via NPM:

```bash
npm install --save @tanker/user-token
```

## Usage

The server-side code below demonstrates a typical flow to safely deliver user tokens to your users:

```javascript
import { generateUserToken }  from '@tanker/user-token';

// Store these configurations in a safe place
const trustchainId = '<trustchain-id>';
const trustchainPrivateKey = '<trustchain-private-key>';

// Example server-side function in which you would implement checkAuth(),
// retrieveUserToken() and storeUserToken() to use your own authentication
// and data storage mechanisms:
function getUserToken(userId) {
  const isAuthenticated = checkAuth(userId);

  // Always ensure userId is authenticated before returning a user token
  if (!isAuthenticated) {
    throw new Error('unauthorized');
  }

  // Retrieve a previously stored user token for this user
  let token = retrieveUserToken(userId);

  // If not found, create a new user token
  if (!token) {
    token = generateUserToken(trustchainId, trustchainPrivateKey, userId);

    // Store the newly generated user token
    storeUserToken(userId);
  }

  // From now, the same user token will always be returned to a given user
  return token;
}
```

Read more about user tokens in the [Tanker guide](https://tanker.io/docs/latest/guide/server/).

## Development

Install yarn globally with `npm install -g yarn`.

After checking out the repo, run `yarn` to install the dependencies.

Build the package with `yarn build`.

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/TankerHQ/user-token-js.

[build-badge]: https://travis-ci.org/TankerHQ/user-token-js.svg?branch=master
[build]: https://travis-ci.org/TankerHQ/user-token-js
