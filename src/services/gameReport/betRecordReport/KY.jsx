import React from 'react';
import _ from 'lodash';
import {filter} from 'services/gameReport/general';

const BetRecordReport = {
  gameReportMain: ({
    renderWinLoss,
    renderOrderSearch,
    sortedInfo,
    renderDate,
    renderValue,
  }) => {
    const columns = [];
    columns.push({
      title: renderOrderSearch,
      dataIndex: 'gameId',
      key: 'gameId',
    });
    columns.push({
      title: '牌局名称',
      dataIndex: 'gameName',
      key: 'gameName',
      render: data => <b>{data}</b>,
    });
    columns.push({
      title: '房间',
      dataIndex: 'room',
      key: 'room',
    });
    columns.push({
      title: '投注额',
      dataIndex: 'totalBet',
      key: 'totalBet',
      render: renderValue,
    });
    columns.push({
      title: '盈亏',
      dataIndex: 'playerWinLoss',
      key: 'playerWinLoss',
      render: renderWinLoss,
      sorter: (a, b) => a.playerWinLoss.winLoss - b.playerWinLoss.winLoss,
      sortOrder: sortedInfo.columnKey === 'playerWinLoss' && sortedInfo.order,
    });
    columns.push({
      title: '结束时间 (GMT+8)',
      dataIndex: 'gameEndTime',
      key: 'gameEndTime',
      render: data => renderDate(data),
    });

    return columns;
  },
  gameReportMainData: ({displayList, selectedGamePlatform}) => {
    const data = [];
    _.map(displayList.betLogs, (betLog, index) => {
      const {
        gameId,
        categoryName,
        gameName,
        cardValue,
        allBet,
        profit,
        revenue,
        serverName,
        gameStartTime,
        gameEndTime,
      } = betLog;
      data.push({
        key: index,
        gameId,
        cardValue,
        categoryName,
        gameName,
        gameStartTime,
        totalBet: allBet,
        totalPayout: revenue,
        room: serverName,
        gameEndTime,
        status: {winLoss: profit},
        playerWinLoss: {winLoss: profit},
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
