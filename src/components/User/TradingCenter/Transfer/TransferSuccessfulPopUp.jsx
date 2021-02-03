import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {find} from 'lodash';
import {Modal} from 'antd';
import SVG from 'react-inlinesvg';
import doneIcon from 'assets/image/User/ic-done.svg';
import transferCSS from 'styles/User/TradingCenter/Transfer.less';
import userCSS from 'styles/User/User.less';

class TransferSuccessfulPopUp extends PureComponent {
  TRANSFER_TYPE = {
    Withdraw: 'Withdraw',
    TopUp: 'TopUp',
  };

  BETCENTER_PATH = '/betcenter';

  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
  }

  onPopUpCloseClick = () => {
    this.dispatch({
      type: 'playerModel/updateState',
      payload: {
        responseMsg: {
          title: '',
          content: '',
          gamePlatform: undefined,
          transferType: undefined,
        },
      },
    });
  };

  onSubmitClick = gamePath => {
    if (gamePath) {
      this.dispatch(
        routerRedux.push({
          pathname: gamePath,
        }),
      );
    }
    this.onPopUpCloseClick();
  };

  getGamePath = selectedGamePlatform => {
    let path;
    const game = selectedGamePlatform.gamePlatform;
    switch (selectedGamePlatform.platform) {
      case 'SPORT':
        path = `/sports/${game}`;
        break;
      case 'GAME':
        path = `/games/${game}`;
        break;
      case 'CARD':
        path = `/cards/${game}`;
        break;
      case 'REALI':
        path = `/realis/${game}`;
        break;
      default:
        break;
    }
    return path;
  };

  responseMessagePopUp = () => {
    const {
      responseMsg: {title, content, gamePlatform, transferType},
      gamePlatforms,
    } = this.props;

    const selectedGamePlatform = find(
      gamePlatforms,
      item => item.gamePlatform === gamePlatform,
    );

    let gamePath = this.BETCENTER_PATH;
    if (transferType === this.TRANSFER_TYPE.TopUp) {
      gamePath = this.getGamePath(selectedGamePlatform);
    }

    return (
      <div
        className={userCSS.content_body}
        style={{padding: '30px', borderRadius: '4px'}}>
        <div className={transferCSS.response_msg_popup}>
          <div>
            <SVG className={transferCSS.svg_icon_done} src={doneIcon} />
          </div>
          <div className={transferCSS.title}>{title}</div>
          <div className={transferCSS.content}>{content}</div>
          <div className={transferCSS.content}>
            <button
              type="button"
              className={transferCSS.modal_cancelButton}
              onClick={this.onPopUpCloseClick}>
              关闭
            </button>
            {gamePath && gamePath !== this.BETCENTER_PATH && (
              <button
                type="button"
                className={transferCSS.modal_submitButton}
                onClick={() => this.onSubmitClick(gamePath)}>
                前往{selectedGamePlatform.gameNameInChinese}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  render() {
    const {responseMsg} = this.props;
    return (
      <Modal
        visible={!!responseMsg.title}
        maskClosable={false}
        closable={false}
        footer={null}
        bodyStyle={{height: '239px'}}
        width="487px">
        {!!responseMsg.title && this.responseMessagePopUp()}
      </Modal>
    );
  }
}

const mapStatesToProps = ({playerModel}) => {
  const {responseMsg} = playerModel;

  return {
    responseMsg,
  };
};

export default connect(mapStatesToProps)(TransferSuccessfulPopUp);
