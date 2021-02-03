export default function isGuestUser(data) {
  const {username} = data || {};

  return username && username.indexOf('guest') > -1;
}
