import React from 'react';
import {type as TYPE, formatCurrency} from 'utils';
import css from './styles.less';
import renderValue from './renderValue';

function renderValueColor(data) {
  const amount = data || 0;
  const amountColor = amount < 0 ? 'red' : 'green';
  return (
    <span className={css.reportValue} data-negative={amountColor}>
      {renderValue(amount)}
    </span>
  );
}

export default renderValueColor;
