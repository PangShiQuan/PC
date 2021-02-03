import _ from 'lodash';
import React from 'react';
import {Tooltip} from 'antd';
import antdTableCSS from 'styles/User/Form/AntdTable.less';
import {MDIcon} from 'components/General/index';
import {renderStatus} from 'services/gameReport/general';
import {formatCurrency, type as TYPE} from 'utils';
import * as gameReportType from './index';

const {BET, IMSPORT, CR, SSSPORT} = TYPE.gamePlatformType;

const PersonalReport = {
  gameReportFirstLayerColumn: ({
    selectedGamePlatform,
    renderTitle,
    renderOperation,
    renderValue,
    renderProfitLossForAll,
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
      key: 'rebateAmount',

      render: renderValue,
    });
    columns.push({
      title: '返水金额',
      key: 'newRebateAmount',
      render: ({key, rebateAmount, newRebateAmount}) => {
        return key && key === BET
          ? renderValue(newRebateAmount)
          : renderValue(rebateAmount);
      },
    });
    columns.push({
      title: '总佣金',
      dataIndex: 'totalCommission',
      key: 'totalCommission',

      render: renderValue,
    });
    columns.push({
      title: '盈利总额',
      key: 'playerWinLoss',

      render: ({playerWinLoss, selectedGamePlatform: gamePlatform}) => {
        const amount = playerWinLoss || 0;
        const renderTooltip = () => {
          if (
            gamePlatform &&
            (gamePlatform === BET ||
              gamePlatform === IMSPORT ||
              gamePlatform === CR ||
              gamePlatform === SSSPORT)
          ) {
            return (
              <Tooltip placement="topLeft" title="派彩-有效投注">
                <span className={antdTableCSS.info_icon}>
                  <MDIcon iconName="information-outline" />
                </span>
              </Tooltip>
            );
          }
          return <span />;
        };

        return (
          <span>
            <span data-negative={amount < 0}>
              ￥ {formatCurrency(amount)} {renderTooltip()}
            </span>
          </span>
        );
      },
    });

    return columns;
  },
  gameReportSecondLayerColumn: ({
    selectedGamePlatform,
    renderTitle,
    renderOperation,
    renderValue,
  }) =>
    gameReportType[selectedGamePlatform].gameReportSecondLayerColumn({
      selectedGamePlatform,
      renderTitle,
      renderOperation,
      renderValue,
    }),
  gameReportThirdLayerColumn: ({
    selectedGamePlatform,
    renderBetDetail,
    sortedInfo,
    renderValue,
  }) =>
    gameReportType[selectedGamePlatform].gameReportThirdLayerColumn({
      selectedGamePlatform,
      renderValue,
      renderBetDetail,
      renderStatus,
      sortedInfo,
    }),
  gameReportFirstLayerData: ({
    displayList,
    selectedGamePlatform,
    gamePlatformList,
  }) => {
    let data = [];
    let count = 0;

    Object.values(gamePlatformList).forEach(({gamePlatform}) => {
      const platform = gameReportType[gamePlatform];

      if (platform) {
        count += 1;

        const firstLayerData = platform.gameReportFirstLayerData({
          displayList,
          gamePlatformList,
          selectedGamePlatform: gamePlatform,
        });

        // firstLayerData.data[0].playerWinLoss = {
        //   playerWinLoss: firstLayerData.data[0].playerWinLoss,
        //   selectedGamePlatform: firstLayerData.data[0].title,
        // };

        data = _.concat(data, firstLayerData.data);
      }
    });

    return {
      data,
      count,
    };
  },
  gameReportSecondLayerData: ({displayList, selectedGamePlatform}) =>
    gameReportType[selectedGamePlatform].gameReportSecondLayerData({
      displayList,
      selectedGamePlatform,
    }),
  gameReportThirdLayerData: ({displayList, selectedGamePlatform, betLogKey}) =>
    gameReportType[selectedGamePlatform].gameReportThirdLayerData({
      displayList,
      selectedGamePlatform,
      betLogKey,
    }),
  tableDimension: () => ({
    1: {
      // width: 1850,
      height: 450,
    },
    2: {
      BET: {
        // width: 1550,
      },
      MG: {
        // width: 1350,
      },
      IMSPORT: {
        // width: 1350,
      },
      FG: {
        // width: 1350,
      },
    },
    3: {
      BET: {
        // width: 1800,
      },
      MG: {
        // width: 1350,
      },
      IMSPORT: {
        // width: 800,
      },
      FG: {
        // width: 1350,
      },
    },
  }),
};

export default PersonalReport;
