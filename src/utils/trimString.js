function trimString(str, maxLength) {
  let trimmedString = '';
  if (str.length > maxLength) {
    trimmedString = str.substring(0, maxLength);
  } else {
    trimmedString = str;
  }
  return `${trimmedString}...`;
}

export {trimString};