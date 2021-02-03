import queryString from 'query-string';

export function newWindow(params) {
  return window.open(
    params.shouldOpenNewTab
      ? params.url
      : `/f?q=${btoa(queryString.stringify(params))}`,
  );
}
