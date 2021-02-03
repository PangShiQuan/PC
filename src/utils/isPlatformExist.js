import {isMatch} from 'lodash';
import {flattenPlatforms} from 'utils';

export function isPlatformGameExist({gamePlatforms = []}, matchee) {
  return flattenPlatforms(gamePlatforms).some(
    gamePlatform =>
      gamePlatform.status === 'ON' && isMatch(gamePlatform, matchee),
  );
}

export default function isPlatformExist(gamePlatformList = []) {
  // only bet exist by default if havent retrieve the platform list yet
  return Object.keys(gamePlatformList).length > 1;
}
