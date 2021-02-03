import _ from 'lodash';
import {renderStatus} from 'services/gameReport/general';

const PersonalReport = {
  gameReportFirstLayerColumn: ({
    selectedGamePlatform,
    renderTitle,
    renderOperation,
    renderValue,
  }) => {
    const columns = [];
    columns.push({
      title: '操作',
      key: 'operation',
      render: renderOperation,
    });
    columns.push({
      title: '游戏',
      dataIndex: 'title',
      key: 'title',
      render: renderTitle,
    });
    columns.push({
      title: '转入',
      dataIndex: 'totalTransferIn',
      key: 'totalTransferIn',
      render: renderValue,
    });
    columns.push({
      title: '转出',
      dataIndex: 'totalTransferOut',
      key: 'totalTransferOut',
      render: renderValue,
    });
    columns.push({
      title: '总投注',
      dataIndex: 'totalBet',
      key: 'totalBet',
      render: renderValue,
    });
    columns.push({
      title: '总派彩',
      dataIndex: 'totalPayout',
      key: 'totalPayout',
      render: renderValue,
    });
    columns.push({
      title: '返水金额',
      dataIndex: 'rebateAmount',
      key: 'rebateAmount',
      render: renderValue,
    });
    columns.push({
      title: '盈利总额',
      dataIndex: 'playerWinLoss',
      key: 'playerWinLoss',
      render: renderValue,
    });

    return columns;
  },
  gameReportSecondLayerColumn: ({
    selectedGamePlatform,
    renderTitle,
    renderOperation,
    renderValue,
  }) => {
    const columns = [];
    columns.push({
      title: '操作',
      key: 'operation',
      render: renderOperation,
    });
    columns.push({
      title: '日期',
      dataIndex: 'startTime',
      key: 'startTime',
      render: renderTitle,
    });
    columns.push({
      title: '游戏转入',
      dataIndex: 'totalTransferIn',
      key: 'totalTransferIn',
      render: renderValue,
    });
    columns.push({
      title: '游戏转出',
      dataIndex: 'totalTransferOut',
      key: 'totalTransferOut',
      render: renderValue,
    });
    columns.push({
      title: '总投注',
      dataIndex: 'totalBet',
      key: 'totalBet',
      render: renderValue,
    });
    columns.push({
      title: '派彩',
      dataIndex: 'totalPayout',
      key: 'totalPayout',
      render: renderValue,
    });
    columns.push({
      title: '返水金额',
      dataIndex: 'rebateAmount',
      key: 'rebateAmount',
      render: renderValue,
    });
    columns.push({
      title: '盈利总额',
      dataIndex: 'playerWinLoss',
      key: 'playerWinLoss',
      render: renderValue,
    });

    return columns;
  },
  gameReportThirdLayerColumn: ({selectedGamePlatform, renderValue}) => {
    const columns = [];

    columns.push({
      title: '注单号',
      dataIndex: 'id',
      key: 'id',
    });
    columns.push({
      title: '游戏种类',
      dataIndex: 'categoryName',
      key: 'categoryName',
    });
    columns.push({
      title: '游戏名称',
      dataIndex: 'gameName',
      key: 'gameName',
    });
    columns.push({
      title: '投注时间 (GMT+8)',
      dataIndex: 'gameEndTime',
      key: 'gameEndTime',
    });
    columns.push({
      title: '投注金额',
      dataIndex: 'totalBet',
      key: 'totalBet',
      render: renderValue,
    });
    columns.push({
      title: '派彩金额',
      dataIndex: 'totalPayout',
      key: 'totalPayout',
      render: renderValue,
    });

    columns.push({
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: data => renderStatus({...data, selectedGamePlatform}),
    });

    return columns;
  },
  gameReportFirstLayerData: ({
    displayList,
    gamePlatformList,
    selectedGamePlatform,
  }) => {
    const data = [];
    const sum = {
      sumBetCount: 0,
      sumActualBet: 0,
      sumTotalTopUp: 0,
      sumTotalWithdraw: 0,
      sumPlayerWinLoss: 0,
      sumTotalPayout: 0,
      sumTotalTopUpGame: 0,
      sumTotalWithdrawGame: 0,
      sumTotalBet: 0,
      sumRebateAmount: 0,
      sumTotalCommission: 0,
      sumTotalBonus: 0,
    };
    let count = 0;

    Object.values(gamePlatformList).forEach(({gamePlatform}) => {
      if (gamePlatform !== selectedGamePlatform) return;

      count += 1;
      const platform = displayList[gamePlatform];
      if (!platform) {
        if (gamePlatform === selectedGamePlatform) {
          data.push({
            key: gamePlatform,
            title: gamePlatform,
            rebateAmount: 0,
            actualBet: 0,
            playerWinLoss: 0,
            totalPayout: 0,
            totalTransferIn: 0,
            totalBet: 0,
            totalTransferOut: 0,
            totalBonus: 0,
          });
        }
      } else {
        const {
          playerWinLoss,
          totalPayout,
          totalTopUp,
          actualBet,
          totalWithdraw,
          totalBet,
          rebateAmount,
          gamePlatform: title,
        } = platform;
        data.push({
          key: gamePlatform,
          playerWinLoss,
          totalPayout,
          totalTransferIn: totalTopUp,
          actualBet,
          totalTransferOut: totalWithdraw,
          totalBet,
          rebateAmount,
          title,
          totalBonus: 0,
        });

        sum.sumRebateAmount += rebateAmount;
        sum.sumActualBet += actualBet;
        sum.sumPlayerWinLoss += playerWinLoss;
        sum.sumTotalPayout += totalPayout;
        sum.sumTotalTopUpGame += totalTopUp;
        // sumTotalTopUp += totalTopUp;
        sum.sumTotalBet += totalBet;
        sum.sumTotalWithdrawGame += totalWithdraw;
        // sumTotalWithdraw += totalWithdraw;
        sum.sumTotalBonus += 0;
      }
    });

    return {
      data,
      count,
      sum,
    };
  },
  gameReportSecondLayerData: ({displayList, selectedGamePlatform}) => {
    const data = [];
    _.forEach(
      displayList[selectedGamePlatform].details,
      (itemDetail, index) => {
        const {
          betCount,
          gamePlatform: gamePlatformName,
          startTime,
          playerWinLoss,
          totalPayout,
          totalTopUp,
          totalBet,
          totalWithdraw,
          rebateAmount,
          actualBet,
        } = itemDetail;

        data.push({
          key: index,
          betCount,
          gamePlatform: gamePlatformName,
          startTime,
          playerWinLoss,
          totalPayout,
          totalTransferIn: totalTopUp,
          totalBet,
          totalTransferOut: totalWithdraw,
          rebateAmount,
          actualBet,
        });
      },
    );

    return data;
  },
  gameReportThirdLayerData: ({displayList, selectedGamePlatform}) => {
    const data = [];
    _.forEach(displayList.betLogs, (betLog, index) => {
      const {
        categoryName,
        gameName,
        gameStartTime,
        rowId,
        totalWager,
        totalPayout,
        gameEndTime,
        playerWinLoss,
      } = betLog;
      data.push({
        key: index,
        id: rowId,
        categoryName,
        gameName,
        gameStartTime,
        totalBet: totalWager,
        totalPayout,
        gameEndTime,
        status: {
          settled: true,
          winLoss: playerWinLoss,
          selectedGamePlatform,
        },
        playerWinLoss,
      });
    });
    return data;
  },
  tableDimension: () => ({
    1: {
      // width: 1350,
      height: 450,
    },
    2: {
      // width: 1350,
    },
    3: {
      // width: 1350,
    },
  }),
};

export default PersonalReport;
