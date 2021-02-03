export default function getHongbaoLink(accessToken, deviceToken) {
  const query = `?deviceToken=${deviceToken}&accessToken=${accessToken}`;
  return process.env.NODE_ENV === 'development'
    ? `http://localhost:5003/hongbao${query}`
    : `/hongbao${query}`;
}
