/* eslint-disable camelcase */
/* eslint-disable babel/camelcase */
import _ from 'lodash';
import {filter, renderDate} from 'services/gameReport/general';

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
      dataIndex: 'betlog_id',
      key: 'betlog_id',
    });
    columns.push({
      title: '游戏分类',
      dataIndex: 'gameCategory',
      key: 'gameCategory',
    });
    columns.push({
      title: '游戏名称',
      dataIndex: 'gameName',
      key: 'gameName',
    });
    columns.push({
      title: '下注时间',
      dataIndex: 'betTime',
      key: 'betTime',
      render: data => renderDate(data),
    });
    columns.push({
      title: '下注金额',
      dataIndex: 'bet',
      key: 'bet',
      render: renderValue,
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
      title: '遊戲結束時間',
      dataIndex: 'gameEndTime',
      key: 'gameEndTime',
      render: data => renderDate(data),
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
        game_category_id,
        game_category_name,
        game_id,
        game_name,
        platform_type,
        player_id,
        settlement_time,
        updated_time,
        username,
        win_amount,
      } = betLog;

      data.push({
        key: index,
        betlog_id,
        account: username,
        gameCategory: game_category_name,
        gameName: game_name,
        bet: bet_amount,
        playerWinLoss: {winLoss: win_amount},
        betTime: bet_time,
        gameEndTime: settlement_time,
      });
    });
    return _.orderBy(data, ['betlog_id'], ['desc']);
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
