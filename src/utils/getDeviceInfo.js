import UAParser from 'ua-parser-js';

export function getDeviceInfo() {
  var parser = new UAParser();
  const browserInfo = parser.getResult();
  let requestData;
  if (browserInfo) {
    const browser = browserInfo.browser.name;
    const osName = browserInfo.os.name;
    requestData = {
      appVersion: "2.7.10",
      browser: browser,
      deviceModel: "PC",
      resourceEnum: "PC",
      sysVersion: osName
    };
  }

  return requestData;
}