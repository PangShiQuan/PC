import React, {Component} from 'react';
import {
  sortBy,
  map,
  split,
  reverse,
  slice,
  toNumber,
  sum,
  find,
  isNull,
} from 'lodash';
import {connect} from 'dva';
import moment from 'moment';
import {Pagination, Dropdown, Tooltip, message, Modal, Spin} from 'antd';
import {MDIcon, PokerCard} from 'components/General';
import {
  addCommas,
  type as TYPE,
  getConcatArray,
  specialHandleDisplayNewPokerRX,
  codeResult,
  settingMap,
} from 'utils';
// import refCss from 'styles/User/Base/ProfileIndex1.less';
import refCss from 'styles/User/Dsf/ProfileIndex1.less';
import css from 'styles/User/orderRecord.less';
import userCSS from 'styles/User/User.less';
import tableCSS from 'styles/User/Form/Table.less';
import BettingDetails from 'components/User/TradingCenter/BettingRecords/BettingDetails';
import SVG from 'react-inlinesvg';
import arrowUpIcon from 'assets/image/User/ic-btn-transfer-active-up.svg';
import arrowDownIcon from 'assets/image/User/ic-btn-transfer-active-down.svg';
import roomSVG from 'assets/image/icn_room.svg';
import shareSVG from 'assets/image/icn_share.svg';

const {transactionStateRefs, dateFormat, specialBetType, levelBetType} = TYPE;

const {gamesMap} = settingMap;

function DropDownItem({active, onSelect, value, placeholder}) {
  function onClick() {
    onSelect(value);
  }
  return (
    <button
      type="button"
      data-active={active}
      onClick={onClick}
      className={tableCSS.dropdown_item}>
      {placeholder}
    </button>
  );
}

function TableAnchor({id, onSelect, placeholder}) {
  function onClick() {
    onSelect(id);
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={refCss.profile_tableAnchor}>
      {placeholder}
    </button>
  );
}

function Label({gameIssueNo, tag, issueAmount}) {
  if (tag) {
    const value = specialBetType[tag.substring(0, 3)];
    const valueParent = levelBetType[tag.substring(4, 10)];

    if (value) {
      return (
        <div>
          <Tooltip placement="topLeft" title={value.desc}>
            <span
              className={css.specialBetType}
              data-special={tag.substring(0, 3)}>
              {value.shortDesc}
            </span>
          </Tooltip>
          <Tooltip placement="topLeft" title={valueParent.desc}>
            <span
              className={css.specialBetType}
              data-level={tag.substring(4, 10)}>
              {valueParent.shortDesc}
            </span>
          </Tooltip>
          {(issueAmount && `共${issueAmount}期`) || gameIssueNo}
        </div>
      );
    }
  }

  return <span>{gameIssueNo}</span>;
}

class OrderRecord extends Component {
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
      currentList: [],
      ...this.initialShareModalState,
    };
    this.dispatch = props.dispatch;
  }

  componentDidMount() {
    this.dispatch({type: 'orderModel/getOrderHistoryFirst'});

    const {
      chatboxData: {enable},
    } = this.props;
    if (enable) {
      this.dispatch({type: 'chatboxModel/getUserShareDetails'});
    }
  }

  componentWillReceiveProps(nextProps) {
    const {orderHistory} = this.props;
    const {orderHistory: nextOrderHistory} = nextProps;
    if (orderHistory !== nextOrderHistory) this.sliceList(nextProps);
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

  componentWillUnmount() {
    this.dispatch({
      type: 'dataTableModel/initializeState',
      payload: ['pageSize', 'currentPage', 'state'],
    });
    this.initializeOrderModel();
    this.clearResponseMessage();
  }

  clearResponseMessage = () => {
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['responseMsg'],
    });
  };

  onTransactionSelect = transactionTimeuuid => {
    this.dispatch({
      type: 'orderModel/getOrderDetails',
      payload: {transactionTimeuuid},
    });
  };

  onPageSizeChange = (currentPage, pageSize) => {
    this.dispatch({
      type: 'dataTableModel/updateState',
      payload: {pageSize, currentPage},
    });
    this.dispatch({type: 'orderModel/getOrderHistoryFirst'});
  };

  onPageChange = currentPage => {
    const {orderHistory, pageSize} = this.props;
    const lastPage = Math.round(orderHistory.length / pageSize);
    this.dispatch({
      type: 'dataTableModel/updateState',
      payload: {currentPage},
    });
    if (currentPage >= lastPage) {
      this.dispatch({type: 'orderModel/getOrderHistoryFirst'});
    }
  };

  onStateChange = state => {
    this.dispatch({
      type: 'dataTableModel/updateState',
      payload: {currentPage: 1},
    });
    this.dispatch({type: 'orderModel/updateState', payload: {state}});
    this.dispatch({type: 'orderModel/getOrderHistoryFirst'});
  };

  onSortChange = (direction, target) => {
    const {sorting, sortingTarget} = this.state;
    if (sorting === direction && sortingTarget === target) {
      this.setState({sorting: ''});
    } else {
      this.setState({sorting: direction, sortingTarget: target});
    }
    this.dispatch({type: 'orderModel/getOrderHistoryFirst'});
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

  initializeOrderModel = () => {
    this.dispatch({
      type: 'orderModel/initializeState',
      payload: [
        'orderInfo',
        'subOrders',
        'transactionTimeuuid',
        'isContinueOrder',
        'coChildOrderList',
      ],
    });
  };

  sliceList({orderHistory, pageSize, currentPage}) {
    const {sorting, sortingTarget} = this.state;
    let currentList = [...orderHistory];
    if (orderHistory) {
      if (sorting === 'up') {
        currentList = sortBy([...currentList], [sortingTarget]);
      } else if (sorting === 'down') {
        currentList = reverse(sortBy([...currentList], [sortingTarget]));
      }
      this.setState({currentList});
    }
  }

  renderShareButton({share, transactionTimeuuid}) {
    return (
      share && (
        <button
          type="button"
          className={userCSS.orderRecord_shareButton}
          onClick={() => this.onShareButtonClick(transactionTimeuuid)}>
          <SVG className={userCSS.shareIcon} src={shareSVG} />
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
        <div className={userCSS.roomContainer}>
          {map(roomList, room => {
            return (
              <button
                key={room.roomId}
                type="button"
                className={userCSS.room}
                onClick={() => this.onSelectChatroom(room)}>
                <SVG className={userCSS.roomIcon} src={roomSVG} />
                {room.roomName}
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <div className={userCSS.buttonContainer}>
        <button
          type="button"
          className={userCSS.cancelButton}
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
          className={userCSS.confirmButton}
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
      currentList,
      sorting,
    } = this.state;
    const {state, chatboxData} = this.props;
    let Body;

    if (currentList.length) {
      Body = map(currentList, listItem => {
        const {
          transactionTimeuuid,
          gameNameInChinese,
          gameIssueNo,
          transactionAmount,
          rebate,
          bettingTime,
          transactionState,
          totalUnits,
          winAmount,
          tag,
          issueAmount,
          transactionStateName,
        } = listItem;

        const amountColor = {
          WIN: 'green',
          LOSS: 'red',
        };

        return (
          <tr key={transactionTimeuuid}>
            <td>{moment(bettingTime).format(dateFormat)}</td>
            <td>
              <TableAnchor
                placeholder={gameNameInChinese}
                id={transactionTimeuuid}
                onSelect={this.onTransactionSelect}
              />
            </td>
            <td>
              <Label
                gameIssueNo={gameIssueNo}
                tag={tag}
                issueAmount={issueAmount}
              />
            </td>
            <td>{totalUnits}</td>
            <td>{rebate ? `${addCommas(rebate.toFixed(2))}元` : '-'}</td>
            <td>{addCommas(transactionAmount)}元</td>
            <td data-color={amountColor[transactionState]}>
              {winAmount
                ? transactionStateRefs[transactionState]
                : transactionStateName}
              {transactionState === 'WIN'
                ? ` ${addCommas(winAmount.toFixed(2))}元`
                : ''}
            </td>
            {chatboxData.enable && chatboxData.canShare && (
              <td>{this.renderShareButton(listItem)}</td>
            )}
          </tr>
        );
      });
    } else {
      Body = (
        <tr>
          <td colSpan="100%">暂无数据</td>
        </tr>
      );
    }

    return (
      <div className={tableCSS.table_container}>
        <table className={tableCSS.table}>
          <thead>
            <tr>
              <td>投注时间</td>
              <td>彩种</td>
              <td>期号</td>
              <td>注数</td>
              <td>返点</td>
              <td>
                <i style={{marginRight: '0.5rem'}}>投注总额</i>
                <button
                  type="button"
                  onClick={() => this.onSortChange('up', 'transactionAmount')}>
                  <SVG
                    src={arrowUpIcon}
                    className={
                      sorting === 'up'
                        ? tableCSS.sort_icon_active
                        : tableCSS.sort_icon
                    }
                  />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    this.onSortChange('down', 'transactionAmount')
                  }>
                  <SVG
                    src={arrowDownIcon}
                    className={
                      sorting === 'down'
                        ? tableCSS.sort_icon_active
                        : tableCSS.sort_icon
                    }
                  />
                </button>
              </td>
              <td>
                <Dropdown overlay={this.renderStateDropdown()}>
                  <button type="button">
                    <i>
                      {state === 'ALL'
                        ? '开奖状态'
                        : transactionStateRefs[state]}
                    </i>
                    <MDIcon
                      iconName="menu-down"
                      className={refCss.profile_tableMenuDownIcon}
                    />
                  </button>
                </Dropdown>
              </td>
              {chatboxData.enable && chatboxData.canShare && <td>分享</td>}
            </tr>
          </thead>
          <tbody>{Body}</tbody>
        </table>
        <Modal
          className={userCSS.orderRecord_shareChatRoomModal}
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
                  ? userCSS.orderRecord_sharePopUp
                  : userCSS.orderRecord_sharePopUp_confirmation
              }>
              {shareModalStep === 1 && (
                <button
                  type="button"
                  onClick={this.onShareModalClose}
                  className={userCSS.shareModel_popUpCloseBtn}>
                  <MDIcon iconName="window-close" />
                </button>
              )}
              <div
                className={userCSS.shareTitle}
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
      </div>
    );
  }

  renderPagination() {
    const {orderHistoryCount, currentPage, pageSize} = this.props;
    return (
      <Pagination
        className={tableCSS.pagination}
        defaultCurrent={currentPage}
        defaultPageSize={pageSize}
        onChange={this.onPageChange}
        onShowSizeChange={this.onPageSizeChange}
        showQuickJumper
        showSizeChanger
        total={orderHistoryCount}
      />
    );
  }

  renderStateDropdown() {
    const {state} = this.props;
    return (
      <ul className={tableCSS.dropdown_menu}>
        {map(transactionStateRefs, (typeValue, typeKey) => (
          <DropDownItem
            active={typeKey === state}
            value={typeKey}
            key={typeKey}
            placeholder={typeValue}
            onSelect={this.onStateChange}
          />
        ))}
      </ul>
    );
  }

  static renderBetString(
    perBetUnits,
    betStringNotOpened,
    gameMethodInChinese,
    gameUniqueId,
    gameplayMethod,
  ) {
    const sortedBetUnits = sortBy(perBetUnits, [o => o.betString]);
    return (
      <ul className={tableCSS.dropdown_menu}>
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
              className={tableCSS.dropdown_item}>
              <span>{specialBetStringHandle}</span>
              {bonus ? (
                <span
                  className={refCss.profile_dropdownItemSpan}
                  data-color="green">{`中奖 ${addCommas(bonus)}元`}</span>
              ) : null}
            </li>
          );
        })}
      </ul>
    );
  }

  renderOpenNo() {
    const {orderInfo} = this.props;
    const {gameUniqueId, drawNumber} = orderInfo;
    const gameBelongsCategory = find(gamesMap, item => {
      if (item.gameUniqueId === gameUniqueId) {
        return item;
      }
    });
    if (!drawNumber) {
      return <em className={refCss.profile_popUpOpenNo}> - </em>;
    }
    let drawArray = split(drawNumber, '|');
    const sliceLunPanNumber = Number(
      codeResult.getLunpanNumber(drawArray).slice(2, 4),
    );
    const sliceLunPanNumberColor = codeResult.getLunpanColor(sliceLunPanNumber);
    drawArray = map(drawArray, drawNo => toNumber(drawNo));
    const drawArraySum = sum(drawArray);
    switch (gameBelongsCategory.gameSettingsMap) {
      case 'PCDANDAN':
        return (
          <em className={refCss.profile_popUpOpenNo}>
            {`${drawArray[0]} + ${drawArray[1]} + ${
              drawArray[2]
            } = ${drawArraySum}`}
            |&nbsp;
            {'轮盘 '}
            <span style={{color: sliceLunPanNumberColor}}>
              {sliceLunPanNumber}
            </span>
          </em>
        );
      case 'PK':
        drawArray = map(drawArray, drawNo => (
          <span key={drawNo} className={refCss.profile_popUpPokerNo}>
            <PokerCard pokerCode={[drawNo]} size={1} />
          </span>
        ));
        return drawArray;
      case 'G1':
      case 'SHISHICAI':
        return (
          <em className={refCss.profile_popUpOpenNo}>
            {drawNumber}|&nbsp;
            {'轮盘 '}
            <span style={{color: sliceLunPanNumberColor}}>
              {sliceLunPanNumber}
            </span>
          </em>
        );
      default:
        return <em className={refCss.profile_popUpOpenNo}>{drawNumber}</em>;
    }
  }

  render() {
    const {orderInfo} = this.props;
    return (
      <div className={userCSS.content_body}>
        <div>
          <div>{orderInfo ? <BettingDetails /> : this.renderTable()}</div>
        </div>
        {orderInfo ? null : this.renderPagination()}
      </div>
    );
  }
}

function mapStatesToProps({
  dataTableModel,
  gameInfosModel,
  orderModel,
  formModel,
  chatboxModel,
}) {
  const {gameInfos, otherSettings} = gameInfosModel;
  const {responseMsg} = formModel;
  return {
    ...orderModel,
    ...dataTableModel,
    gameInfos,
    responseMsg,
    otherSettings,
    chatboxData: chatboxModel,
  };
}

export default connect(mapStatesToProps)(OrderRecord);
