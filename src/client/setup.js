/* eslint-disable import/prefer-default-export, import/no-duplicates */
import {merge} from 'lodash';
import * as defaultConfig from 'defaultClientDir/config';
import * as config from 'currentClientDir/config';

// eslint-disable-next-line import/namespace
const {PATH_BINDING, HOMEPAGE_CONFIG} = defaultConfig;

const {
  assets,
  version,
  edition,
  CUSTOM_LIVECHAT_SCRIPT,
  CUSTOM_LIVECHAT_TRIGGER,
  BAIDU_ANALYSIS_SCRIPT,
  GET_CS_LIVECHAT_LINK,
  PATH_BINDING: currentPathBinding,
  HOMEPAGE_CONFIG: currentHomePageConfig,
} = config;

merge(PATH_BINDING, currentPathBinding);
merge(HOMEPAGE_CONFIG, currentHomePageConfig);

export {
  assets,
  version,
  edition,
  CUSTOM_LIVECHAT_SCRIPT,
  CUSTOM_LIVECHAT_TRIGGER,
  BAIDU_ANALYSIS_SCRIPT,
  GET_CS_LIVECHAT_LINK,
  PATH_BINDING,
  HOMEPAGE_CONFIG,
};
