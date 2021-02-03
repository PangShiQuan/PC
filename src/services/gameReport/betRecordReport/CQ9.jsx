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
      dataIndex: 'round',
      key: 'round',
    });
    columns.push({
      title: '游戏名称',
      dataIndex: 'gameName',
      key: 'gameName',
    });
    columns.push({
      title: '下注时间',
      dataIndex: 'bettime',
      key: 'bettime',
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
        username,
        gameId,
        gameName,
        categoryId,
        categoryName,
        playerId,
        gamehall,
        gametype,
        gameplat,
        gamecode,
        round,
        balance,
        win,
        bet,
        validbet,
        jackpot,
        jackpottype,
        status,
        endroundtime,
        createtime,
        bettime,
        freegame,
        bonusgame,
        luckdraw,
        item,
        reward,
        singlerowbet,
        gamerole,
        bankertype,
        rake,
        roomfree,
      } = betLog;

      data.push({
        key: index,
        round,
        account: username,
        gametype,
        gameName,
        gameEndTime: endroundtime,
        bettime,
        bet,
        playerWinLoss: {winLoss: win},
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
