import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import {filter, renderDate} from 'services/gameReport/general';
import cssB from 'styles/User/Dsf/ProfileIndex1.less';

const BetRecordReport = {
  gameReportMain: ({
    platformType,
    renderWinLoss,
    renderOrderSearch,
    sortedInfo,
    renderValue,
  }) => {
    const columns = [];
    columns.push({
      title: renderOrderSearch,
      dataIndex: 'orderId',
      key: 'orderId',
    });
    columns.push({
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      className: classnames(cssB.cashFlowList_mediumShort),
    });
    columns.push({
      title: '游戏名称',
      dataIndex: 'gameName',
      key: 'gameName',
      render: data => <b>{data}</b>,
      className: classnames(cssB.cashFlowList_mediumShort),
    });
    if (platformType === 'FISH') {
      columns.push({
        title: '投注',
        dataIndex: 'betAmount',
        key: 'betAmount',
        render: renderValue,
        className: classnames(cssB.orderRecord_medium),
      });
      columns.push({
        title: '有效投注',
        dataIndex: 'validAmount',
        key: 'validAmount',
        render: renderValue,
        className: classnames(cssB.orderRecord_medium),
      });
      columns.push({
        title: '结算金额',
        dataIndex: 'calcAmount',
        key: 'calcAmount',
        render: renderValue,
        className: classnames(cssB.orderRecord_medium),
      });
    } else {
      columns.push({
        title: '下注金额',
        dataIndex: 'bamount',
        key: 'bamount',
        render: renderValue,
        className: classnames(cssB.orderRecord_medium),
      });
    }

    columns.push({
      title: '输赢',
      dataIndex: 'payment',
      key: 'payment',
      render: renderWinLoss,
      className: classnames(cssB.orderRecord_medium),
      sorter: (a, b) => a.payment.winLoss - b.payment.winLoss,
      sortOrder: sortedInfo.columnKey === 'payment' && sortedInfo.order,
    });
    columns.push({
      title: '下注时间',
      dataIndex: 'orderTime',
      key: 'orderTime',
      render: data => renderDate(data),
      className: classnames(cssB.orderRecord_medium),
    });
    if (platformType === 'VGAME') {
      columns.push({
        title: '结算时间',
        dataIndex: 'lastUpdateTime',
        key: 'lastUpdateTime',
        render: data => renderDate(data),
        className: classnames(cssB.orderRecord_medium),
      });
    }

    return columns;
  },
  gameReportMainData: ({displayList, platformType}) => {
    const data = [];
    _.map(displayList.betLogs, (betLog, index) => {
      const {gameName, orderTime, playerName} = betLog;

      let additionalParam = {};
      if (platformType === 'FISH') {
        const {betId, payout, calcAmount, betAmount, validAmount} = betLog;
        additionalParam = {
          orderId: betId,
          calcAmount,
          betAmount,
          validAmount,
          payment: {winLoss: payout},
        };
      } else {
        const {orderId, bamount, payment, lastUpdateTime} = betLog;
        additionalParam = {
          orderId,
          bamount: Math.abs(bamount),
          payment: {winLoss: payment},
          lastUpdateTime,
        };
      }

      data.push({
        key: index,
        username: playerName,
        gameName,
        orderTime,
        ...additionalParam,
      });
    });

    return data;
  },
  tableDimension: () => ({width: 1350, height: 450}),
  gameReportStatusFilterRules: ({
    display,
    selectedGamePlatform,
    filteredStatus,
  }) =>
    _.filter(display[selectedGamePlatform].betLogs, ({payment}) =>
      filter.byWinLoss(
        {
          settled: true,
          winLoss: payment,
        },
        filteredStatus,
      ),
    ),
};

export default BetRecordReport;
