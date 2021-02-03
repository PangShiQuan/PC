import {hash, genSalt} from 'bcryptjs';
import RSAKey from 'react-native-rsa';

function getSecretFromUserNamePassword({username, password, doubleHash}) {
  return (
    username.substring(0, 3) +
    password.substring(0, 3) +
    username.substring(username.length - 2, username.length) +
    password.substring(password.length - 2, password.length) +
    username.length +
    password.length +
    doubleHash
  );
}
function logErr(err) {
  throw new Error(err);
}
function encrypt({username, password, doubleHash}, callBack) {
  const str = getSecretFromUserNamePassword({username, password, doubleHash});
  genSalt(6, (saltErr, salt) => {
    if (saltErr) {
      logErr(saltErr);
    }
    hash(str, salt, (hashErr, hashResult) => {
      if (hashErr) {
        logErr(hashErr);
      }
      return callBack(hashResult.substring(7));
    });
  });
}
export function awaitHash({username, password, doubleHash}) {
  return new Promise((resolve, reject) => {
    encrypt({username, password, doubleHash}, encResult => {
      if (encResult) {
        resolve(encResult);
      }
      reject('unable to get hash');
    });
  }).catch(err => {
    throw new Error(err);
  });
}
export function encodePassword(string) {
  const target = string;
  const rsa = new RSAKey();
  const publicKey =
    'eyJuIjoiODliYzJlZTliOWMzMDZhMGQ4MzVlZDZhN2I5MWJkM2Y1M2M0MjM1ZmQ1MTUyOTM5NWZmNWExYTI1NjI5NzI5NmI0MTdjYzNiMWM4ZTM3ZjFjYjZmMWNkNDE4NmM4NTQ1NGZmNzQ1YWJjYzRmZWVkODEzODM5ZTc3YjZjMWUyOTUwNDhkNTQxNThmMDVmMGRkOWUzOTJjMTk0OTM2NDExZGE1YjlhYzI4MTg0OTVjMzc1NTU1MTAyZGZiZTllYTMyOGEyN2Q5MGM2NWIzZjE2MTQzN2IzYTEzYTczNzE0Mzc0MjdlNzE1NWIxNzkzNWI2YTdjODNmMzQxNTk2OTQxNyIsImUiOiIxMDAwMSJ9';
  const key = window.atob(publicKey);
  rsa.setPublicString(key);
  const encryptedTarget = rsa.encrypt(target);
  const encodedTarget = window.btoa(encryptedTarget);
  return encodedTarget;
}
