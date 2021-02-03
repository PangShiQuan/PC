/* eslint-disable camelcase */
/* eslint-disable babel/camelcase */
import React from 'react';
import _ from 'lodash';
import {Collapse, Table} from 'antd';
import {filter, renderStatus, renderDate} from 'services/gameReport/general';
import {gamePlatformType} from 'utils/type.config';

const {Panel} = Collapse;

const BetRecordReport = {
  gameReportMain: ({
    renderWinLoss,
    renderOrderSearch,
    sortedInfo,
    renderValue,
    popUpDetailsState,
    togglePopUpDetails,
  }) => {
    const columns = [];
    let gameInfo = null;

    columns.push({
      title: renderOrderSearch,
      dataIndex: 'id',
      key: 'id',
    });
    columns.push({
      title: '比赛详情',
      dataIndex: 'gameDetails',
      key: 'gameDetails',
      render: ({
        away_hdp,
        ba_status,
        bet_team,
        bet_type,
        bet_type_name,
        combo_type,
        home_hdp,
        islive,
        match_datetime,
        match_datetime_gmt8,
        match_id,
        odds,
        odds_types,
        odds_type_name,
        parlayData, // sub data
        parlay_type,
        stake,
        ticket_status,
        trans_id,
        transactin_time,
        transaction_time_gmt8,
        winlost_amount,
        winlost_datetime,
        sport_type,
        singleParlayData,
        cashOutData,
        home_score,
        away_score,
        last_ball_no,
        league_name,
        sport_type_name,
        home_name,
        away_name,
        isLucky,
        live_home_score,
        live_away_score,
        numberGameResult,
      }) => {
        let gameType = 0;

        if (!_.isEmpty(singleParlayData)) {
          gameType = 7;
        } else if (!_.isEmpty(parlayData) && parlay_type === 'MixParlay') {
          gameType = 6;
        } else if (!_.isEmpty(parlayData) && parlay_type === 'System Parlay') {
          gameType = 5;
        } else if (
          sport_type >= 180 &&
          sport_type < 200 &&
          _.isEmpty(parlayData)
        ) {
          gameType = 4;
        } else if (
          (sport_type === 161 || sport_type === 164) &&
          _.isEmpty(parlayData)
        ) {
          gameType = 3;
        } else if (islive == 0 && _.isEmpty(parlayData)) {
          gameType = 2;
        } else if (islive == 1 && _.isEmpty(parlayData)) {
          gameType = 1;
        }

        let output = gameType;
        if (gameType <= 4) {
          let gameResultDisplay = `${
            !_.isEmpty(live_home_score) && !_.isEmpty(live_home_score)
              ? `${live_home_score}:${live_away_score}`
              : '-'
          } ${last_ball_no > 0 ? ` (${last_ball_no})` : ''}`;

          if (gameType === 3) {
            gameResultDisplay = numberGameResult;
          }

          const showHandicap =
            home_hdp !== away_hdp && (home_hdp === 0 || away_hdp === 0);

          const vsTeams = (
            <span>
              {home_name}{' '}
              {showHandicap && home_hdp > 0 ? (
                <b style={{color: '#e4393c'}}>({home_hdp})</b>
              ) : (
                ''
              )}{' '}
              VS {away_name}{' '}
              {showHandicap && away_hdp > 0 ? (
                <b style={{color: '#e4393c'}}>({away_hdp})</b>
              ) : (
                ''
              )}
            </span>
          );

          output = (
            <React.Fragment>
              <div>比赛结果：{gameResultDisplay}</div>
              <div>联赛名称：{_.isEmpty(league_name) ? '-' : league_name}</div>
              <div>
                类型：{sport_type_name}/{bet_type_name}
              </div>
              <div>
                比赛时间：
                {_.isEmpty(match_datetime_gmt8) ? '-' : match_datetime_gmt8}
              </div>
              <div>
                对阵：
                {_.isEmpty(home_name) && _.isEmpty(away_name) ? '-' : vsTeams}
              </div>
              <div>
                投注内容：{bet_team} <b style={{color: '#e4393c'}}>@{odds}</b>
              </div>
              <div>
                实时比分：
                {islive == 1 && home_score && away_score ? (
                  <React.Fragment>
                    {home_score}:{away_score}
                  </React.Fragment>
                ) : (
                  '-'
                )}
              </div>
              <div>盘口：{odds_type_name}</div>
            </React.Fragment>
          );
        } else if (gameType <= 6) {
          const subOutput = (
            <React.Fragment>
              {_.map(parlayData, (data, index) => {
                const showHandicap =
                  data.home_hdp !== data.away_hdp &&
                  (data.home_hdp === 0 || data.away_hdp === 0);

                const subVsTeams = (
                  <span>
                    {data.home_name}{' '}
                    {showHandicap && data.home_hdp > 0 ? (
                      <b style={{color: '#e4393c'}}>({data.home_hdp})</b>
                    ) : (
                      ''
                    )}{' '}
                    VS {data.away_name}{' '}
                    {showHandicap && data.away_hdp > 0 ? (
                      <b style={{color: '#e4393c'}}>({data.away_hdp})</b>
                    ) : (
                      ''
                    )}
                  </span>
                );
                return (
                  <React.Fragment key={index}>
                    {index !== 0 && <hr />}
                    <div>
                      比赛结果：
                      {!_.isEmpty(data.live_home_score) &&
                      !_.isEmpty(data.live_away_score)
                        ? `${data.live_home_score}:${data.live_away_score}`
                        : '-'}
                    </div>
                    <div>
                      联赛名称：
                      {_.isEmpty(data.league_name) ? '-' : data.league_name}
                    </div>
                    <div>
                      类型：{data.sport_type_name}/{data.bet_type_name}
                    </div>
                    <div>
                      比赛时间：
                      {_.isEmpty(data.match_datetime_gmt8)
                        ? '-'
                        : data.match_datetime_gmt8}
                    </div>
                    <div>
                      对阵：
                      {_.isEmpty(data.home_name) && _.isEmpty(data.away_name)
                        ? '-'
                        : subVsTeams}
                    </div>
                    <div>
                      投注内容：{data.bet_team}{' '}
                      <b style={{color: '#e4393c'}}>@{data.odds}</b>
                    </div>
                    <div>盘口：{odds_type_name}</div>
                  </React.Fragment>
                );
              })}
            </React.Fragment>
          );

          output = (
            <Collapse>
              <Panel
                header={
                  <React.Fragment>
                    <div>
                      {gameType === 5
                        ? `串関 ${isLucky ? '来自幸运选择' : ''}`
                        : '混合过关'}
                    </div>
                    <div>
                      {combo_type}{' '}
                      {gameType === 6 ? (
                        <b style={{color: '#e4393c'}}>@ {odds}</b>
                      ) : (
                        ''
                      )}
                    </div>
                  </React.Fragment>
                }>
                {subOutput}
              </Panel>
            </Collapse>
          );
        } else if (gameType === 7) {
          const subOutput = (
            <React.Fragment>
              {_.map(singleParlayData, (data, index) => {
                return (
                  <React.Fragment key={index}>
                    {index !== 0 && <hr />}
                    <div>投注内容：{data.selection_name_cs}</div>
                  </React.Fragment>
                );
              })}
            </React.Fragment>
          );

          const showHandicap =
            home_hdp !== away_hdp && (home_hdp === 0 || away_hdp === 0);

          output = (
            <Collapse>
              <Panel
                header={
                  <React.Fragment>
                    <div>
                      单场串関 <b style={{color: '#e4393c'}}>@ {odds}</b>
                    </div>
                    <div>
                      比赛结果：{home_score}:{away_score}
                    </div>
                    <div>联赛名称：{league_name}</div>
                    <div>类型：{sport_type_name}</div>
                    <div>比赛时间：{match_datetime_gmt8}</div>
                    <div>
                      对阵：{home_name}{' '}
                      {showHandicap && home_hdp > 0 ? (
                        <b style={{color: '#e4393c'}}>({home_hdp})</b>
                      ) : (
                        ''
                      )}{' '}
                      VS {away_name}{' '}
                      {showHandicap && away_hdp > 0 ? (
                        <b style={{color: '#e4393c'}}>({away_hdp})</b>
                      ) : (
                        ''
                      )}
                    </div>
                    <div>盘口：{odds_type_name}</div>
                  </React.Fragment>
                }>
                {subOutput}
              </Panel>
            </Collapse>
          );
        }

        gameInfo = (
          <div
            style={{
              textAlign: 'left',
              padding: '6px 0',
              whiteSpace: 'break-spaces',
              maxWidth: 300,
            }}>
            {output}
          </div>
        );

        return gameInfo;
      },
    });
    columns.push({
      title: '投注金额',
      dataIndex: 'betAmount',
      key: 'betAmount',
      render: data => {
        if (data.game_detail && data.game_detail.cashOutData) {
          const {original_stake, stake} = data.game_detail;
          return (
            <React.Fragment>
              <div style={{textDecoration: 'line-through'}}>
                {renderValue(original_stake)}
              </div>
              <div>{renderValue(stake)}</div>
            </React.Fragment>
          );
        }

        return renderValue(data.bet_amount);
      },
    });
    columns.push({
      title: '是否结算',
      dataIndex: 'result',
      key: 'result',
      render: ({result, stake, cashOutData}) => {
        if (cashOutData) {
          return (
            <React.Fragment>
              <div>{stake !== 0 && result == 0 ? '未结算' : '已结算'}</div>
              <div>即时兑现</div>
              <div>{stake === 0 ? '（卖掉全部的票）' : '（卖掉部分的票）'}</div>
            </React.Fragment>
          );
        }
        return result == 0 ? '未结算' : '已结算';
      },
    });
    columns.push({
      title: '投注状态',
      dataIndex: 'status',
      key: 'status',
      render: ({
        trans_id,
        stake,
        ticket_status,
        winlost_amount,
        cashOutData,
      }) => {
        if (cashOutData) {
          const popupColumns = [
            {
              title: '订单号',
              dataIndex: 'cashout_id',
              key: 'cashout_id',
            },
            {
              title: '比赛详情',
              dataIndex: 'details',
              key: 'details',
            },
            {
              title: '卖出投注额',
              dataIndex: 'stake',
              key: 'stake',
            },
            {
              title: '注单卖出金额',
              dataIndex: 'buyback_amount',
              key: 'buyback_amount',
            },
            {
              title: '输赢',
              dataIndex: 'winLoss',
              key: 'winLoss',
            },
            {
              title: '状态',
              dataIndex: 'status',
              key: 'status',
            },
          ];

          const popupData = [];
          _.map(cashOutData, (cashout, index) => {
            const {
              cashout_id,
              buyback_amount,
              real_stake,
              ticket_status: cashout_ticketStatus,
            } = cashout;

            popupData.push({
              key: index,
              cashout_id,
              details: (
                <React.Fragment>
                  <div>从注单号 {trans_id} 的即时兑现</div>
                  {gameInfo}
                </React.Fragment>
              ),
              stake: real_stake,
              buyback_amount,
              winLoss: (buyback_amount - real_stake).toFixed(2),
              status: renderStatus({
                passInStatus: cashout_ticketStatus,
                winLoss: buyback_amount - real_stake,
                selectedGamePlatform: gamePlatformType.SB,
              }),
            });
          });

          return (
            <div style={{position: 'relative'}}>
              <div>
                {stake === 0
                  ? '即时兑现'
                  : renderStatus({
                      passInStatus: ticket_status,
                      winLoss: winlost_amount,
                      selectedGamePlatform: gamePlatformType.SB,
                    })}
              </div>
              <button
                type="button"
                onClick={() => togglePopUpDetails(trans_id)}
                style={{fontWeight: 'bold'}}>
                详情
              </button>
              <div
                style={{
                  display: popUpDetailsState === trans_id ? '' : 'none',
                  position: 'absolute',
                  border: '1px solid #eee',
                  transform: 'translate(-70%, 0)',
                  boxShadow: `0 2px 4px -1px rgba(76, 76, 76, 0.2),
                  0 4px 5px 0 rgba(76, 76, 76, 0.14),
                  0 1px 10px 0 rgba(76, 76, 76, 0.12)`,
                  padding: '10px',
                  backgroundColor: '#fff',
                  overflow: 'auto',
                  zIndex: 1,
                }}>
                <Table
                  columns={popupColumns}
                  dataSource={popupData}
                  pagination={false}
                />
              </div>
            </div>
          );
        }

        return renderStatus({
          passInStatus: ticket_status,
          winLoss: winlost_amount,
          selectedGamePlatform: gamePlatformType.SB,
        });
      },
    });
    columns.push({
      title: '输赢',
      dataIndex: 'playerWinLoss',
      key: 'playerWinLoss',
      sorter: (a, b) => a.playerWinLoss.winLoss - b.playerWinLoss.winLoss,
      sortOrder: sortedInfo.columnKey === 'playerWinLoss' && sortedInfo.order,
      render: renderWinLoss,
    });
    columns.push({
      title: '下注时间',
      dataIndex: 'betTime',
      key: 'betTime',
      render: data => renderDate(data, true, true),
    });

    return columns;
  },
  gameReportMainData: ({displayList, selectedGamePlatform}) => {
    const data = [];
    _.map(displayList.betLogs, (betLog, index) => {
      const {
        bet_amount,
        bet_time,
        betlog_id,
        created_time,
        effective_bet,
        game_detail,
        player_id,
        settlement_time,
        updated_time,
        username,
        win_amount,
      } = betLog;

      data.push({
        key: index,
        id: betlog_id,
        gameDetails: game_detail,
        betAmount: {bet_amount, game_detail},
        betTime: bet_time,
        result: game_detail,
        status: game_detail,
        playerWinLoss: {winLoss: win_amount},
      });
    });

    return _.orderBy(data, ['id'], ['desc']);
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
