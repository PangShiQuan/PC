function postProcessResult(resultData, empty = '', initial = 1) {
  const result = [];

  resultData.reduce((sum, value) => {
    result.push(value === empty ? sum : value);
    return value === empty ? sum + 1 : 1;
  }, initial);

  return result;
}

// apply mapped calculation function on every data row
export default function processResult(
  {openCodes, resultData},
  resultFn,
  post = false, // direct apply calculation function on the computed result (as a whole) of current function
) {
  const output = openCodes.map((code, index) =>
    resultFn(code, resultData[index]),
  );

  return post ? postProcessResult(output) : output;
}
