import React from 'react';
import _ from 'lodash';
import {filter, renderStatus} from 'services/gameReport/general';
import {gamePlatformType} from 'utils/type.config';

const BetRecordReport = {
  gameReportMain: ({
    renderWinLoss,
    renderOrderSearch,
    sortedInfo,
    renderValue,
    renderDate,
  }) => {
    const columns = [];
    columns.push({
      title: renderOrderSearch,
      dataIndex: 'id',
      key: 'id',
    });
    columns.push({
      title: '投注时间 (GMT+8)',
      dataIndex: 'gameEndTime',
      key: 'gameEndTime',
      render: data => renderDate(data),
    });
    columns.push({
      title: '游戏种类',
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
    columns.push({
      title: '有效投注金额',
      dataIndex: 'totalBet',
      key: 'totalBet',
      render: renderValue,
      sorter: (a, b) => a.totalBet - b.totalBet,
      sortOrder: sortedInfo.columnKey === 'totalBet' && sortedInfo.order,
    });
    columns.push({
      title: '派彩金额',
      dataIndex: 'totalPayout',
      key: 'totalPayout',
      render: renderValue,
      sorter: (a, b) => a.totalPayout - b.totalPayout,
      sortOrder: sortedInfo.columnKey === 'totalPayout' && sortedInfo.order,
    });
    columns.push({
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: data =>
        renderStatus({...data, selectedGamePlatform: gamePlatformType.MG}),
    });

    columns.push({
      title: '盈亏',
      dataIndex: 'playerWinLoss',
      key: 'playerWinLoss',
      render: renderWinLoss,
      sorter: (a, b) => a.playerWinLoss.winLoss - b.playerWinLoss.winLoss,
      sortOrder: sortedInfo.columnKey === 'playerWinLoss' && sortedInfo.order,
    });

    return columns;
  },
  gameReportMainData: ({displayList}) => {
    const data = [];
    _.map(displayList.betLogs, (betLog, index) => {
      const {
        categoryName,
        gameName,
        gameStartTime,
        rowId,
        totalWager,
        totalPayout,
        gameEndTime,
        playerWinLoss,
        showStateName,
      } = betLog;
      data.push({
        key: index,
        id: rowId,
        categoryName,
        gameName,
        gameStartTime,
        totalBet: totalWager,
        totalPayout,
        gameEndTime,
        status: {winLoss: playerWinLoss, showStateName},
        playerWinLoss: {winLoss: playerWinLoss},
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
