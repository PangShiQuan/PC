import React, {Component} from 'react';
import {connect} from 'dva';
import _ from 'lodash';
import {renderDate} from 'services/gameReport/general';
import {Pagination, Tooltip} from 'antd';
import ClipboardButton from 'react-clipboard.js';
import ResponseMessageBar from 'components/User/ResponseMessageBar';
import DateThread from 'components/User/Form/DateThread';
import GameThread from 'components/User/Form/GameThread';
import {type as TYPE, getDateTimeRange, isGuestUser} from 'utils';
import userCSS from 'styles/User/User.less';
import tableCSS from 'styles/User/Form/Table.less';

const {
  ReportSearchMaxDays,
  DateTimeframeQuickRefs,
  gamePlatformType: {ALL, BET},
} = TYPE;

class TransferReport extends Component {
  constructor(props) {
    super(props);

    this.isGuest = isGuestUser(props.userData);
    this.dispatch = props.dispatch;
    this.state = {
      tooltipText: '点我复制到剪贴板',
    };
  }

  componentDidMount() {
    const {selectedGamePlatform} = this.props;
    const skip = [BET];

    if (skip.includes(selectedGamePlatform)) {
      this.dispatch({
        type: 'reportModel/updateState',
        payload: {
          selectedGamePlatform: ALL,
        },
      });
    }

    this.onTimeframeQuicklinkClick({
      value: 'ThisMonth',
      isSearch: true,
    });
  }

  componentDidUpdate(prevProps) {
    const {state} = this.props;
    if (prevProps.state !== state) {
      this.dispatch({
        type: 'orderModel/initializeState',
        payload: ['orderInfo', 'subOrders'],
      });
    }
  }

  componentWillUnmount() {
    this.dispatch({
      type: 'reportModel/initializeState',
      payload: ['pageSize', 'currentPage', 'state', 'start'],
    });
    this.dispatch({
      type: 'orderModel/initializeState',
      payload: [
        'orderInfo',
        'subOrders',
        'transactionTimeuuid',
        'searchText',
        'sortedInfo',
        'filteredStatus',
      ],
    });
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['responseMsg'],
    });
  }

  onPageChange = (currentPage, pageSize) => {
    this.dispatch({
      type: 'reportModel/updateState',
      payload: {paginationCurrentPage: currentPage, pageSize},
    });
  };

  onGamePlatformSelectTab = ({currentTarget}) => {
    const selectedGamePlatform = currentTarget.value;

    this.dispatch({
      type: 'reportModel/updateState',
      payload: {selectedGamePlatform},
    });
    this.dispatch({
      type: 'reportModel/initializeState',
      payload: ['sortedInfo', 'filteredStatus'],
    });
    this.dispatch({
      type: 'reportModel/getPlayerGetTransfer',
    });
    this.dispatch({
      type: 'reportModel/initializeState',
      payload: ['searchText', 'sortedInfo'],
    });
    // this.onGetTransferList();
  };

  onTimeframeChange = event => {
    const current = event.target;
    const value =
      (current.dataset && current.dataset.daycounts) ||
      current.getAttribute('data-daycounts');
    this.onTimeframeQuicklinkClick({value});
  };

  onTimeframeQuicklinkClick = ({value, isSearch}) => {
    const dateTimeRange = getDateTimeRange(value);
    if (dateTimeRange) {
      this.dispatch({
        type: 'reportModel/updateState',
        payload: {
          startDatetime: dateTimeRange.startDatetime,
          endDatetime: dateTimeRange.endDatetime,
        },
      });
      this.dispatch({
        type: 'reportModel/updateState',
        payload: {
          selectedTimeframeQuickLink: value,
        },
      });
      this.onGetTransferList();
    }
  };

  onClearDateClick = () => {
    this.onTimeframeQuicklinkClick({
      value: 'ThisMonth',
    });
  };

  onDateChange = ([startTime, endTime]) => {
    if (!startTime && !endTime) {
      this.onClearDateClick();
    } else if (startTime && endTime) {
      if (Math.abs(endTime.diff(startTime, 'days')) >= ReportSearchMaxDays) {
        this.dispatch({
          type: 'formModel/updateState',
          payload: {
            responseMsg: {
              msg: `查询区间需在${ReportSearchMaxDays}天以内`,
              icon: 'close-circle-outline',
              color: 'red',
            },
          },
        });
        return;
      }

      this.dispatch({
        type: 'reportModel/updateState',
        payload: {startDatetime: startTime, endDatetime: endTime},
      });
      this.onGetTransferList();
      this.dispatch({
        type: 'reportModel/initializeState',
        payload: ['selectedTimeframeQuickLink'],
      });
    }
  };

  onGetTransferList = () => {
    this.onSearchClick();
    this.dispatch({
      type: 'reportModel/initializeState',
      payload: ['searchText', 'sortedInfo'],
    });
  };

  sortChange = (pagination, filters, sorter) => {
    this.dispatch({
      type: 'orderModel/updateState',
      payload: {
        sortedInfo: sorter,
      },
    });
  };

  onSearchClick = () => {
    this.dispatch({
      type: 'reportModel/initializeState',
      payload: ['displayList'],
    });
    this.dispatch({
      type: 'reportModel/getPlayerGetTransfer',
    });
  };

  onToolTipVisibleChange = () => {
    this.setState({tooltipText: '点我复制到剪贴板'});
  };

  onCopySuccess = () => {
    this.setState({tooltipText: '复制成功！'});
  };

  renderTableBody = () => {
    const {
      gamePlatformList,
      displayList,
      paginationCurrentPage,
      pageSize,
    } = this.props;
    const {tooltipText} = this.state;

    if (displayList.length) {
      const startIndex =
        paginationCurrentPage === 1
          ? 0
          : paginationCurrentPage * pageSize - pageSize;
      const endIndex = paginationCurrentPage * pageSize;

      const data = displayList.slice(startIndex, endIndex);

      return _.map(data, (item, index) => {
        const {
          createTime,
          transactionId,
          amount,
          gamePlatform,
          type,
          stateExplain,
        } = item;

        const createTimeOutput = createTime ? renderDate(createTime) : '';
        const gamePlatformOutput =
          (
            gamePlatformList[gamePlatform] ||
            TYPE.gamePlatformList[gamePlatform]
          ).gameNameInChinese || '';
        const amountOutput = `￥${amount}`;
        const typeOutput = type
          ? TYPE.moneyOperationTypeRefs[type.toUpperCase()]
          : '';

        return (
          <tr key={index}>
            <td>{createTimeOutput}</td>
            <td>
              <ClipboardButton
                onSuccess={this.onCopySuccess}
                data-clipboard-text={transactionId}>
                <Tooltip
                  title={tooltipText}
                  onVisibleChange={this.onToolTipVisibleChange}>
                  <span className={tableCSS.link}>
                    <i>{transactionId}</i>
                  </span>
                </Tooltip>
              </ClipboardButton>
            </td>
            <td>{amountOutput}</td>
            <td>{gamePlatformOutput}</td>
            <td>{typeOutput}</td>
            <td>{stateExplain}</td>
          </tr>
        );
      });
    }
    return (
      <tr>
        <td colSpan="100%">暂无数据</td>
      </tr>
    );
  };

  renderPagination() {
    const {displayList, pageSize, paginationCurrentPage} = this.props;
    if (!displayList.length) return null;
    return (
      <Pagination
        className={tableCSS.pagination}
        current={paginationCurrentPage}
        pageSize={pageSize}
        onChange={this.onPageChange}
        onShowSizeChange={this.onPageChange}
        pageSizeOptions={['5', '10', '20']}
        showQuickJumper
        showSizeChanger
        total={displayList.length}
      />
    );
  }

  render() {
    const {
      selectedGamePlatform,
      startDatetime,
      endDatetime,
      selectedTimeframeQuickLink,
    } = this.props;

    const dateThreadProps = {
      currentDayCounts: selectedTimeframeQuickLink,
      startTime: startDatetime,
      endTime: endDatetime,
      timeframeRefs: DateTimeframeQuickRefs,
      onDateChange: this.onDateChange,
      onTimeframeChange: this.onTimeframeChange,
    };
    return (
      <React.Fragment>
        <ResponseMessageBar />
        <div className={userCSS.content_body}>
          <div style={{marginBottom: '20px'}}>
            <DateThread {...dateThreadProps} />
            <GameThread
              onGamePlatformSelect={this.onGamePlatformSelectTab}
              showAllGames
              selectedGamePlatform={selectedGamePlatform}
            />
          </div>
          <div className={tableCSS.table_container}>
            <table className={tableCSS.table}>
              <thead>
                <tr>
                  <td>创建时间 (GMT+8)</td>
                  <td>订单号</td>
                  <td>转账金额</td>
                  <td>游戏平台</td>
                  <td>转账类型</td>
                  <td>转账状态</td>
                </tr>
              </thead>
              <tbody>{this.renderTableBody()}</tbody>
            </table>
          </div>
          {this.renderPagination()}
        </div>
      </React.Fragment>
    );
  }
}

function mapStatesToProps({
  dataTableModel,
  gameInfosModel,
  reportModel,
  formModel,
  playerModel,
  userModel,
}) {
  return {
    ...reportModel,
    gameInfos: gameInfosModel.gameInfos,
    responseMsg: formModel.responseMsg,
    gamePlatformList: playerModel.gamePlatformList,
    dataTableModel,
    userData: userModel.userData,
  };
}

export default connect(mapStatesToProps)(TransferReport);
