import React from 'react';
import _ from 'lodash';
import {filter} from 'services/gameReport/general';

const BetRecordReport = {
  gameReportMain: ({
    platformType,
    renderOrderSearch,
    sortedInfo,
    renderValue,
    renderDate,
  }) => {
    const columns = [];
    columns.push({
      title: renderOrderSearch,
      dataIndex: 'billNo',
      key: 'billNo',
    });
    columns.push({
      title: '游戏类型',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: data => <b>{data}</b>,
    });
    columns.push({
      title: '游戏名称',
      dataIndex: 'gameName',
      key: 'gameName',
      render: data => <b>{data}</b>,
    });

    if (['BetHunter', 'Bet', 'BetSlots'].includes(platformType)) {
      columns.push({
        title: '输赢',
        dataIndex: 'netAmount',
        key: 'netAmount',
        render: renderValue,
      });
      columns.push({
        title: '总投注',
        dataIndex: 'betAmount',
        key: 'betAmount',
        render: renderValue,
      });
      columns.push({
        title: '有效投注',
        dataIndex: 'validBetAmount',
        key: 'validBetAmount',
        render: renderValue,
      });
      columns.push({
        title: '结束时间 (GMT+8)',
        dataIndex: 'time',
        key: 'time',
        render: data => renderDate(data),
      });
    } else {
      columns.push({
        title: '结束时间 (GMT+8)',
        dataIndex: 'time',
        key: 'time',
        render: data => renderDate(data),
      });
    }
    return columns;
  },
  gameReportMainData: ({displayList, platformType}) => {
    const data = [];
    _.map(displayList.betLogs, (betLog, index) => {
      const {billNo, gameName} = betLog;

      let additionalParam = {};
      if (['BetHunter', 'Bet', 'BetSlots'].includes(platformType)) {
        const {
          time,
          categoryName,
          netAmount,
          validBetAmount,
          betAmount,
        } = betLog;
        additionalParam = {
          time,
          netAmount,
          categoryName,
          platformType,
          betAmount,
          validBetAmount,
        };
      } else {
        const {time, categoryName, netAmount} = betLog;
        additionalParam = {
          time,
          netAmount,
          categoryName,
          platformType,
        };
      }

      data.push({
        key: index,
        billNo,
        gameName,
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
    _.filter(display[selectedGamePlatform].betLogs, ({playerWinLoss}) =>
      filter.byWinLoss(
        {
          settled: true,
          winLoss: playerWinLoss,
        },
        filteredStatus,
      ),
    ),
};

export default BetRecordReport;
