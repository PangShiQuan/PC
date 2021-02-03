import {hash} from 'bcryptjs';

import fingerprint from 'helper/fingerprint';

export const getDeviceToken = new Promise(resolve => {
  if (window.requestIdleCallback) {
    requestIdleCallback(() => {
      fingerprint(resolve);
    });
  } else {
    setTimeout(() => {
      fingerprint(resolve);
    }, 100);
  }
});

export function generateVarifyCode(fact) {
  return new Promise((resolve, reject) => {
    hash(fact, 6, (hashErr, result) => {
      if (result) {
        const varifyCode = result.substring(15, 21);
        resolve(varifyCode);
      } else reject(hashErr);
    });
  });
}

export function generateBrowserId() {
  return getDeviceToken.then(generateVarifyCode);
}
