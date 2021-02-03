export function byWinLoss({winLoss, settled}, filteredStatus) {
  switch (filteredStatus) {
    case 'WIN':
      return winLoss > 0 && settled;
    case 'LOSS':
      return winLoss < 0 && settled;
    case 'PENDING':
      return !settled;
    case 'DRAW':
      return winLoss === 0 && settled;
    default:
      return true;
  }
}
