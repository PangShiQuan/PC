import _ from 'lodash';
import React from 'react';
import {Collapse} from 'antd';
import classnames from 'classnames';
import cssB from 'styles/User/Dsf/ProfileIndex1.less';
import css from 'styles/User/TradingCenter/BettingRecords.less';
import {filter, renderValue, renderDate} from 'services/gameReport/general';

const {Panel} = Collapse;

const isSettled = input => {
  return input === '有结果';
};

const BetRecordReport = {
  gameReportMain: ({renderWinLoss, sortedInfo, renderOrderSearch}) => {
    const columns = [];
    columns.push({
      title: renderOrderSearch,
      dataIndex: 'transactionId',
      key: 'transactionId',
      className: classnames(cssB.orderRecord_columnMediumLong),
    });
    columns.push({
      title: '赛事',
      dataIndex: 'sportGameDescription',
      key: 'sportGameDescription',
      className: classnames(cssB.orderRecord_sportGameDescription),
      render: ({wtype, parlaysub}) => {
        let output = null;
        if (parlaysub) {
          output = _.map(parlaysub, (item, index) => {
            let translatedGType;
            switch (item.gtype) {
              case 'FT':
                translatedGType = '足球';
                break;
              case 'BK':
                translatedGType = '篮球/美足';
                break;
              case 'TN':
                translatedGType = '网球';
                break;
              case 'BS':
                translatedGType = '棒球';
                break;
              default:
                translatedGType = '其他';
                break;
            }

            const itemSport = (
              <>
                <div>
                  <b className={cssB.orderRecord_status} data-color="red">
                    {translatedGType}
                  </b>
                </div>
                <div>{item.league}</div>
              </>
            );
            const itemWType = (
              <div className={cssB.orderRecord_status} data-color="green">
                {item.wtype} {parlaysub && parlaysub.length > 1 && item.ioratio}{' '}
                {item.resultScore && `[${item.resultScore}]`}
              </div>
            );
            const itemBetType = <div>{item.handicap}</div>;
            const itemOrder = (
              <div>
                <b>{item.order}</b>
              </div>
            );
            const itemTeams = (
              <div>
                {item.tnameHome} VS {item.tnameAway}
              </div>
            );
            const itemDateTime = (
              <div>
                {renderDate(`${item.orderdate} ${item.ordertime}`, false)}
              </div>
            );

            return (
              <div key={index}>
                {itemSport}
                {itemWType}
                {itemBetType}
                {itemOrder}
                {itemTeams}
                {itemDateTime}
              </div>
            );
          });
        }

        return (
          <div className={css.gameColumn}>
            {parlaysub && parlaysub.length > 1 ? (
              <Collapse bordered={false} className={css.orderReport_collapse}>
                <Panel header={wtype}>{output}</Panel>
              </Collapse>
            ) : (
              <div>{output}</div>
            )}
          </div>
        );
      },
    });
    columns.push({
      title: '投注赔率',
      dataIndex: 'wagerOdds',
      key: 'wagerOdds',
      className: cssB.orderRecord_columnAmount,
      render: ({parlaysub, oddsType, wagerOdds}) => (
        <div>
          <div>
            <b>{parlaysub && parlaysub.length === 1 && wagerOdds}</b>
          </div>
          <div>{oddsType}</div>
        </div>
      ),
    });
    columns.push({
      title: '投注金额 ',
      dataIndex: 'wagerStake',
      key: 'wagerStake',
      className: cssB.orderRecord_columnAmount,
      render: data => renderValue(Number(data)),
      sorter: (a, b) => a.wagerStake - b.wagerStake,
      sortOrder: sortedInfo.columnKey === 'wagerStake' && sortedInfo.order,
    });
    columns.push({
      title: '状态',
      dataIndex: 'bettingStatus',
      key: 'bettingStatus',
      className: classnames(cssB.orderRecord_medium),
    });
    columns.push({
      title: '盈亏',
      dataIndex: 'playerWinLoss',
      key: 'playerWinLoss',
      className: cssB.orderRecord_columnAmount,
      render: ({vgold, settle, result}) =>
        renderWinLoss({
          settled: isSettled(settle),
          winLoss: result === '输' ? Number(vgold) * -1 : Number(vgold),
          isSports: true,
        }),
    });
    return columns;
  },
  gameReportMainData: ({displayList, selectedGamePlatform}) => {
    const data = [];
    _.map(displayList.betLogs, (betLog, index) => {
      const {
        adddate,
        agid,
        agname,
        currency,
        gold,
        goldd,
        gtype,
        handicap,
        ioratio,
        ip,
        league,
        mid,
        odds,
        oddsFormat,
        order,
        orderdate,
        ordertime,
        pname,
        result,
        resultScore,
        resultdetail,
        score,
        settle,
        strong,
        tnameAway,
        tnameHome,
        transactionId,
        username,
        vgold,
        wingoldd,
        wtype,
        wtypeCode,
        parlaysub,
      } = betLog;
      data.push({
        key: index,
        indexValue: index + 1,
        transactionId,
        sportGameDescription: {
          wtype,
          parlaysub,
        },
        bettingStatus: result,
        wagerOdds: {oddsType: odds, wagerOdds: ioratio, parlaysub},
        wagerStake: gold,
        playerWinLoss: {vgold, settle, result},
      });
    });
    return _.orderBy(data, ['transactionId'], ['desc']);
  },
  tableDimension: () => ({width: 900, height: 450}),
  gameReportStatusFilterRules: ({
    display,
    selectedGamePlatform,
    filteredStatus,
  }) => {
    return _.filter(
      display[selectedGamePlatform].betLogs,
      ({vgold, settle, result}) =>
        filter.byWinLoss(
          {
            winLoss: result === '输' ? Number(vgold) * -1 : Number(vgold),
            settled: isSettled(settle),
          },
          filteredStatus,
        ),
    );
  },
};

export default BetRecordReport;
