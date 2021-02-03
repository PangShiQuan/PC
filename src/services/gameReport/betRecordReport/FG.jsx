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
      dataIndex: 'transactionId',
      key: 'transactionId',
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
    if (['FISH'].includes(platformType)) {
      columns.push({
        title: '子弹总价',
        dataIndex: 'bulletChips',
        key: 'bulletChips',
        render: renderValue,
      });

      columns.push({
        title: '总价值',
        dataIndex: 'fishDeadChips',
        key: 'fishDeadChips',
        render: renderValue,
      });

      columns.push({
        title: '盈利',
        dataIndex: 'winLoss',
        key: 'winLoss',
        render: ({bulletChips, fishDeadChips}) =>
          renderValue(fishDeadChips - bulletChips),
        sorter: (a, b) => a.totalBet - b.totalBet,
        sortOrder: sortedInfo.columnKey === 'totalBet' && sortedInfo.order,
      });

      columns.push({
        title: '开始时间 (GMT+8)',
        dataIndex: 'startTime',
        key: 'startTime',
        render: data => renderDate(data),
      });
      columns.push({
        title: '结束时间 (GMT+8)',
        dataIndex: 'endTime',
        key: 'endTime',
        render: data => renderDate(data),
      });
    } else {
      columns.push({
        title: '操作时间 (GMT+8)',
        dataIndex: 'time',
        key: 'time',
        render: data => renderDate(data),
      });

      columns.push({
        title: '总投注',
        dataIndex: 'allBets',
        key: 'allBets',
        render: renderValue,
      });

      columns.push({
        title: '中奖金额',
        dataIndex: 'allWins',
        key: 'allWins',
        render: renderValue,
      });

      columns.push({
        title: '输赢',
        dataIndex: 'result',
        key: 'result',
        render: renderValue,
      });
    }
    return columns;
  },
  gameReportMainData: ({displayList, platformType}) => {
    const data = [];
    _.map(displayList.betLogs, (betLog, index) => {
      const {transactionId, categoryName, gameName} = betLog;

      let additionalParam = {};
      const {
        bulletChips,
        fishDeadChips,
        startTime,
        endTime,
        time,
        allBets,
        allWins,
        result,
      } = betLog;

      additionalParam = {
        bulletChips,
        fishDeadChips,
        winLoss: {bulletChips, fishDeadChips},
        startTime,
        endTime,
        time,
        allBets,
        allWins,
        result,
      };

      data.push({
        key: index,
        transactionId,
        categoryName,
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
