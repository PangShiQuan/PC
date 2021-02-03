import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Spin} from 'antd';
import classnames from 'classnames';
import SVG from 'react-inlinesvg';
import {isNull, isEmpty} from 'lodash';
import moment from 'moment';
import {getChatDomain} from 'utils';
import css from 'styles/chatbox/index.less';
import chatboxIcon from 'assets/image/icn_chatroom.svg';
import expandIcon from 'assets/image/icn_expand.svg';
import shrinkIcon from 'assets/image/icn_shrink.svg';
import closeIcon from 'assets/image/icn_close.svg';
import ChatboxNavbar from 'components/Chatbox/ChatboxNavbar';
import ChatboxRoomList from 'components/Chatbox/ChatboxRoomList';
import ChatboxBetDetailsPopUp from 'components/Chatbox/ChatboxBetDetailsPopUp';
import ChatboxAlert from 'components/Chatbox/ChatboxAlert';
import ChatboxImageView from 'components/Chatbox/ChatboxImageView';
import ChatFrame from 'components/Chatbox/ChatFrame';
import chatboxMassageData from 'components/Chatbox/chatboxMassageData';

class ChatboxWindow extends PureComponent {
  INITIAL_STATE = {
    firstTimeGetChatToken: true,
    firstTimeGetAllRooms: true,
    ws: null,
    chatLoading: true,
    chatFrameSrc: null,
    showRoomList: false,
    alertBox: null,
    messages: [],
    uploadModal: null,
  };

  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;

    this.state = {
      ...this.INITIAL_STATE,
    };
  }

  componentDidUpdate(prevProps) {
    const {
      chatboxData: {
        showChatbox,
        chatToken,
        expiryDate,
        allRooms,
        defaultRoom,
        selectedRoom,
        followOrderAlert,
        errMsg,
        userPrinciple,
        chatHistory,
      },
      userData: {sessionId},
    } = this.props;

    const {
      chatboxData: {
        selectedRoom: prevSelectedRoom,
        chatToken: prevChatToken,
        expiryDate: prevExpiryDate,
        followOrderAlert: prevFollowOrderAlert,
        errMsg: prevErrMsg,
        userPrinciple: prevUserPrinciple,
        chatHistory: prevChatHistory,
      },
      userData: {sessionId: prevSessionId},
    } = prevProps;

    // login or logout, reset chat frame
    if (sessionId !== prevSessionId) {
      this.resetChatFrame();
    }

    // first time open chat window
    if (showChatbox) {
      const {firstTimeGetChatToken, firstTimeGetAllRooms} = this.state;
      if (isNull(chatToken) && firstTimeGetChatToken) {
        this.dispatch({
          type: 'chatboxModel/getChatToken',
        });
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({firstTimeGetChatToken: false});
      } else if (
        !isNull(chatToken) &&
        isNull(allRooms) &&
        firstTimeGetAllRooms
      ) {
        // after got the chatToken, get rooms data
        this.dispatch({type: 'chatboxModel/getAllRooms'});
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({firstTimeGetAllRooms: false});
      }

      if (expiryDate && prevExpiryDate !== expiryDate) {
        const expiredDate = moment(expiryDate);
        const now = moment().add(5, 'minutes');
        const duration = expiredDate.diff(now);

        setTimeout(() => {
          this.dispatch({
            type: 'chatboxModel/getChatToken',
          });
        }, duration);
      }
    }

    // after got rooms data, set default room
    if (
      showChatbox &&
      !isNull(chatToken) &&
      !isEmpty(defaultRoom) &&
      isNull(selectedRoom)
    ) {
      this.dispatch({
        type: 'chatboxModel/updateState',
        payload: {
          selectedRoom: defaultRoom,
        },
      });
    }

    // after everything is set, connect websocket
    if (showChatbox && chatToken && prevSelectedRoom !== selectedRoom) {
      this.dispatch({
        type: 'chatboxModel/getChatHistoryMessages',
        runAfter: this.connectChatWebSocket,
      });
    }

    // user principle changed, check if user has access to the room
    if (
      userPrinciple !== prevUserPrinciple &&
      userPrinciple &&
      userPrinciple.properties &&
      userPrinciple.properties.rooms &&
      selectedRoom
    ) {
      const accessibleRooms = userPrinciple.properties.rooms;
      if (!accessibleRooms.find(x => x.id == selectedRoom.roomId)) {
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({
          alertBox: {
            desc: `聊天室设定有更改，服务刷新`,
            submit: {
              label: '确定',
              action: () => {
                if (userPrinciple.properties.defaultRoom) {
                  this.onSelectRoomConfirm({
                    roomId: userPrinciple.properties.defaultRoom.id,
                    roomName: userPrinciple.properties.defaultRoom.name,
                  });
                }
              },
            },
          },
        });
      }
    }

    if (prevChatHistory !== chatHistory) {
      const newMsgs = [];
      if (chatHistory) {
        chatHistory.forEach(msg => {
          newMsgs.push(chatboxMassageData(msg, selectedRoom, this.dispatch));
        });
      }
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({messages: newMsgs});
    }

    if (followOrderAlert && prevFollowOrderAlert !== followOrderAlert) {
      let errorCancelLabel = null;
      let errorSubmitLabel = null;
      let errorSubmitAction = null;
      if (
        followOrderAlert.status !== 'success' &&
        followOrderAlert.message === '账户余额不足'
      ) {
        errorCancelLabel = '取消';
        errorSubmitLabel = '去充值';
        errorSubmitAction = () => this.redirectToPage('topupCtrl');
      }

      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        alertBox: {
          title: followOrderAlert.status === 'success' ? null : '温馨提示',
          desc:
            followOrderAlert.status === 'success'
              ? `恭喜！下注成功`
              : followOrderAlert.message,
          cancel: {
            label:
              followOrderAlert.status === 'success'
                ? '我知道了'
                : errorCancelLabel,
            action: () => {
              this.setState({alertBox: null});
              this.dispatch({
                type: 'chatboxModel/updateState',
                payload: {
                  followOrderAlert: null,
                },
              });
            },
          },
          submit: {
            label:
              followOrderAlert.status === 'success'
                ? '查看订单'
                : errorSubmitLabel,
            action: () => {
              this.setState({alertBox: null});
              this.dispatch({
                type: 'chatboxModel/updateState',
                payload: {
                  followOrderAlert: null,
                },
              });
              if (followOrderAlert.status === 'success') {
                this.redirectToPage('orderRecord');
              } else if (typeof errorSubmitAction === 'function') {
                errorSubmitAction();
              }
            },
          },
        },
      });
    }

    if (errMsg && errMsg !== prevErrMsg) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        alertBox: {
          title: '温馨提示',
          desc: errMsg,
          submit: {
            action: () => {
              this.dispatch({
                type: 'chatboxModel/updateState',
                payload: {
                  errMsg: null,
                },
              });
              this.setState({alertBox: null});
            },
          },
        },
      });
    }
  }

  redirectToPage = profileSelectedNav => {
    this.dispatch({
      type: 'layoutModel/updateState',
      payload: {
        profileSelectedNav,
      },
    });
    this.dispatch(routerRedux.push({pathname: '/user'}));
  };

  resetChatFrame = () => {
    this.setState({
      ...this.INITIAL_STATE,
    });
  };

  handleChatboxSwitchChange = () => {
    if (this.state.ws) {
      this.state.ws.close();
    }

    this.setState({
      alertBox: {
        desc: '聊天室服务已关闭',
        submit: {
          action: () => {
            this.dispatch({
              type: 'chatboxModel/chatboxSwitchChange',
            });
            this.setState({alertBox: null});
          },
        },
      },
    });
  };

  connectChatWebSocket = () => {
    const {
      chatboxData: {chatToken, selectedRoom},
      appData,
    } = this.props;

    const {ws} = this.state;

    const domain = getChatDomain(appData);

    if (ws) {
      ws.close();
    }

    const websocket = new WebSocket(
      `wss://${domain}/ws/v1/socket?room_id=${
        selectedRoom.roomId
      }&token=${chatToken}`,
    );

    websocket.onopen = () => {
      console.log('connected chatroom websocket');
      this.setState({ws: websocket, chatLoading: false});
    };

    websocket.onmessage = evt => {
      const message = JSON.parse(evt.data);
      const newMessage = chatboxMassageData(
        message,
        selectedRoom,
        this.dispatch,
        this.handleChatboxSwitchChange,
      );
      this.setState(prevState => ({
        messages: [...prevState.messages, newMessage],
      }));
    };

    websocket.onerror = err => {
      console.error('websocket error: ', err);
      websocket.close();
      this.setState({
        alertBox: {
          title: '温馨提示',
          desc: `目前您还没有权限进入${selectedRoom.roomName}`,
          submit: {
            action: () => {
              const {prevSelectedRoom} = this.props.chatboxData;
              this.dispatch({
                type: 'chatboxModel/updateState',
                payload: {
                  selectedRoom: prevSelectedRoom,
                },
              });
              this.setState({alertBox: null});
            },
          },
        },
      });
    };

    websocket.onclose = e => {
      console.log('disconnected chatroom websocket ', e);
    };
  };

  closeChatbox = () => {
    this.dispatch({
      type: 'chatboxModel/triggerShowChatbox',
      payload: {
        showChatbox: false,
        expandChatbox: false,
      },
    });
  };

  expandChatbox = () => {
    const {chatboxData} = this.props;
    this.dispatch({
      type: 'chatboxModel/updateState',
      payload: {
        expandChatbox: !chatboxData.expandChatbox,
      },
    });
  };

  onNavClick = () => {
    this.setState(prevState => ({
      showRoomList: !prevState.showRoomList,
    }));
  };

  onSelectRoom = roomId => {
    const {
      chatboxData: {allRooms, selectedRoom},
    } = this.props;

    if (roomId === selectedRoom.roomId) {
      this.setState({
        showRoomList: false,
      });
      return;
    }

    const selectRoom = allRooms.find(room => room.roomId === roomId);

    this.setState({
      alertBox: {
        desc: `确定转到${selectRoom.roomName}聊天室房间吗？`,
        cancel: {
          label: '取消',
          action: () => this.setState({alertBox: null}),
        },
        submit: {
          label: '确定',
          action: () => this.onSelectRoomConfirm(selectRoom),
        },
      },
      showRoomList: false,
    });
  };

  onSelectRoomConfirm = roomObj => {
    const {selectedRoom} = this.props.chatboxData;
    this.dispatch({
      type: 'chatboxModel/updateState',
      payload: {
        prevSelectedRoom: selectedRoom,
        selectedRoom: roomObj,
      },
    });
    this.setState({
      alertBox: null,
      messages: [],
    });
  };

  closeFullScreenImage = () => {
    this.dispatch({
      type: 'chatboxModel/updateState',
      payload: {
        showFullScreenImage: null,
      },
    });
  };

  render() {
    const {
      chatboxData: {
        showChatbox,
        expandChatbox,
        followOrderData,
        chatLoading: chatboxLoading,
        showFullScreenImage,
      },
    } = this.props;
    const {chatLoading, showRoomList, alertBox, messages} = this.state;

    return (
      <div
        id="chatboxWindow"
        className={classnames(
          css.chatbox,
          !showChatbox && css.closeChatbox,
          expandChatbox && css.expandChatbox,
          // hideChatboxElement && css.hideChatbox,
        )}>
        {/* THIS IS TOP BAR */}
        <div className={css.topbarContainer}>
          <div>
            <SVG className={css.chatroom_icon} src={chatboxIcon} />
            聊天室
          </div>

          <div>
            <button
              type="button"
              onClick={this.expandChatbox}
              className={css.chatboxIconBtn}>
              <SVG
                className={css.svg_icon}
                src={expandChatbox ? shrinkIcon : expandIcon}
              />
            </button>
            <button
              type="button"
              onClick={this.closeChatbox}
              className={css.chatboxIconBtn}>
              <SVG className={css.svg_icon} src={closeIcon} />
            </button>
          </div>
        </div>

        <div className={css.chatBody}>
          <ChatboxNavbar
            onNavClick={this.onNavClick}
            showRoomList={showRoomList}
          />
          <ChatFrame messages={messages} />
          {showRoomList && <ChatboxRoomList onSelectRoom={this.onSelectRoom} />}
          {followOrderData && <ChatboxBetDetailsPopUp />}
          {alertBox && <ChatboxAlert alertObj={alertBox} />}
          {(chatLoading || chatboxLoading) && (
            <div className={css.loadingDiv}>
              <Spin
                size="large"
                tip="正在加载页面..."
                className={css.loading}
              />
            </div>
          )}
        </div>
        {showFullScreenImage && (
          <ChatboxImageView
            imageURL={showFullScreenImage}
            closeFullScreenImage={this.closeFullScreenImage}
          />
        )}
      </div>
    );
  }
}

const mapStatesToProps = ({userModel, chatboxModel, appModel}) => {
  return {
    appData: appModel,
    userData: userModel,
    chatboxData: chatboxModel,
  };
};

export default connect(mapStatesToProps)(ChatboxWindow);
