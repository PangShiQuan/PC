import _ from 'lodash';

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
      title: '总充值',
      dataIndex: 'totalTopUpBet',
      key: 'totalTopBet',
      render: renderValue,
    });
    columns.push({
      title: '总提现',
      dataIndex: 'totalWithdrawBet',
      key: 'totalWithdrawBet',
      render: renderValue,
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
      title: '有效投注金额',
      dataIndex: 'actualBet',
      key: 'actualBet',
      render: renderValue,
    });
    columns.push({
      title: '总派彩',
      dataIndex: 'totalPayout',
      key: 'totalPayout',
      render: renderValue,
    });
    columns.push({
      title: '总优惠',
      dataIndex: 'totalBonus',
      key: 'totalBonus',
      render: renderValue,
    });
    columns.push({
      title: '返点金额',
      dataIndex: 'rebateAmount',
      key: 'rebateAmount',
      render: renderValue,
    });
    columns.push({
      title: '返水金额',
      dataIndex: 'newRebateAmount',
      key: 'newRebateAmount',
      render: renderValue,
    });
    columns.push({
      title: '总佣金',
      dataIndex: 'totalCommission',
      key: 'totalCommission',
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
      title: '总充值',
      dataIndex: 'totalTopUp',
      key: 'totalTopUp',
      render: renderValue,
    });
    columns.push({
      title: '总提现',
      dataIndex: 'totalWithdraw',
      key: 'totalWithdraw',
      render: renderValue,
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
      title: '有效投注金额',
      dataIndex: 'actualBet',
      key: 'actualBet',
      render: renderValue,
    });
    columns.push({
      title: '派彩',
      dataIndex: 'totalPayout',
      key: 'totalPayout',
      render: renderValue,
    });
    columns.push({
      title: '总优惠',
      dataIndex: 'totalBonus',
      key: 'totalBonus',
      render: renderValue,
    });
    columns.push({
      title: '返点金额',
      dataIndex: 'rebateAmount',
      key: 'rebateAmount',

      render: renderValue,
    });
    columns.push({
      title: '返水金额',
      dataIndex: 'newRebateAmount',
      key: 'newRebateAmount',
      render: renderValue,
    });
    columns.push({
      title: '总佣金',
      dataIndex: 'totalCommission',
      key: 'totalCommission',
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

      count++;
      const platform = displayList[gamePlatform];
      if (!platform) {
        if (gamePlatform === selectedGamePlatform) {
          data.push({
            key: gamePlatform,
            title: gamePlatform,
            totalTopUpBet: 0,
            totalWithdrawBet: 0,
            totalTransferIn: 0,
            totalTransferOut: 0,
            totalBet: 0,
            actualBet: 0,
            totalPayout: 0,
            totalBonus: 0,
            rebateAmount: 0,
            newRebateAmount: 0,
            totalCommission: 0,
            playerWinLoss: 0,
          });
        }
      } else {
        const {
          gamePlatform: title,
          sumCharge,
          sumEffectiveBet,
          sumCommission,
          sumPnl,
          sumTopup,
          sumWin,
          sumWithdrawal,
          sumRebate,
          sumNewRebate,
          sumTransferIn,
          sumTransferOut,
          sumBonus,
        } = platform;
        data.push({
          key: gamePlatform,
          title,
          totalTopUpBet: sumTopup,
          totalWithdrawBet: sumWithdrawal,
          totalTransferIn: sumTransferIn,
          totalTransferOut: Math.abs(sumTransferOut),
          totalBet: Math.abs(sumCharge),
          actualBet: Math.abs(sumEffectiveBet),
          totalPayout: sumWin,
          rebateAmount: sumRebate,
          newRebateAmount: sumNewRebate,
          playerWinLoss: sumPnl,
          totalCommission: sumCommission,
          totalBonus: sumBonus,
        });

        // sumBetCount += Math.abs(sumCharge);
        sum.sumActualBet += Math.abs(sumEffectiveBet);
        sum.sumPlayerWinLoss += sumPnl;
        sum.sumTotalPayout += sumWin;
        sum.sumTotalTopUp += sumTopup;
        sum.sumTotalWithdraw += sumWithdrawal;
        sum.sumTotalTopUpGame += sumTransferIn;
        sum.sumTotalWithdrawGame += Math.abs(sumTransferOut);
        sum.sumTotalBet += Math.abs(sumCharge);
        sum.sumRebateAmount += sumRebate;
        sum.sumNewRebateAmount += sumNewRebate;
        sum.sumTotalCommission += sumCommission;
        sum.sumTotalBonus += sumBonus;
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
          charge,
          effectiveBet,
          commission,
          pnl,
          topup,
          reportDate,
          win,
          withdrawal,
          transferIn,
          transferOut,
          bonus,
          rebate,
          newRebate,
        } = itemDetail;

        data.push({
          gamePlatform: selectedGamePlatform,
          key: index,
          startTime: reportDate,
          playerWinLoss: pnl,
          totalPayout: win,
          totalTopUp: topup,
          totalBet: Math.abs(charge),
          actualBet: Math.abs(effectiveBet),
          totalWithdraw: withdrawal,
          totalCommission: commission,
          totalTransferIn: transferIn,
          totalTransferOut: Math.abs(transferOut),
          totalBonus: bonus,
          rebateAmount: rebate,
          newRebateAmount: newRebate,
        });
      },
    );

    return data;
  },
  tableDimension: () => ({
    1: {
      // width: 1600,
      height: 450,
    },
    2: {
      // width: 1550,
    },
    3: {
      // width: 1800,
    },
  }),
};

export default PersonalReport;
