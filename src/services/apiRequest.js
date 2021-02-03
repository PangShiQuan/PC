import {request, API} from 'utils';

export function getValidatePic({webUniqueCode, deviceToken}) {
  return fetch(
    `${window.location.origin}${
      API.getValidatePic
    }?webUniqueCode=${webUniqueCode}`,
    {
      method: 'get',
      headers: {
        'content-type': 'application/json',
        Accept: 'image/*, image/png, image/jpeg',
        deviceToken,
      },
    },
  ).then(response => {
    if (response && response.status === 200) {
      return response.blob();
    }
    throw new Error('无法获取验证码');
  });
}

export function getUserListDownloadURL({agentId, accessToken, deviceToken}) {
  return fetch(
    `${API.userListExport}?pageSize=20000&orderByLoginTime=true${
      agentId ? `&agentId=${agentId}` : ''
    }&access_token=${accessToken}`,
    {
      method: 'get',
      headers: {
        'content-type': 'application/json',
        accept: '*/*',
        deviceToken,
      },
    },
  )
    .then(res => {
      if (res && res.status >= 200 && res.status < 400) {
        return res.blob();
      }
      throw new Error('无法获取验证码');
    })
    .then(blob => ({data: URL.createObjectURL(blob)}))
    .catch(err => ({err: err.message}));
}

export function to(
  {method, url, headers, body, shouldStringify = true},
  params,
) {
  return request(
    url,
    {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: shouldStringify ? JSON.stringify(body) : body,
    },
    params,
  );
}

export function getHomeInfos({adminBrand: {adminId}, deviceToken}) {
  return request(
    API.homeInfo,
    {
      method: 'get',
      headers: {device_token: deviceToken},
    },
    {adminId},
  );
}
