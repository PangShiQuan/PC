function getMachineTime() {
  return new Date().getTime() / 1000;
}

/**
 *
 * @param {number} time - current time return from server to be use to calculate
 * @return {Function} getCurrentServerTime - to calculate current server time
 */
function getServerTimeGap(serverTime = getMachineTime()) {
  let timeGap = getMachineTime();
  timeGap -= serverTime;

  return function getCurrentServerTime() {
    let currentServerTime = getMachineTime();
    currentServerTime -= timeGap;
    return Math.ceil(currentServerTime);
  };
}

export {getServerTimeGap};
