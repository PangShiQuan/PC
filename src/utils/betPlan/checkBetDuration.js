export default function checkBetDuration(betDuration) {
  if (betDuration.includes('天')) {
    return false;
  }
  else return true;
}