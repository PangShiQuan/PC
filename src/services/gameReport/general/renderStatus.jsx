import React from 'react';
import {type as TYPE} from 'utils';
import css from './styles.less';

const {transactionStateRefsValue} = TYPE;

function renderStatus({
  settled = true,
  winLoss,
  selectedGamePlatform,
  showStateName,
  passInStatus = null,
}) {
  let statusColor = '';
  let transactionState = 'PENDING';
  if (settled) {
    if (winLoss > 0) {
      statusColor = 'green';
      transactionState = 'WIN';
    } else if (winLoss < 0) {
      statusColor = 'red';
      transactionState = 'LOSS';
    } else if (winLoss === 0) {
      transactionState = 'DRAW';
    }
  }

  if (passInStatus) {
    transactionState = passInStatus.toUpperCase();
  }

  return (
    <span className={css.reportStatus} data-color={statusColor}>
      {showStateName ||
        transactionStateRefsValue[selectedGamePlatform][transactionState]}
    </span>
  );
}

export default renderStatus;
