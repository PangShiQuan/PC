function escapeRegExp(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

export default function replaceAll(str, mapObj, flag = '$') {
  if (!mapObj) return str;
  const replacement = {};
  const pattern = Object.entries(mapObj).map(([key, value]) => {
    const re = `${flag}${key}`;
    replacement[re] = value;
    return escapeRegExp(re);
  });
  const re = new RegExp(pattern.join('|'), 'gi');

  return str.replace(re, matched => replacement[matched]);
}
