/**
 * @params {string} email - ematil to be format
 * @params {number} charToBeSeal -  number of char to beseal
 * @returns {string} formated email
 * */
export function sealEmailChar(email, numCharToBeSeal = 4) {
  const minimumCharToShow = 4;
  const sealChar = '****';
  let emailArray, firstPartChar;

  if (email) {
    // prevent empty string or underfine

    emailArray = email.split('@');
    if (emailArray.length && emailArray.length > 1) {
      // simple check if have @

      const [charToBeSeal] = emailArray;
      if (charToBeSeal.length >= numCharToBeSeal + minimumCharToShow) {
        // char infront @ more than total char infront

        firstPartChar = charToBeSeal.substring(0, minimumCharToShow);
        const secondPartChar = charToBeSeal.substring(
          numCharToBeSeal + minimumCharToShow,
          charToBeSeal.length,
        );

        return [
          firstPartChar,
          sealChar,
          secondPartChar,
          '@',
          emailArray[1],
        ].join('');
      }
      if (charToBeSeal.length < numCharToBeSeal + minimumCharToShow) {
        // else less than expected amount of char
        // directly append sealing character

        firstPartChar = charToBeSeal.substring(0, minimumCharToShow);

        return [firstPartChar, sealChar, '@', emailArray[1]].join('');
      }
    }
    return email;
  }
}
