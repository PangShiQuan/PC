export function getPrizePercentage(prize) {
  let percentage = prize / 2000;
  percentage *= 100;
  percentage = percentage.toFixed(1);
  return percentage;
}
