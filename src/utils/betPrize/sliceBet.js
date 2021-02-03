import BetStringID from '../betPlan/betString.config';

export default function sliceBetString(betString) {
  if (Array.isArray(betString)) {
    return Array.from(new Set(betString));
  } else {
    const betSet = betString.split(BetStringID.ROW);
    const betNums = betSet.map(set => set.split(BetStringID.COL));
    const betSlice = betNums.reduce((all, betNum) => all.concat(betNum), []);
    return Array.from(new Set(betSlice));
  }
}
