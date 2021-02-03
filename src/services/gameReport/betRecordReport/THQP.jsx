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
        id,
        username,
        playerId,
        transactionId,
        gameUserId,
        gameUsername,
        gameType,
        gameName,
        categoryName,
        roomType,
        roomLevel,
        endTime,
        startMoney,
        endMoney,
        bankMoney,
        winMoney,
        dealMoney,
        effectMoney,
        awardMoney,
        taxMoney,
        jackpot,
      } = betLog;

      data.push({
        key: index,
        gameId: transactionId,
        categoryName,
        gameName,
        totalBet: dealMoney,
        room: roomLevel,
        gameEndTime: endTime,
        status: {winLoss: effectMoney},
        playerWinLoss: {winLoss: winMoney},
      });
    });

    return _.orderBy(data, ['gameId'], ['desc']);
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
