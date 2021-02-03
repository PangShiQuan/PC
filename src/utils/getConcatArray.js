export function getConcatArray(str) {
  if (str) {
    const stringLength = str.length;
    let dividedLength = stringLength / 4;
    dividedLength = Math.round(dividedLength);
    const firstPartSubstring = str.substring(0, dividedLength);
    const lastPartSubstring = str.substring(stringLength - dividedLength, stringLength);
    return [firstPartSubstring, lastPartSubstring];
  }
}
