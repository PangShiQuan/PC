
import request from './request';
import * as API from './API';
import encryptGeetest from './encryptGeetest';

export default function gtInfo(deviceToken) {
  const geeTest = encryptGeetest(deviceToken);
  const gtInfo = request(
    API.GETGT,
    {
      method: 'GET',
      headers: {
        ...geeTest,
      },
    }
    )
    .then(
      ({data}) =>
        data,
    )
    .catch(err => {
      throw new Error(err.message);
    });

    return gtInfo;
}
