import React from 'react';
import {Tooltip} from 'antd';
import _ from 'lodash';
import {type as TYPE} from 'utils';
import css from 'styles/User/UserCenter/OrderRecord.less';

const {specialBetType, levelBetType} = TYPE;
const BetRecordReport = {
  gameReportMain: ({
    selectedGamePlatform,
    renderBetDetail,
    renderShareButton,
    renderBetStatus,
    renderWinLoss,
    renderOrderSearch,
    sortedInfo,
    renderValue,
  }) => {
    const columns = [];
    columns.push({
      title: renderOrderSearch,
      dataIndex: 'betID',
      key: 'betID',
      render: ({gameIssueNo, tag, issueAmount}) => {
        if (tag) {
          const value = specialBetType[tag.substring(0, 3)];
          const valueParent = levelBetType[tag.substring(4, 10)];
          if (value) {
            return (
              <span className={css.orderRecord_specialBetTypeOuter}>
                <Tooltip placement="topLeft" title={value.desc}>
                  <div
                    className={css.orderRecord_specialBetType}
                    data-special={tag.substring(0, 3)}>
                    <span>{value.shortDesc}</span>
                  </div>
                </Tooltip>
                <Tooltip placement="topLeft" title={valueParent.desc}>
                  <div
                    className={css.orderRecord_specialBetType}
                    data-level={tag.substring(4, 10)}>
                    <span>{valueParent.shortDesc}</span>
                  </div>
                </Tooltip>
                {(issueAmount && `共${issueAmount}期`) || gameIssueNo}
              </span>
            );
          }
        }

        return (
          <span>{(issueAmount && `共${issueAmount}期`) || gameIssueNo}</span>
        );
      },
    });
    columns.push({
      title: '投注时间 (GMT+8)',
      dataIndex: 'betTime',
      key: 'betTime',
    });
    columns.push({
      title: '彩种',
      dataIndex: 'betType',
      key: 'betType',
      render: renderBetDetail,
    });
    columns.push({
      title: '注数',
      dataIndex: 'betTotalUnits',
      key: 'betTotalUnits',
    });
    columns.push({
      title: '返点',
      dataIndex: 'betRebate',
      key: 'betRebate',
      render: renderValue,
    });
    columns.push({
      title: '投注总额',
      dataIndex: 'betTotalAmount',
      key: 'betTotalAmount',
      render: renderValue,
      sorter: (a, b) => a.betTotalAmount - b.betTotalAmount,
      sortOrder: sortedInfo.columnKey === 'betTotalAmount' && sortedInfo.order,
    });
    columns.push({
      title: '开奖状态',
      dataIndex: 'betStatus',
      key: 'betStatus',
      render: renderBetStatus,
      onFilter: (value, record) =>
        record.betStatus.transactionState.indexOf(value) === 0,
    });

    columns.push({
      title: '中奖金额',
      dataIndex: 'playerWinLoss',
      key: 'playerWinLoss',
      render: renderWinLoss,
      sorter: (a, b) => a.playerWinLoss.winLoss - b.playerWinLoss.winLoss,
      sortOrder: sortedInfo.columnKey === 'playerWinLoss' && sortedInfo.order,
    });

    if (renderShareButton) {
      columns.push({
        title: '分享',
        className: css.orderRecord_short,
        render: renderShareButton,
      });
    }

    return columns;
  },
  gameReportMainData: ({displayList, selectedGamePlatform}) => {
    const data = [];
    _.map(displayList.betLogs, (betLog, index) => {
      const {
        transactionTimeuuid,
        gameNameInChinese,
        gameIssueNo,
        transactionAmount,
        rebate,
        winAmount,
        bettingTime,
        transactionState,
        totalUnits,
        tag,
        bonus,
        transactionStateName,
        issueAmount,
      } = betLog;
      data.push({
        issueAmount,
        key: index,
        betTime: bettingTime,
        betType: {
          gamePlatformName: gameNameInChinese,
          betLogKey: index,
          transactionTimeuuid,
        },
        betID: {gameIssueNo, tag, issueAmount},
        betTotalUnits: totalUnits,
        betRebate: rebate,
        betTotalAmount: transactionAmount,
        betStatus: {transactionStateName, transactionState},
        playerWinLoss: {winLoss: winAmount},
        totalBonus: bonus,
      });
    });
    return data;
  },
  tableDimension: () => ({width: 1350, height: 450}),
  gameReportStatusFilterRules: ({
    display,
    transactionState,
    selectedGamePlatform,
    amount,
    settled,
    filteredStatus,
  }) => {
    let selectedDisplayList = display[selectedGamePlatform];

    const filteredStatusKey = filteredStatus;

    selectedDisplayList = _.filter(
      selectedDisplayList.betLogs,
      list => list.transactionState === filteredStatusKey,
    );

    return _.cloneDeep(selectedDisplayList);
  },
};

export default BetRecordReport;
