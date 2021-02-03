export default function findSearchText(target) {
  let searchArray = [];
  let text = '';
  const url = window.location.href;
  if (url.indexOf(`?${target}=`) > -1 || url.indexOf(`&${target}=`) > -1) {
    let seachString = url.split('?');
    seachString = seachString[1] || seachString[0];
    searchArray = seachString.split('&');
    if (searchArray.length) {
      searchArray.forEach(search => {
        const params = search.split("=");
        if (params[0] === target) {
          // eslint-disable-next-line
           text = params[1];
        }
        // const searchIndex = search.indexOf(target);
        // if (searchIndex > -1) {
        //   text = search.substring(target.length + 1, search.length);
        //   return text;
      });
    }
  }
  return text;
}
