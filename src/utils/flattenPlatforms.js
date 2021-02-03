import _ from 'lodash';

export default gamePlatformList => {
  if (gamePlatformList) {
    let platformList = [];
    gamePlatformList.forEach(element => {
      if (element.platforms) {
        platformList = [...platformList, ..._.flatten(element.platforms)];
      } else {
        platformList.push(element);
      }
    });
    return platformList;
  }
};
