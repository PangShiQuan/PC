
import request from './request';
import uuidV4 from 'uuid/v4';

export  async function withInitEncry(url) {
  const appToken =  localStorage.getItem('appDeviceToken');
  const u = navigator.userAgent;
  let sbCode;
  if (u.indexOf('iPhone') > -1) {
    sbCode = 'IOS';
  } else if (u.indexOf('Android') > -1 ) {
    sbCode = 'ANDROID';
  } else {
    sbCode = 'PC';
  }
  const {data,err} = await request(url,{
    method: 'get',
    headers: {
      device_token: appToken,
      s: sbCode,
      rid: uuidV4(),
    },
  });
  if (err) throw new Error(`无法获取信息, ${err.message}`);
  if (data) {
    let {sec, ts} = data;
    eval(sec);
    const tsDifference = ts - +new Date();
    data.sec = window["_0x78550"]();
    data.tsDifference = tsDifference;
    data.s = sbCode;
    return JSON.stringify(data);
  };
}
