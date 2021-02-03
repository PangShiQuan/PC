import _ from 'lodash';
import React from 'react';
import {Collapse} from 'antd';
import classnames from 'classnames';
import cssB from 'styles/User/Dsf/ProfileIndex1.less';
import {
  filter,
  renderStatus,
  renderValue,
  renderDate,
} from 'services/gameReport/general';
import {gamePlatformType} from 'utils/type.config';

const {Panel} = Collapse;

const BetRecordReport = {
  gameReportMain: ({renderWinLoss, sortedInfo, renderOrderSearch}) => {
    const columns = [];
    columns.push({
      title: renderOrderSearch,
      dataIndex: 'id',
      key: 'id',
      className: classnames(cssB.orderRecord_columnMediumLong),
      render: ({betDate, wagerId}) => (
        <div>
          <div>
            <b>Ref No.: {wagerId}</b>
          </div>
          <div>{renderDate(betDate)}</div>
        </div>
      ),
    });
    columns.push({
      title: '赛事',
      dataIndex: 'sportGameDescription',
      key: 'sportGameDescription',
      className: classnames(cssB.orderRecord_sportGameDescription),
      render: ({items}) => {
        const rowRender = _.map(items, (itemInd, index) => {
          const {
            betTypeCaption,
            playTypeCaption,
            cancelReasonCaption,
            handicapValue,
            leagueName,
            matchDate,
            teamAName,
            teamBName,
            teamBetCaption,
            score,
            sport,
            wagerId,
          } = itemInd;

          const bet = (
            <div>
              <b>
                <span className={cssB.orderRecord_status} data-color="red">
                  {teamBetCaption}
                  {` - ${handicapValue}`}
                </span>
              </b>
            </div>
          );
          const settledScore = score ? (
            <div>
              <b>
                <span className={cssB.orderRecord_status} data-color="green">
                  {`${playTypeCaption}(${score})`}
                </span>
              </b>
            </div>
          ) : null;
          const matchDt = <div>{renderDate(matchDate, false)}</div>;

          if (items.length > 1) {
            return (
              <React.Fragment key={`${wagerId}_fragment`}>
                {matchDt}
                <div>
                  <b>{betTypeCaption}</b>
                </div>
                <div>
                  <b>
                    <u>{leagueName}</u>
                  </b>
                </div>
                <div>
                  {teamAName} VS {teamBName}
                </div>
                {settledScore}
                {bet}
                {items.length > 1 && items.length - 1 !== index ? <hr /> : ''}
              </React.Fragment>
            );
          }

          return (
            <React.Fragment key={`${wagerId}_fragment`}>
              {bet}
              <div>
                <b>{betTypeCaption}</b>
              </div>
              <div>
                <b>
                  {teamAName !== teamBetCaption ? teamAName : ''}
                  {teamBName === '-' ? '' : '-VS-'}
                  {teamBName === '-' ? '' : teamBName}
                </b>
                <span className={cssB.orderRecord_status} data-color="red">
                  {cancelReasonCaption !== '-' ? '(比赛取消)' : ''}
                </span>
              </div>
              {settledScore}
              <div>
                <b>{sport}</b> {leagueName}
              </div>
              {matchDt}
              {items.length > 1 && items.length - 1 !== index ? <hr /> : null}
            </React.Fragment>
          );
        });

        if (items.length > 1) {
          return (
            <Collapse defaultActiveKey={['1']}>
              <Panel header={`混合过关 ${items.length}x1`}>{rowRender}</Panel>
            </Collapse>
          );
        }

        return <React.Fragment>{rowRender}</React.Fragment>;
      },
    });
    columns.push({
      title: '投注赔率',
      dataIndex: 'wagerOdds',
      key: 'wagerOdds',
      className: cssB.orderRecord_columnAmount,
      render: ({oddsType, wagerOdds}) => (
        <div>
          <div>
            <b>{wagerOdds}</b>
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
      render: renderValue,
      sorter: (a, b) => a.wagerStake - b.wagerStake,
      sortOrder: sortedInfo.columnKey === 'wagerStake' && sortedInfo.order,
    });
    columns.push({
      title: '状态',
      dataIndex: 'result',
      key: 'result',
      className: classnames(cssB.orderRecord_medium),
      render: data =>
        renderStatus({...data, selectedGamePlatform: gamePlatformType.SSSPORT}),
    });
    columns.push({
      title: '盈亏',
      dataIndex: 'playerWinLoss',
      key: 'playerWinLoss',
      className: cssB.orderRecord_columnAmount,
      render: renderWinLoss,
    });
    return columns;
  },
  gameReportMainData: ({displayList, selectedGamePlatform}) => {
    const data = [];
    _.map(displayList.betLogs, (betLog, index) => {
      const {
        betDate,
        betTypeCaption,
        betTypeId,
        brand,
        cancelReasonCaption,
        currency,
        effitiveBet,
        finalStake,
        finalStakeLocal,
        items,
        lastUpdate,
        memberCode,
        oddsType,
        payoff,
        payoffLocal,
        playerId,
        playerName,
        result,
        settlementDate,
        sport,
        wagerId,
        wagerOdds,
        wagerStake,
        wagerStakeLocal,
        winLoss,
      } = betLog;
      data.push({
        key: index,
        id: {betDate, wagerId},
        sportGameDescription: {
          sport,
          gamePlatformName: selectedGamePlatform,
          items,
          betLogKey: index,
          displayList,
          betTypeCaption,
        },
        wagerOdds: {oddsType, wagerOdds},
        wagerStake,
        result: {settled: result !== '确认', winLoss},
        playerWinLoss: {
          settled: result !== '确认',
          winLoss,
          isSports: true,
        },
      });
    });
    return _.orderBy(data, ['wagerId'], ['desc']);
  },
  tableDimension: () => ({width: 900, height: 450}),
  gameReportStatusFilterRules: ({
    display,
    transactionState,
    selectedGamePlatform,
    amount,
    filteredStatus,
  }) =>
    _.filter(display[selectedGamePlatform].betLogs, ({winLoss, result}) => {
      return filter.byWinLoss(
        {winLoss, settled: result !== '确认'},
        filteredStatus,
      );
    }),
};

export default BetRecordReport;
