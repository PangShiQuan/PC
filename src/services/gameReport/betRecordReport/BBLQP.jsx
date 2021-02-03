import React from 'react';
import _ from 'lodash';
import {filter, renderDate} from 'services/gameReport/general';

const BetRecordReport = {
  gameReportMain: ({
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
      title: '牌局名称',
      dataIndex: 'gameName',
      key: 'gameName',
      render: data => <b>{data}</b>,
    });
    columns.push({
      title: '房间',
      dataIndex: 'roomName',
      key: 'roomName',
    });
    columns.push({
      title: '下注金额',
      dataIndex: 'inputAmount',
      key: 'inputAmount',
      render: renderValue,
    });
    columns.push({
      title: '有效投注',
      dataIndex: 'codeAmount',
      key: 'codeAmount',
      render: renderValue,
    });
    columns.push({
      title: '玩家输赢',
      dataIndex: 'playerWinLoss',
      key: 'playerWinLoss',
      render: renderWinLoss,
      sorter: (a, b) => a.playerWinLoss.winLoss - b.playerWinLoss.winLoss,
      sortOrder: sortedInfo.columnKey === 'playerWinLoss' && sortedInfo.order,
    });
    columns.push({
      title: '结束时间',
      dataIndex: 'overTime',
      key: 'overTime',
      render: data => renderDate(data),
    });

    return columns;
  },
  gameReportMainData: ({displayList, selectedGamePlatform}) => {
    const data = [];
    _.map(displayList.betLogs, (betLog, index) => {
      const {
        brand,
        categoryName,
        codeAmount,
        gameId,
        gameName,
        gameStyle,
        id,
        inputAmount,
        merchantId,
        orderId,
        outputAmount,
        overTime,
        playerId,
        rebates,
        roomId,
        roomName,
        startTime,
        username,
        winAmount,
        winLoseAmount,
      } = betLog;
      data.push({
        key: index,
        orderId,
        gameName,
        codeAmount,
        inputAmount,
        roomName,
        overTime,
        playerWinLoss: {winLoss: winLoseAmount},
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
