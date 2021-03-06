import _ from 'lodash';
import React from 'react';
import classnames from 'classnames';
import {Tooltip} from 'antd';
import cssT from 'styles/User/Dsf/TeamReport1.less';
import {MDIcon} from 'components/General/index';
import {renderValue} from 'services/gameReport/general';

const TeamReport = {
  gameReportMain: ({
    selectedGamePlatform,
    renderTitle,
    renderTitleAnchor,
    renderOperation,
    renderUserSearch,
    sortedInfo,
    isPersonalReport = false,
  }) => {
    const columns = [];
    columns.push({
      title: renderUserSearch,
      dataIndex: 'title',
      key: 'title',
      className: classnames(cssT.teamReport_extraLong),
      render: renderTitleAnchor,
    });
    columns.push({
      title: '上级代理',
      dataIndex: 'upLineUser',
      key: 'upLineUser',
      className: classnames(cssT.teamReport_mediumLong),
      render: renderTitle,
    });
    columns.push({
      title: '转入',
      dataIndex: 'totalTransferIn',
      key: 'totalTransferIn',
      className: cssT.teamReport_columnAmount,
      render: renderValue,
    });
    columns.push({
      title: '转出',
      dataIndex: 'totalTransferOut',
      key: 'totalTransferOut',
      className: cssT.teamReport_columnAmount,
      render: renderValue,
    });
    columns.push({
      title: '总投注',
      dataIndex: 'totalBet',
      key: 'totalBet',
      className: cssT.teamReport_columnAmount,
      render: renderValue,
      sorter: (a, b) => a.totalBet - b.totalBet,
      sortOrder: sortedInfo.columnKey === 'totalBet' && sortedInfo.order,
    });
    columns.push({
      title: '有效投注金额',
      dataIndex: 'actualBet',
      key: 'actualBet',
      className: cssT.teamReport_columnAmount,
      render: renderValue,
    });
    columns.push({
      title: '总派彩',
      dataIndex: 'totalPayout',
      key: 'totalPayout',
      className: cssT.teamReport_columnAmount,
      render: renderValue,
    });
    columns.push({
      title: '返点金额',
      dataIndex: 'rebateAmount',
      key: 'rebateAmount',
      className: cssT.teamReport_columnAmount,
      render: renderValue,
    });
    columns.push({
      title: (
        <span>
          盈利总额
          <Tooltip placement="topLeft" title="派彩-有效投注">
            <MDIcon
              iconName="information-outline"
              className={cssT.teamReport_ToolTip}
            />
          </Tooltip>
        </span>
      ),
      dataIndex: 'playerWinLoss',
      key: 'playerWinLoss',
      className: cssT.teamReport_columnAmount,
      render: renderValue,
      sorter: (a, b) => a.playerWinLoss - b.playerWinLoss,
      sortOrder: sortedInfo.columnKey === 'playerWinLoss' && sortedInfo.order,
    });

    if (!isPersonalReport) {
      columns.push({
        title: '操作',
        key: 'operation',
        className: cssT.teamReport_columnDetailBtn,
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
        betCount,
        actualBet,
        playerWinLoss,
        totalPayout,
        totalTopUp,
        totalBet,
        totalWithdraw,
        username,
        directAgent,
        userCount,
        teamMemberCount,
        userId,
      } = item;
      data.push({
        key: count,
        title: {username, userCount, teamMemberCount, userId},
        upLineUser: directAgent,
        betCount,
        actualBet,
        playerWinLoss,
        totalPayout,
        totalTransferIn: totalTopUp,
        totalBet,
        totalTransferOut: totalWithdraw,
        downlineCount: userCount,
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
      title: '转入',
      dataIndex: 'totalTransferIn',
      key: 'totalTransferIn',
      className: cssT.teamReport_columnAmount,
      render: renderValue,
    });
    columns.push({
      title: '转出',
      dataIndex: 'totalTransferOut',
      key: 'totalTransferOut',
      className: cssT.teamReport_columnAmount,
      render: renderValue,
    });
    columns.push({
      title: '总投注',
      dataIndex: 'totalBet',
      key: 'totalBet',
      className: cssT.teamReport_columnAmount,
      render: renderValue,
    });
    columns.push({
      title: '有效投注金额',
      dataIndex: 'actualBet',
      key: 'actualBet',
      className: cssT.teamReport_columnAmount,
      render: renderValue,
    });
    columns.push({
      title: '总派彩',
      dataIndex: 'totalPayout',
      key: 'totalPayout',
      className: cssT.teamReport_columnAmount,
      render: renderValue,
    });
    columns.push({
      title: '返点金额',
      dataIndex: 'rebateAmount',
      key: 'rebateAmount',
      className: cssT.teamReport_columnAmount,
      render: renderValue,
    });
    columns.push({
      title: (
        <span>
          盈利总额
          <Tooltip placement="topLeft" title="派彩-有效投注">
            <MDIcon
              iconName="information-outline"
              className={cssT.teamReport_ToolTip}
            />
          </Tooltip>
        </span>
      ),
      dataIndex: 'playerWinLoss',
      key: 'playerWinLoss',
      className: cssT.teamReport_columnAmount,
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
      totalBet,
      actualBet,
      totalPayout,
      playerWinLoss,
      totalTopUp,
      totalWithdraw,
      betCount,
      queryTime,
    } = item;
    data.push({
      key: `${selectedUsername}statements`,
      datetime: queryTime,
      title: selectedUsername,
      upLineUser: selectedUplineUsername,
      betCount,
      actualBet,
      playerWinLoss,
      totalPayout,
      totalTransferIn: totalTopUp,
      totalBet,
      totalTransferOut: totalWithdraw,
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
      className: classnames(cssT.teamReport_long),
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
        betCount,
        playerWinLoss,
        totalPayout,
        totalTopUp,
        actualBet,
        totalWithdraw,
        totalBet,
        username,
        queryTime,
        directAgent,
      } = item;
      data.push({
        key: `${username}${index}Downline`,
        datetime: queryTime,
        title: username,
        upLineUser: directAgent,
        betCount,
        actualBet,
        playerWinLoss,
        totalPayout,
        totalTransferIn: totalTopUp,
        totalBet,
        totalTransferOut: totalWithdraw,
      });
    });
    if (gamePlatformObj.count > 0) {
      const {
        totalBet,
        actualBet,
        totalPayout,
        playerWinLoss,
        totalTopUp,
        totalWithdraw,
        betCount,
      } = gamePlatformObj.statements;

      data.push({
        key: 'sumTable',
        datetime: '小计',
        betCount,
        playerWinLoss,
        totalPayout,
        totalTransferIn: totalTopUp,
        totalTransferOut: totalWithdraw,
        totalTopUp,
        totalWithdraw,
        totalBet,
        actualBet,
      });
    }
    return {
      data,
      count: 1,
    };
  },
  tableDimension: () => ({
    main: {
      width: 1800,
    },
    personalReport: {
      width: 1350,
    },
    teamReport: {
      width: 1800,
    },
  }),
};

export default TeamReport;
