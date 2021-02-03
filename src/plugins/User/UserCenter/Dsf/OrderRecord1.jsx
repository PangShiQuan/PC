import React, {Component} from 'react';
import classnames from 'classnames';
import {map, sortBy, isNull} from 'lodash';
import {connect} from 'dva';
import {Select, Modal, Spin, message} from 'antd';
import ResponseMessageBar from 'components/User/ResponseMessageBar';
import DateThread from 'components/User/Form/DateThread';
import GameThread from 'components/User/Form/GameThread';
import AntdTable from 'components/User/Form/AntdTable';
import BettingDetails from 'components/User/TradingCenter/BettingRecords/BettingDetails';
import {betRecordReportS} from 'services/gameReport/';
import {renderValue, renderDate} from 'services/gameReport/general';
import SVG from 'react-inlinesvg';
import searchIcon from 'assets/image/User/ic-search.svg';
import {MDIcon} from 'components/General';
import {
  addCommas,
  type,
  getConcatArray,
  formatCurrency,
  getDateTimeRange,
  isGuestUser,
  specialHandleDisplayNewPokerRX,
  codeResult,
  settingMap,
} from 'utils';
import roomSVG from 'assets/image/icn_room.svg';
import shareSVG from 'assets/image/icn_share.svg';
import css from 'styles/User/Dsf/ProfileIndex1.less';
import userCSS from 'styles/User/User.less';
import betCSS from 'styles/User/TradingCenter/BettingRecords.less';

const {
  ReportSearchMaxDays,
  transactionStateRefsValue,
  DateTimeframeQuickRefs,
  gamePlatformType: {ALL, BET},
} = type;
const {Option} = Select;

class OrderRecord extends Component {
  static renderBetString(
    perBetUnits,
    betStringNotOpened,
    gameMethodInChinese,
    gameUniqueId,
    gameplayMethod,
  ) {
    const sortedBetUnits = sortBy(perBetUnits, [o => o.betString]);
    return (
      <ul className={css.profile_dropdownMenu}>
        <li
          key={betStringNotOpened}
          className={css.profile_dropdownMenuItemBetString}>
          <p>{gameMethodInChinese}</p>
          <p>{betStringNotOpened}</p>
        </li>
        {map(sortedBetUnits, (betStrings, index) => {
          const {betString, bonus} = betStrings;
          let specialBetStringHandle;
          const specialPokerRXHandle = specialHandleDisplayNewPokerRX(
            gameUniqueId,
            gameplayMethod,
            betString,
          );
          if (specialPokerRXHandle) {
            specialBetStringHandle = specialPokerRXHandle;
          } else specialBetStringHandle = betString;
          return (
            <li
              key={`${betString}-${index}`}
              className={css.profile_dropdownMenuItem}>
              <span>{specialBetStringHandle}</span>
              {bonus ? (
                <span
                  className={css.profile_dropdownItemSpan}
                  data-color="green">{`中奖 ${addCommas(bonus)}元`}</span>
              ) : null}
            </li>
          );
        })}
      </ul>
    );
  }

  shareModalTitles = {
    shareRooms: '请选择需要分享到的聊天室',
    confirm: {
      prefix: '确定分享到',
      suffix: '房间里吗？',
    },
  };

  initialShareModalState = {
    showShareModal: false,
    shareModalStep: 1,
    shareModalLoading: false,
    selectedShareRoom: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      ...this.initialShareModalState,
      popUpDetails: null,
    };
    this.isGuest = isGuestUser(props.userData);
    this.dispatch = props.dispatch;
  }

  componentDidUpdate(prevProps) {
    const {state} = this.props;
    if (prevProps.state !== state) {
      this.dispatch({
        type: 'orderModel/initializeState',
        payload: ['orderInfo', 'subOrders'],
      });
    }

    const {
      chatboxData: {errMsg, sharedToChat},
    } = this.props;
    const {
      chatboxData: {errMsg: prevErrMsg},
    } = prevProps;
    const {showShareModal} = this.state;
    if (prevErrMsg !== errMsg && !isNull(errMsg) && showShareModal) {
      message.error(errMsg);
      this.dispatch({
        type: 'chatboxModel/updateState',
        payload: {
          errMsg: null,
        },
      });
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState(this.initialShareModalState);
    }

    if (sharedToChat && prevProps.sharedToChat !== sharedToChat) {
      const {chatboxData} = this.props;
      if (chatboxData.responseMsg) {
        message.success(chatboxData.responseMsg.message);
      }

      this.dispatch({
        type: 'chatboxModel/updateState',
        payload: {
          sharedToChat: undefined,
          responseMsg: null,
        },
      });
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        ...this.initialShareModalState,
      });
    }
  }

  componentDidMount() {
    this.onTimeframeQuicklinkClick({
      value: 'ThisMonth',
      isSearch: true,
    });

    const {
      chatboxData: {enable},
    } = this.props;
    if (enable) {
      this.dispatch({type: 'chatboxModel/getUserShareDetails'});
    }
  }

  componentWillUnmount() {
    this.dispatch({
      type: 'dataTableModel/initializeState',
      payload: ['pageSize', 'currentPage', 'state', 'start'],
    });
    this.initializeOrderModel();
    this.clearResponseMessage();
  }

  renderPayoutAmount = ({settled, totalPayout}) => {
    return settled ? renderValue(totalPayout) : <span> - </span>;
  };

  renderWinLoss = ({settled, winLoss = 0, isSports, betTradeStatus}) => {
    if (settled === true && winLoss === 0) {
      return <span>0.00</span>;
    }

    if (
      (settled === false && winLoss === 0) ||
      !winLoss ||
      (isSports && !settled)
    ) {
      return <span> - </span>;
    }

    let statusColor = '';
    if (winLoss > 0) {
      statusColor = 'green';
    } else if (winLoss < 0) {
      statusColor = 'red';
    }
    return (
      <span className={css.orderRecord_status} data-color={statusColor}>
        {renderValue(winLoss)}
      </span>
    );
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.state !== this.props.state) {
      this.dispatch({
        type: 'orderModel/initializeState',
        payload: ['orderInfo', 'subOrders'],
      });
    }
  }

  onPresentBetLogDetails = betLogDetail => {
    const {betLogKey, transactionTimeuuid, currentItemKey} = betLogDetail;
    const {orderHistory, selectedGamePlatform} = this.props;
    const selectedHistory = orderHistory[selectedGamePlatform];
    const {betLogs} = selectedHistory;
    const betDetails = betLogs[betLogKey];

    if (betDetails.showBetLogDetails) {
      orderHistory[selectedGamePlatform].betLogs[
        betLogKey
      ].showBetLogDetails = false;
      if (selectedGamePlatform === BET) {
        this.initializeOrderModel();
      }
    } else {
      orderHistory[selectedGamePlatform].betLogs[
        betLogKey
      ].showBetLogDetails = true;
      orderHistory[selectedGamePlatform].betLogs[
        betLogKey
      ].currentItemKey = currentItemKey;

      if (selectedGamePlatform === BET) {
        this.onTransactionSelect(transactionTimeuuid);
      }
    }
    this.dispatch({
      type: 'orderModel/updateOrderHistory',
      orderHistory,
    });
  };

  onBetLogDetailsClick = ({currentTarget}) => {
    let {betlogdetail: betLogDetail} = currentTarget.dataset;

    if (!currentTarget.dataset)
      betLogDetail = currentTarget.getAttribute('data-betlogdetail');

    this.onPresentBetLogDetails(JSON.parse(betLogDetail));
    this.clearResponseMessage();
  };

  onTransactionSelect = transactionTimeuuid => {
    this.dispatch({
      type: 'orderModel/getOrderDetails',
      payload: {transactionTimeuuid},
    });
  };

  onPageSizeChange = (currentPage, pageSize) => {
    this.dispatch({
      type: 'orderModel/updateState',
      payload: {pageSize},
    });
    this.pageChangeOrder(1);
  };

  onGamePlatformSelectTab = ({currentTarget}) => {
    const selectedGamePlatform = currentTarget.value;

    this.dispatch({
      type: 'orderModel/updateState',
      payload: {selectedGamePlatform},
    });
    this.dispatch({
      type: 'orderModel/initializeState',
      payload: ['sortedInfo', 'filteredStatus', 'platformType', 'searchText'],
    });
    this.dispatch({
      type: 'orderModel/getOrderHistoryDsf',
    });
    // this.onGetOrderHistory();
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
        type: 'dataTableModel/updateState',
        payload: {
          startTime: dateTimeRange.startDatetime,
          endTime: dateTimeRange.endDatetime,
        },
      });
      this.dispatch({
        type: 'orderModel/updateState',
        payload: {
          selectedTimeframeQuickLink: value,
        },
      });
      this.onGetOrderHistory();
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
        type: 'dataTableModel/updateState',
        payload: {startTime, endTime},
      });
      this.onGetOrderHistory();
      this.dispatch({
        type: 'orderModel/initializeState',
        payload: ['selectedTimeframeQuickLink'],
      });
    }
  };

  onSearchOrderChange = event => {
    if (event.target) {
      const {value} = event.target;

      if (value === '') {
        this.dispatch({
          type: 'orderModel/getOrderHistoryDsf',
        });
        this.dispatch({
          type: 'orderModel/initializeState',
          payload: ['searchText'],
        });
      } else {
        this.dispatch({
          type: 'orderModel/updateState',
          payload: {
            searchText: value,
          },
        });
      }
    }
  };

  onSearchOrderID = () => {
    this.dispatch({
      type: 'orderModel/getSearchOrderItem',
    });
  };

  onGetOrderHistory = () => {
    this.onSearchClick();
    this.dispatch({
      type: 'orderModel/initializeState',
      payload: ['searchText', 'sortedInfo'],
    });
  };

  onPlatformTypeChange = value => {
    this.dispatch({
      type: 'orderModel/getOrderHistoryDsf',
      payload: {platformType: value || 'All'},
    });
  };

  onStatusChange = value => {
    this.dispatch({
      type: 'orderModel/updateState',
      payload: {
        filteredStatus: value,
        searchText: '',
      },
    });
    this.dispatch({
      type: 'orderModel/getFilterOrderItem',
    });
  };

  onPageChangeOrder = () => currentPage => {
    this.pageChangeOrder(currentPage);
  };

  onSearchClick = () => {
    const {filteredStatus} = this.props;
    if (filteredStatus === ALL) {
      this.dispatch({
        type: 'orderModel/getOrderHistoryDsf',
      });
    } else {
      this.dispatch({
        type: 'orderModel/getOrderHistoryDsf',
        runAnother: () => {
          this.dispatch({
            type: 'orderModel/getFilterOrderItem',
          });
        },
      });
    }

    this.dispatch({
      type: 'orderModel/initializeState',
      payload: ['searchText'],
    });
  };

  onShareButtonClick = betOrderId => {
    this.dispatch({
      type: 'chatboxModel/getChatToken',
    });
    this.setState({
      betOrderId,
      showShareModal: true,
    });
  };

  onSelectChatroom = room => {
    this.setState({
      shareModalStep: 2,
      selectedShareRoom: room,
    });
  };

  onShareBetToChat = selectedRoomId => {
    const {betOrderId} = this.state;

    this.dispatch({
      type: 'chatboxModel/shareBetToChat',
      payload: {
        orderId: betOrderId,
        roomId: selectedRoomId,
      },
    });
    this.setState({
      shareModalLoading: true,
    });
  };

  onShareModalClose = () => {
    this.setState({...this.initialShareModalState});
  };

  clearResponseMessage = () => {
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['responseMsg'],
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

  getCurrentOrderHistory = gamePlatform => {
    let gamePlatformSelected = {};
    const {orderHistory, selectedGamePlatform} = this.props;
    if (gamePlatform) {
      gamePlatformSelected = gamePlatform;
    } else {
      gamePlatformSelected = selectedGamePlatform;
    }
    return orderHistory[gamePlatformSelected]
      ? orderHistory[gamePlatformSelected]
      : {betLogs: [], currentPage: 0};
  };

  initializeOrderModel = () => {
    this.dispatch({
      type: 'orderModel/initializeState',
      payload: ['orderInfo', 'subOrders', 'coChildOrderList'],
    });
  };

  pageChangeOrder(currentPage) {
    const {orderHistory, selectedGamePlatform} = this.props;
    this.dispatch({
      type: 'orderModel/updateState',
      payload: {
        currentPage,
      },
    });

    this.dispatch({
      type: 'dataTableModel/updateState',
      payload: {
        currentPage,
      },
    });

    if (selectedGamePlatform === 'BET') {
      this.dispatch({type: 'orderModel/getOrderHistoryDsf'});
    } else if (orderHistory[selectedGamePlatform]) {
      orderHistory[selectedGamePlatform].currentPage = currentPage;
      this.dispatch({
        type: 'orderModel/updateOrderHistory',
        orderHistory,
      });
    }
  }

  renderPlatformTypeSelect() {
    const {gamePlatformList, selectedGamePlatform, platformType} = this.props;
    const {noAllType, listOfSupportedPlatformType} = gamePlatformList[
      selectedGamePlatform
    ];

    if (listOfSupportedPlatformType && listOfSupportedPlatformType.length > 1) {
      return (
        <div className={betCSS.search_div}>
          <div className={betCSS.search_label}>类型</div>
          <Select
            className={betCSS.search_dropdown}
            style={{width: 150}}
            defaultValue="ALL"
            value={platformType}
            onChange={this.onPlatformTypeChange}>
            {!noAllType && (
              <Option key="ALL" value={null}>
                全部
              </Option>
            )}
            {map(listOfSupportedPlatformType, item => (
              <Option key={item.cmsPlatformType} value={item.cmsPlatformType}>
                {item.platformTypeName}
              </Option>
            ))}
          </Select>
        </div>
      );
    }
  }

  renderSearchStatusSelect() {
    const {selectedGamePlatform, filteredStatus, gamePlatformList} = this.props;
    const {hideSelectStatusList, resultIdText} = gamePlatformList[
      selectedGamePlatform
    ];

    if (!hideSelectStatusList) {
      return (
        <div className={betCSS.search_div}>
          <div className={betCSS.search_label}>{resultIdText}</div>
          <Select
            className={betCSS.search_dropdown}
            style={{width: 150}}
            defaultValue="ALL"
            value={filteredStatus || ALL}
            onChange={this.onStatusChange}>
            <Option key="ALL" value="ALL">
              全部
            </Option>
            {map(
              transactionStateRefsValue[selectedGamePlatform],
              (index, value) => (
                <Option key={value} value={value}>
                  {index}
                </Option>
              ),
            )}
          </Select>
        </div>
      );
    }

    return false;
  }

  renderSearchTextInput = () => {
    const {selectedGamePlatform, searchText, gamePlatformList} = this.props;
    return (
      <div className={betCSS.search_div}>
        <div className={betCSS.search_label}>搜索</div>
        <div className={betCSS.search_text_div}>
          <input
            className={betCSS.search_text}
            onChange={this.onSearchOrderChange}
            placeholder={gamePlatformList[selectedGamePlatform].idText}
            value={searchText}
          />
          <button
            type="button"
            className={betCSS.search_icon_button}
            onClick={this.onSearchOrderID}>
            <SVG className={betCSS.svg_icon_search} src={searchIcon} />
          </button>
        </div>
      </div>
    );
  };

  renderBetStatus({transactionState}) {
    const {selectedGamePlatform} = this.props;
    const amountColor = {
      WIN: 'green',
      LOSS: 'red',
    };
    return (
      <span
        className={css.orderRecord_status}
        data-color={amountColor[transactionState]}>
        {transactionStateRefsValue[selectedGamePlatform][transactionState]}
      </span>
    );
  }

  renderGameReportMain(selectedGamePlatform) {
    const {
      sortedInfo,
      gamePlatformList,
      chatboxData,
      platformType,
    } = this.props;
    const {popUpDetails} = this.state;

    const columns = [];
    columns.push(
      ...betRecordReportS[selectedGamePlatform].gameReportMain({
        selectedGamePlatform,
        renderValue: data => renderValue(data),
        renderBetDetail: data => this.renderBetDetail(data),
        renderShareButton:
          chatboxData.enable && chatboxData.canShare
            ? data => this.renderShareButton(data)
            : undefined,
        renderBetStatus: data => this.renderBetStatus(data),
        renderWinLoss: data => this.renderWinLoss(data),
        renderPayoutAmount: data => this.renderPayoutAmount(data),
        renderOrderSearch: gamePlatformList[selectedGamePlatform].idText,
        renderDate: data => renderDate(data),
        sortedInfo,
        platformType,
        popUpDetailsState: popUpDetails,
        togglePopUpDetails: id =>
          this.setState(prevState => ({
            popUpDetails: prevState.popUpDetails === id ? false : id,
          })),
      }),
    );
    return columns;
  }

  renderBetDetail({gamePlatformName, betLogKey, transactionTimeuuid}) {
    const betLogDetail = {
      gamePlatformName,
      betLogKey,
    };

    return (
      <div>
        <button
          type="button"
          className={css.orderRecord_detailsBtn}
          onClick={this.onBetLogDetailsClick}
          data-betlogdetail={JSON.stringify(
            {...betLogDetail, transactionTimeuuid} || '',
          )}>
          <b>{gamePlatformName}</b>
        </button>
      </div>
    );
  }

  renderShareButton({betStatus, betType}) {
    let betLog = null;

    const {orderHistory} = this.props;
    if (orderHistory) {
      const {BET: bet} = orderHistory;
      if (bet) {
        betLog = bet.betLogs;
      }
    }

    const betRecord =
      betLog &&
      betLog.find(x => x.transactionTimeuuid === betType.transactionTimeuuid);

    const shareable = betRecord && betRecord.share;

    return (
      betStatus &&
      shareable && (
        <button
          type="button"
          className={css.memberList_tableAnchor}
          onClick={() => this.onShareButtonClick(betType.transactionTimeuuid)}>
          <SVG className={css.shareIcon} src={shareSVG} />
        </button>
      )
    );
  }

  renderChatroomModalContent() {
    const {shareModalStep, selectedShareRoom} = this.state;
    const {
      chatboxData: {roomList},
    } = this.props;

    if (shareModalStep === 1) {
      return (
        <div className={css.roomContainer}>
          {map(roomList, room => {
            return (
              <button
                key={room.roomId}
                type="button"
                className={css.room}
                onClick={() => this.onSelectChatroom(room)}>
                <SVG className={css.roomIcon} src={roomSVG} />
                {room.roomName}
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <div className={css.buttonContainer}>
        <button
          type="button"
          className={css.cancelButton}
          onClick={() =>
            this.setState({
              shareModalStep: 1,
              selectedShareRoom: null,
            })
          }>
          取消
        </button>
        <button
          type="button"
          className={css.confirmButton}
          onClick={() => this.onShareBetToChat(selectedShareRoom.roomId)}>
          确定
        </button>
      </div>
    );
  }

  renderResponseMsg() {
    const {responseMsg} = this.props;
    const {msg, color, icon} = responseMsg;
    if (msg) {
      return (
        <div data-color={color} className={css.profile_formResponse}>
          <MDIcon iconName={icon} />
          <span>{msg}</span>
        </div>
      );
    }
    return null;
  }

  renderTable() {
    const {
      showShareModal,
      shareModalStep,
      shareModalLoading,
      selectedShareRoom,
    } = this.state;

    const {
      selectedGamePlatform,
      pageSize,
      platformType,
      orderHistoryCount,
    } = this.props;

    const columns = this.renderGameReportMain(selectedGamePlatform);
    let props = {};
    const orderHistory = this.getCurrentOrderHistory();
    if (orderHistory.betLogs) {
      const betLogsLength = orderHistory.betLogs.length;
      const pagination = {
        defaultCurrent: 1,
        pageSize,
        pageSizeOptions: ['10', '20', '50'],
        current: orderHistory.currentPage || 1,
        total: selectedGamePlatform === BET ? orderHistoryCount : betLogsLength,
        showQuickJumper: true,
        showSizeChanger: true,
        onChange: this.onPageChangeOrder(),
        onShowSizeChange: this.onPageSizeChange,
      };

      const data = betRecordReportS[selectedGamePlatform].gameReportMainData({
        displayList: orderHistory,
        selectedGamePlatform,
        platformType,
      });

      const getPaginationProps = () => {
        if (selectedGamePlatform === BET) {
          return pagination;
        }
        return betLogsLength > 10 ? pagination : false;
      };

      props = {
        className: betCSS.orderRecord_table,
        columns,
        pagination: getPaginationProps(),
        dataSource: data,
        onChange: this.sortChange,
      };
    }

    return (
      <>
        <AntdTable columns={columns} {...props} />
        <Modal
          className={css.orderRecord_shareChatRoomModal}
          visible={showShareModal}
          width={shareModalStep === 1 ? '37.25rem' : '17.63rem'}
          footer={null}
          header={null}
          closable={false}
          maskStyle={{opacity: '1 important', background: 'black'}}>
          <Spin sizi="large" spinning={shareModalLoading}>
            <div
              className={
                shareModalStep === 1
                  ? css.profile_tablePopUp
                  : css.profile_tablePopUp_confirmation
              }>
              {shareModalStep === 1 && (
                <button
                  type="button"
                  onClick={this.onShareModalClose}
                  className={css.shareModel_popUpCloseBtn}>
                  <MDIcon iconName="window-close" />
                </button>
              )}
              <div
                className={css.shareTitle}
                data-confirmation={shareModalStep === 2}>
                {shareModalStep === 1
                  ? this.shareModalTitles.shareRooms
                  : `${this.shareModalTitles.confirm.prefix}${
                      selectedShareRoom.roomName
                    }${this.shareModalTitles.confirm.suffix}`}
              </div>
              {showShareModal && this.renderChatroomModalContent()}
            </div>
          </Spin>
        </Modal>
      </>
    );
  }

  render() {
    const {
      selectedGamePlatform,
      dataTableModel,
      selectedTimeframeQuickLink,
      orderInfo,
    } = this.props;

    const {startTime, endTime} = dataTableModel;

    const dateThreadProps = {
      currentDayCounts: selectedTimeframeQuickLink,
      startTime,
      endTime,
      timeframeRefs: DateTimeframeQuickRefs,
      onDateChange: this.onDateChange,
      onTimeframeChange: this.onTimeframeChange,
    };
    return (
      <React.Fragment>
        <ResponseMessageBar />
        <div className={classnames(betCSS.bet_listing, userCSS.content_body)}>
          {orderInfo ? (
            <BettingDetails />
          ) : (
            <div>
              <div style={{marginBottom: '20px'}}>
                <DateThread {...dateThreadProps} />
                <GameThread
                  onGamePlatformSelect={this.onGamePlatformSelectTab}
                  hideShowAllCategory
                  selectedGamePlatform={selectedGamePlatform}
                />
                {this.renderPlatformTypeSelect()}
                {this.renderSearchStatusSelect()}
                {this.renderSearchTextInput()}
              </div>
              {this.renderTable()}
            </div>
          )}
        </div>
      </React.Fragment>
    );
  }
}

function mapStatesToProps({
  dataTableModel,
  gameInfosModel,
  orderModel,
  formModel,
  playerModel,
  userModel,
  chatboxModel,
}) {
  return {
    ...orderModel,
    gameInfos: gameInfosModel.gameInfos,
    otherSettings: gameInfosModel.otherSettings,
    responseMsg: formModel.responseMsg,
    gamePlatformList: playerModel.gamePlatformList,
    dataTableModel,
    userData: userModel.userData,
    chatboxData: chatboxModel,
  };
}

export default connect(mapStatesToProps)(OrderRecord);
