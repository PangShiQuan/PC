import {form} from '../../calculation';

export function groupZeroOneTwo(values) {
  const group = new Map([[0, []], [1, []], [2, []]]);

  values.forEach(value => {
    const result = form.zeroOneTwo(value);
    const groupValues = group.get(result);
    group.set(result, groupValues.concat(value));
  });

  return group;
}
