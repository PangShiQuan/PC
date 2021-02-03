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
      title: '注单号',
      dataIndex: 'gameNo',
      key: 'gameNo',
    });
    columns.push({
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    });
    columns.push({
      title: '游戏分类',
      dataIndex: 'categoryName',
      key: 'categoryName',
    });
    columns.push({
      title: '游戏名称',
      dataIndex: 'gameName',
      key: 'gameName',
    });
    columns.push({
      title: '房间名',
      dataIndex: 'className',
      key: 'className',
    });
    columns.push({
      title: '下注金额',
      dataIndex: 'totalScore',
      key: 'totalScore',
      render: renderValue,
    });
    columns.push({
      title: '输赢',
      dataIndex: 'playerWinLoss',
      key: 'playerWinLoss',
      render: renderWinLoss,
      sorter: (a, b) => a.playerWinLoss.winLoss - b.playerWinLoss.winLoss,
      sortOrder: sortedInfo.columnKey === 'playerWinLoss' && sortedInfo.order,
    });
    columns.push({
      title: '游戏开始时间（下注时间)',
      dataIndex: 'startTime',
      key: 'startTime',
      render: data => renderDate(data),
    });
    columns.push({
      title: '游戏结束时间（结算时间)',
      dataIndex: 'endTime',
      key: 'endTime',
      render: data => renderDate(data),
    });

    return columns;
  },

  gameReportMainData: ({displayList, selectedGamePlatform}) => {
    const data = [];
    _.map(displayList.betLogs, (betLog, index) => {
      const {
        id,
        brand,
        cardValue,
        categoryName,
        channelNo,
        className,
        classNo,
        deskNo,
        endTime,
        gameName,
        gameNo,
        playerFullName,
        playerId,
        playerNum,
        profitScore,
        seatNo,
        shareScore,
        siteCode,
        startTime,
        totalScore,
        typeId,
        username,
        validScore,
      } = betLog;

      data.push({
        key: index,
        gameNo,
        className,
        username,
        categoryName,
        gameName,
        totalScore,
        playerWinLoss: {winLoss: profitScore},
        startTime,
        endTime,
      });
    });

    return _.orderBy(data, ['gameNo'], ['desc']);
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
