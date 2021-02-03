import {withAdminId} from 'moduleUtils/getAdminBrand';
import request from 'moduleUtils/request';
import * as API from '../utils/API';

export async function fetchSiteInfo() {
  const {data = {}} = await request(withAdminId(API.CONTENTS), {method: 'GET'});
  const {pcOtherInfo: {onlineServiceUrl = '', siteName = ''} = {}} = data;
  return {onlineServiceUrl, siteName};
}

export async function fetchHBCurrent(deviceToken) {
  const data = await request(withAdminId(API.HB_CURRENT), {
    method: 'GET',
    headers: {
      device_token: deviceToken,
    },
  });
  return data;
}

export function fetchHBQuota(accessToken, deviceToken) {
  return request(API.HB_QUOTA, {
    method: 'GET',
    headers: {
      authorization: `bearer ${accessToken}`,
      device_token: deviceToken,
    },
  });
}

export function fetchHBRank(accessToken, deviceToken) {
  return request(API.HB_RANK, {
    method: 'GET',
    headers: {
      authorization: `bearer ${accessToken}`,
      device_token: deviceToken,
    },
  });
}

export function fetchHBDetails(accessToken, deviceToken, selection) {
  const defaultSelection = {
    moneyOperationSubTypes: ['BON_THB', 'BON_FHB'],
    moneyOperationTypes: ['BONUS'],
    pageSize: 5,
    start: 0,
  };
  let body = {...defaultSelection};
  if (selection) {
    body = {
      ...defaultSelection,
      ...selection,
    };
  }
  body = JSON.stringify(body);
  return request(API.HB_DETAILS, {
    method: 'POST',
    headers: {
      authorization: `bearer ${accessToken}`,
      'Content-Type': 'application/json',
      device_token: deviceToken,
    },
    body,
  });
}

export function fetchHBDraw(accessToken, deviceToken, hongbaoType) {
  const body = JSON.stringify({hongbaoType});
  return request(API.HB_DRAW, {
    method: 'POST',
    headers: {
      authorization: `bearer ${accessToken}`,
      'Content-Type': 'application/json',
      device_token: deviceToken,
    },
    body,
  });
}
