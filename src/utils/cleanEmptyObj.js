import _ from 'lodash';

export function cleanEmptyObj(obj) {
  const newObj = {...obj};
  const propNames = Object.getOwnPropertyNames(newObj);
  for (let i = 0; i < propNames.length; i++) {
    const propName = propNames[i];
    if (_.isEmpty(newObj[propName])) {
      delete newObj[propName];
    }
  }
  return newObj;
}
