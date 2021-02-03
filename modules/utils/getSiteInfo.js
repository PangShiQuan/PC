import {withAdminId} from './getAdminBrand';
import request from './request';
import * as API from './API';

const siteInfo = request(withAdminId(API.CONTENTS), {method: 'GET'})
  .then(
    ({data}) =>
      data || {generalContents: [], pcOtherInfo: {}, otherSettings: {}},
  )
  .catch(err => {
    throw new Error(err.message);
  });

export default siteInfo;
