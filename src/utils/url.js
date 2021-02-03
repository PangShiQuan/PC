export function trimUrlTo(url) {
  window.history.replaceState('', '', url);
}

export function basePath(url) {
  return `/${url.split('/').filter(path => !!path)[0] || ''}`;
}
/** *
 * url :处理后端返回来的url
*/
export function checkUrl (url) {
  let reurl = url;
  const rep = /^https:/;
  const hostname = window.location.protocol;
  if (hostname === "https:" && !rep.test(url)) {
    reurl = url.replace(/^http:/, "https:");
  }
  return reurl;
}
