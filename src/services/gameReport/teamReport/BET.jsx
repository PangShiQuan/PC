import _ from 'lodash';
import React from 'react';
import {Tooltip} from 'antd';
import antdTableCSS from 'styles/User/Form/AntdTable.less';
import {MDIcon} from 'components/General/index';
import {renderValue} from 'services/gameReport/general';

const TeamReport = {
  gameReportMain: ({
    selectedGamePlatform,
    renderTitle,
    renderTitleAnchor,
    renderOperation,
    sortedInfo,
    isPersonalReport = false,
  }) => {
    const columns = [];
    columns.push({
      title: '用户名',
      dataIndex: 'title',
      key: 'title',
      render: renderTitleAnchor,
    });
    columns.push({
      title: '上级代理',
      dataIndex: 'upLineUser',
      key: 'upLineUser',
      render: renderTitle,
    });

    columns.push({
      title: '总充值',
      dataIndex: 'totalTopUpBet',
      key: 'totalTopUpBet',
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
      sorter: (a, b) => a.totalBet - b.totalBet,
      sortOrder: sortedInfo.columnKey === 'totalBet' && sortedInfo.order,
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
      title: (
        <span>
          盈利总额
          <Tooltip placement="top" title="派彩-有效投注">
            <span className={antdTableCSS.info_icon}>
              <MDIcon iconName="information-outline" />
            </span>
          </Tooltip>
        </span>
      ),
      dataIndex: 'playerWinLoss',
      key: 'playerWinLoss',
      render: renderValue,
      sorter: (a, b) => a.playerWinLoss - b.playerWinLoss,
      sortOrder: sortedInfo.columnKey === 'playerWinLoss' && sortedInfo.order,
    });

    if (!isPersonalReport) {
      columns.push({
        title: '操作',
        key: 'operation',
        render: renderOperation,
      });
    }
    return columns;
  },
  gameReportMainData: ({displayList, selectedGamePlatform}) => {
    const data = [];
    if (!displayList[selectedGamePlatform]) {
      return {data, count: 0};
    }
    let count = 0;

    const gamePlatformObj = displayList[selectedGamePlatform];
    _.map(gamePlatformObj.data, (item, index) => {
      const {
        bonus,
        charge,
        directAgent,
        pnl,
        rebate,
        topup,
        transferIn,
        transferOut,
        uniqueActiveChild,
        username,
        win,
        withdrawal,
        teamMemberCount,
        userId,
        effectiveBet,
      } = item;

      data.push({
        key: index,
        title: {
          username,
          userCount: uniqueActiveChild,
          teamMemberCount,
          userId,
        },
        upLineUser: directAgent,
        actualBet: Math.abs(effectiveBet),
        playerWinLoss: pnl,
        totalPayout: win,
        rebateAmount: rebate,
        totalTransferIn: transferIn,
        totalBet: Math.abs(charge),
        totalTransferOut: transferOut,
        downlineCount: uniqueActiveChild,
        totalTopUpBet: topup,
        totalWithdrawBet: withdrawal,
        totalBonus: bonus,
      });

      count++;
    });
    return {
      data,
      count,
    };
  },
  gameReportPersonal: ({selectedGamePlatform, renderTitle}) => {
    const columns = [];

    columns.push({
      title: '总充值',
      dataIndex: 'totalTopUpBet',
      key: 'totalTopUpBet',
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
      dataIndex: 'totalRebate',
      key: 'totalRebate',
      render: renderValue,
    });
    columns.push({
      title: '返水金额',
      dataIndex: 'totalNewRebate',
      key: 'totalNewRebate',
      render: renderValue,
    });
    columns.push({
      title: (
        <span>
          盈利总额
          <Tooltip placement="topLeft" title="派彩-有效投注">
            <span className={antdTableCSS.info_icon}>
              <MDIcon iconName="information-outline" />
            </span>
          </Tooltip>
        </span>
      ),
      dataIndex: 'playerWinLoss',
      key: 'playerWinLoss',
      render: renderValue,
    });

    return columns;
  },
  gameReportPersonalData: ({
    displayList,
    selectedGamePlatform,
    selectedUsername,
    selectedUplineUsername,
  }) => {
    const data = [];
    if (!displayList[selectedGamePlatform]) {
      return {data, count: 0};
    }
    const item = displayList[selectedGamePlatform];
    const {
      sumCharge,
      sumEffectiveBet,
      sumPnl,
      sumTopup,
      sumWin,
      sumWithdrawal,
      sumRebate,
      sumNewRebate,
      sumTransferIn,
      sumTransferOut,
      sumBonus,
    } = item;
    data.push({
      key: `${selectedUsername}statements`,
      title: selectedUsername,
      upLineUser: selectedUplineUsername,
      totalBet: Math.abs(sumCharge),
      actualBet: Math.abs(sumEffectiveBet),
      playerWinLoss: sumPnl,
      totalPayout: sumWin,
      totalTopUpBet: sumTopup,
      totalWithdrawBet: sumWithdrawal,
      totalRebate: sumRebate,
      totalNewRebate: sumNewRebate,
      totalTransferIn: sumTransferIn,
      totalTransferOut: sumTransferOut,
      totalBonus: sumBonus,
    });

    return {
      data,
      count: 1,
    };
  },
  gameReportDownline: ({selectedGamePlatform, renderTitle}) => {
    let columns = [];
    columns.push({
      title: '查询日期',
      dataIndex: 'datetime',
      key: 'datetime',
      render: renderTitle,
    });

    columns = _.concat(
      columns,
      TeamReport.gameReportMain({
        selectedGamePlatform,
        renderTitle,
        renderValue,
        isPersonalReport: true,
      }),
    );
    return columns;
  },
  gameReportDownlineData: ({displayList, selectedGamePlatform}) => {
    const data = [];
    if (!displayList[selectedGamePlatform]) {
      return {data, count: 0};
    }
    const gamePlatformObj = displayList[selectedGamePlatform];
    _.forEach(gamePlatformObj.data, (item, index) => {
      const {
        charge,
        directAgent,
        pnl,
        rebate,
        topup,
        transferIn,
        transferOut,
        uniqueActiveChild,
        username,
        win,
        withdrawal,
        effectiveBet,
      } = item;

      data.push({
        key: index,
        title: username,
        upLineUser: directAgent,
        actualBet: effectiveBet,
        playerWinLoss: pnl,
        totalPayout: win,
        rebateAmount: rebate,
        totalTransferIn: transferIn,
        totalBet: charge,
        totalTransferOut: transferOut,
        downlineCount: uniqueActiveChild,
        totalTopUpBet: topup,
        totalWithdrawBet: withdrawal,
      });
    });
    return {
      data,
      count: 1,
    };
  },
  tableDimension: () => ({
    main: {
      // width: 1900,
    },
    personalReport: {
      // width: 1350,
    },
    teamReport: {
      // width: 1700,
    },
  }),
};

export default TeamReport;
