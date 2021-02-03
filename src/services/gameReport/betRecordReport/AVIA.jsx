import React from 'react';
import _ from 'lodash';
import css from 'styles/User/TradingCenter/BettingRecords.less';
import {Collapse} from 'antd';
import {filter} from 'services/gameReport/general';

const {Panel} = Collapse;

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
      dataIndex: 'orderId',
      key: 'orderId',
    });
    columns.push({
      title: '比赛详情',
      dataIndex: 'game',
      key: 'game',
      render: data => {
        let output = null;
        if (data.details) {
          output = _.map(data.details, (item, index) => {
            const {
              Category,
              League,
              Bet,
              Content,
              Odds,
              Result,
              Match,
              StartAt,
              EndAt,
            } = item;

            const itemCategory = (
              <>
                <div>
                  <b style={{color: 'red'}}>{Category}</b>
                </div>
                <div>{League}</div>
                <div>
                  <b>
                    {Bet} {Content} @ {Odds}
                  </b>
                  <b style={{color: 'green'}}>{Result && ` [${Result}]`}</b>
                </div>
                <div>{Match}</div>
                <div>开始时间：{renderDate(StartAt)}</div>
                <div>结束时间：{renderDate(EndAt)}</div>
                {index !== data.details.length - 1 && <hr />}
              </>
            );
            return <div key={index}>{itemCategory}</div>;
          });
        } else {
          const {
            category,
            content,
            league,
            bet,
            odds,
            result,
            match,
            startAt,
            endAt,
            code,
            type,
            rewardAt,
          } = data;
          if (type === 'Single') {
            output = (
              <>
                <div>
                  <b style={{color: 'red'}}>{category}</b>
                </div>
                <div>{league}</div>
                <div>
                  <b>
                    {bet} {content} @ {odds}
                  </b>
                  <b style={{color: 'green'}}>{result && ` [${result}]`}</b>
                </div>
                <div>{match}</div>
                <div>开始时间：{renderDate(startAt)}</div>
                <div>结束时间：{renderDate(endAt)}</div>
              </>
            );
          } else if (type === 'Smart') {
            output = (
              <>
                <div>
                  <b style={{color: 'red'}}>小游戏类型</b>
                </div>
                <div>
                  <b>{content}</b>
                  <b style={{color: 'green'}}>{result && ` [${result}]`}</b>
                </div>
                <div>{code}</div>
                <div>{renderDate(rewardAt)}</div>
              </>
            );
          }
        }

        return (
          <div className={css.gameColumn}>
            {data.details && data.details.length > 1 ? (
              <Collapse bordered={false} className={css.orderReport_collapse}>
                <Panel header="串关类型">{output}</Panel>
              </Collapse>
            ) : (
              <div>{output}</div>
            )}
          </div>
        );
      },
    });
    columns.push({
      title: '投注金额',
      dataIndex: 'betAmount',
      key: 'betAmount',
      render: renderValue,
    });
    columns.push({
      title: '状态',
      dataIndex: 'statusCn',
      key: 'statusCn',
      render: data => <b>{data}</b>,
    });
    columns.push({
      title: '盈亏',
      dataIndex: 'money',
      key: 'money',
      render: renderValue,
    });
    columns.push({
      title: '投注时间 (GMT+8)',
      dataIndex: 'createAt',
      key: 'createAt',
      render: data => renderDate(data),
    });
    return columns;
  },
  gameReportMainData: ({displayList, platformType}) => {
    const data = [];
    _.map(displayList.betLogs, (betLog, index) => {
      const {
        bet,
        betAmount,
        betId,
        betMoney,
        brand,
        cateId,
        category,
        code,
        content,
        createAt,
        details,
        endAt,
        ip,
        language,
        league,
        leagueId,
        match,
        matchId,
        money,
        odds,
        oddsType,
        orderId,
        platform,
        playerId,
        playerName,
        reSettlement,
        result,
        resultAt,
        rewardAt,
        startAt,
        status,
        statusCn,
        type,
        updateAt,
        username,
      } = betLog;
      const additionalParam = {
        createAt,
        game: {
          details,
          category,
          league,
          bet,
          content,
          odds,
          result,
          match,
          startAt,
          endAt,
          code,
          rewardAt,
          type,
        },
        statusCn,
        betAmount,
        money,
      };
      data.push({
        key: index,
        orderId,
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
