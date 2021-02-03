export const preflightRequest = href => {
  const init = {
    headers: {
      Accept: 'text/html',
    },
    method: 'HEAD',
    mode: 'cors',
  };
  const request = new Request(href, init);

  return fetch(request)
    .then(({ok}) => ok)
    .catch(() => false);
};
