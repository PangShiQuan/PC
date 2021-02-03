import uuidV4 from 'uuid/v4';
import md5 from 'blueimp-md5';

export default function encryptGeetest(deviceToken) {
  const appencryObjData = JSON.parse(localStorage.getItem('appEncryptionData'));
  let ts;
  // eslint-disable-next-line
  let encryHeaderData = {},
    siddata,
    secata;
  const {sec = {}, tsDifference, s, sid} = appencryObjData;
  if (tsDifference) {
    ts = tsDifference + +new Date();
  } else {
    ts = +new Date();
  }
  encryHeaderData.s = s;
  encryHeaderData.ts = ts;
  encryHeaderData.rid = uuidV4();
  // eslint-disable-next-line
  secata = sec;
  // eslint-disable-next-line
  siddata = sid;
  encryHeaderData.device_token = deviceToken;
  const sign = `device_token=${encryHeaderData.device_token}rid=${
    encryHeaderData.rid
  }s=${encryHeaderData.s}ts=${ts}${siddata}${secata}`;
  encryHeaderData.sign = md5(sign);

  return encryHeaderData;
}