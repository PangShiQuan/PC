import BetStringID from '../betPlan/betString.config';

export default function specialHandleLunpanBetString(
  thisBetString
) {
  const betSlice = thisBetString.split(' ');
    betSlice.forEach((item, index) => {
      if (
        item.split(BetStringID.LUNPANSEPARATOR).length == 1 &&
        !isNaN(Number(item))
      ) {
        betSlice.splice(index, 1, '直接注');
      }
      if (item.split(BetStringID.LUNPANSEPARATOR).length == 4) {
        betSlice.splice(index, 1, '四分注');
      }
      if (item.split(BetStringID.LUNPANSEPARATOR).length == 6) {
        betSlice.splice(index, 1, '六分注');
      }
    });

    return betSlice;
}
