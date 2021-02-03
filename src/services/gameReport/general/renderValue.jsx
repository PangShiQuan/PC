import React from 'react';
import {formatCurrency} from 'utils';

function renderValue(data) {
  const amount = typeof data === 'object' ? 0 : data || 0;
  return <span>￥ {formatCurrency(amount)}</span>;
}

export default renderValue;
