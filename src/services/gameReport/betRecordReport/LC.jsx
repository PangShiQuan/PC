import React from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import {filter, renderDate} from 'services/gameReport/general';
import cssB from 'styles/User/Dsf/ProfileIndex1.less';

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
      dataIndex: 'gameId',
      key: 'gameId',
      className: classnames(cssB.orderRecord_medium),
    });
    columns.push({
      title: '牌局名称',
      dataIndex: 'gameName',
      key: 'gameName',
      className: classnames(cssB.orderRecord_medium),
      render: data => <b>{data}</b>,
    });
    columns.push({
      title: '房间',
      dataIndex: 'room',
      key: 'room',
      className: classnames(cssB.orderRecord_medium),
    });
    columns.push({
      title: '投注额',
      dataIndex: 'totalBet',
      key: 'totalBet',
      className: classnames(cssB.orderRecord_medium),
      render: renderValue,
    });
    columns.push({
      title: '盈亏',
      dataIndex: 'playerWinLoss',
      key: 'playerWinLoss',
      className: cssB.orderRecord_columnAmount,
      render: renderWinLoss,
      sorter: (a, b) => a.playerWinLoss.winLoss - b.playerWinLoss.winLoss,
      sortOrder: sortedInfo.columnKey === 'playerWinLoss' && sortedInfo.order,
    });
    columns.push({
      title: '结束时间 (GMT+8)',
      dataIndex: 'gameEndTime',
      key: 'gameEndTime',
      className: classnames(cssB.orderRecord_columnMediumLong),
      render: data => renderDate(data),
    });

    return columns;
  },
  gameReportMainData: ({displayList, selectedGamePlatform}) => {
    const data = [];
    _.map(displayList.betLogs, (betLog, index) => {
      const {
        brand,
        username,
        gameName,
        displayName,
        categoryId,
        categoryName,
        gameId,
        playerId,
        serverId,
        serverName,
        kindId,
        tableId,
        chairId,
        userCount,
        cardValue,
        cellScore,
        allBet,
        profit,
        revenue,
        gameStartTime,
        gameEndTime,
        channelId,
        lineCode,
        playerWinLoss,
      } = betLog;

      data.push({
        key: index,
        gameId,
        categoryName,
        gameName,
        totalBet: allBet,
        room: serverName,
        gameEndTime,
        status: {winLoss: profit},
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
