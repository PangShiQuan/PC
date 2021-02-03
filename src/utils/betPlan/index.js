import checkExtraBetEntries from './checkExtraBetEntries';
import checkBetDuration from './checkBetDuration';
import checkBetPlanData from './checkBetPlanData';

function getBetPlan(betEntries, betDuration, betPlanData, tabValue, methodGroup) {
  const getBetRules = checkExtraBetEntries(betEntries);
  const getBetDurationRules = checkBetDuration(betDuration);
  const getBetPlanRules = checkBetPlanData(betPlanData);
  if (getBetRules && (getBetPlanRules || true)) {
    if (!getBetDurationRules || methodGroup === '连码') {
      return false;
    }
    else
      return true;
  }
  else {
    if (tabValue === 'normal' || tabValue === 'doubled') {
      return true;
    }
    else
      return false;
  }
}

export default {getBetPlan};
