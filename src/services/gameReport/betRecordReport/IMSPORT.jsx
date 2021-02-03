import _ from 'lodash';
import React from 'react';
import {Collapse} from 'antd';
import {filter, renderStatus} from 'services/gameReport/general';
import cssB from 'styles/User/UserCenter/OrderRecord.less';
import {gamePlatformType} from 'utils/type.config';

const {Panel} = Collapse;

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
      dataIndex: 'betId',
      key: 'betId',
      render: ({betId, wagerCreationDateTime}) => (
        <div>
          <br />
          <div>
            <b>Ref No.:{betId}</b>
          </div>
          <div>{renderDate(wagerCreationDateTime)}</div>
          <br />
        </div>
      ),
    });
    columns.push({
      title: '赛事',
      dataIndex: 'sportGameDescription',
      key: 'sportGameDescription',
      render: (
        {items, betLogKey, oddsType, descriptionOfTheGame},
        {status},
      ) => {
        const summary = [];
        const rowRender = _.map(items, (item, index) => {
          const {
            cancel,
            competitionName,
            eventCnName,
            eventDateTime,
            eventId,
            ftScore,
            handicap,
            htScore,
            odds,
            selection,
            sportsName,
            betType,
            marker,
            wagerHomeTeamScore,
            wagerAwayTeamScore,
          } = item;
          const isAsianHandicap = marker && marker.includes('滚球');

          summary.push(`[${sportsName}] ${eventCnName}`);

          return (
            <div key={`${eventId}_${index}`}>
              <div>[{sportsName}]</div>
              {items.length > 1 ? <div>{betType}</div> : null}
              <div>{competitionName}</div>
              <div>{eventCnName}</div>
              {isAsianHandicap
                ? `[${wagerHomeTeamScore} : ${wagerAwayTeamScore}]`
                : ''}
              <div>
                {selection}&nbsp;
                <span className={cssB.orderRecord_status} data-color="red">
                  {['让球', '大/小'].some(betTypeCode =>
                    betType.includes(betTypeCode),
                  )
                    ? `${(handicap || 0).toFixed(2)} `
                    : ''}{' '}
                  @ {odds.toFixed(2)} ({oddsType})
                </span>
              </div>
              {status.settled ? (
                <div>
                  <span className={cssB.orderRecord_status} data-color="green">
                    上半场({htScore}) - 全场({ftScore})
                  </span>
                </div>
              ) : null}
              <div>{renderDate(eventDateTime, false)}</div>
              {cancel ? (
                <div className={cssB.orderRecord_status} data-color="red">
                  <b>(比赛取消)</b>
                </div>
              ) : null}
              {items.length > 1 && items.length - 1 !== index ? <hr /> : ''}
            </div>
          );
        });

        return items.length > 1 ? (
          <Collapse bordered={false}>
            <Panel
              header={`${descriptionOfTheGame} ${items.length}x1`}
              key={`${betLogKey}`}>
              {rowRender}
            </Panel>
          </Collapse>
        ) : (
          rowRender
        );
      },
    });
    columns.push({
      title: '玩法',
      dataIndex: 'betType',
      key: 'betType',
      render: ({descriptionOfTheGame, comboType}, {sportGame}) => {
        if (sportGame.items.length > 1) {
          return (
            <div>
              <div className={cssB.orderRecord_detailsHeight} data-special>
                {descriptionOfTheGame}
              </div>
              <div className={cssB.orderRecord_detailsHeight} data-special>
                ({comboType})
              </div>
            </div>
          );
        }
        const [{betType, marker}] = sportGame.items;
        const isAsianHandicap = marker && marker.includes('滚球');
        const betTypeCode = isAsianHandicap
          ? betType.slice(0, betType.indexOf('-') + 2)
          : betType;
        const desc = isAsianHandicap ? (
          <p>{betType.slice(betType.indexOf('-') + 1)}</p>
        ) : null;

        return (
          <div className={cssB.orderRecord_detailsHeight}>
            {betTypeCode}
            {isAsianHandicap ? '滚球' : ''}
            {desc}
          </div>
        );
      },
    });
    columns.push({
      title: '投注金额',
      dataIndex: 'totalBet',
      key: 'totalBet',
      render: renderValue,
      sorter: (a, b) => a.totalBet - b.totalBet,
      sortOrder: sortedInfo.columnKey === 'totalBet' && sortedInfo.order,
    });
    columns.push({
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: data =>
        renderStatus({...data, selectedGamePlatform: gamePlatformType.IMSPORT}),
    });
    columns.push({
      title: '盈亏',
      dataIndex: 'playerWinLoss',
      key: 'playerWinLoss',
      render: renderWinLoss,
      sorter: (a, b) => a.playerWinLoss - b.playerWinLoss,
      sortOrder: sortedInfo.columnKey === 'playerWinLoss' && sortedInfo.order,
    });

    return columns;
  },
  gameReportMainData: ({displayList, selectedGamePlatform}) => {
    const data = [];
    _.map(displayList.betLogs, (betLog, index) => {
      const {
        betId,
        wagerCreationDateTime,
        items,
        rebateAmount,
        settled,
        winLoss,
        totalBet,
        actualBet,
        totalPayout,
        lastUpdateTime,
        descriptionOfTheGame,
        wagerType,
        comboType,
        betTradeStatus,
        oddsType,
        showStateName,
      } = betLog;
      data.push({
        key: index,
        betId: {betId, wagerCreationDateTime},
        betType: {descriptionOfTheGame, wagerType, comboType},
        wagerCreationDateTime,
        sportGame: {items},
        sportGameDescription: {
          gamePlatformName: selectedGamePlatform,
          items,
          betLogKey: index,
          oddsType,
          descriptionOfTheGame,
        },
        totalBet,
        actualBet,
        rebateAmount,
        payoutAmount: {settled, totalPayout},
        payoutTime: lastUpdateTime,
        status: {settled, winLoss, showStateName},
        playerWinLoss: {settled, winLoss, isSports: true, betTradeStatus},
      });
    });
    return data;
  },
  tableDimension: () => ({width: 1200, height: 450}),
  gameReportStatusFilterRules: ({
    display,
    selectedGamePlatform,
    filteredStatus,
  }) =>
    _.filter(display[selectedGamePlatform].betLogs, list =>
      filter.byWinLoss(list, filteredStatus),
    ),
};

export default BetRecordReport;
