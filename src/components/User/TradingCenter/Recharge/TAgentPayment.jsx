import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {find, map} from 'lodash';
import ClipboardButton from 'react-clipboard.js';
import {Tooltip, Modal} from 'antd';
import css from 'styles/User/TradingCenter/Recharge.less';
import ContentContainer from 'components/User/ContentContainer';
import {CUSTOM_LIVECHAT_TRIGGER} from 'config';

const {confirm} = Modal;

class TAgentPayment extends PureComponent {
  LABEL_WIDTH = '90px';

  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
    this.state = {
      tooltipText: '点我复制到剪贴板',
    };
  }

  onCopySuccess = () => {
    this.setState({tooltipText: '复制成功！'});
  };

  onCopySuccessAndOpen = name => {
    this.setState({tooltipText: '复制成功！'});
    if (name === 'WECHAT') {
      window.open('https://web.wechat.com/');
    } else if (name === 'QQ') {
      window.open('https://www.imqq.com/index.html');
    } else if (name === 'ALIPAY') {
      window.open('https://www.alipay.com/');
    }
  };

  onToolTipVisibleChange = () => {
    this.setState({tooltipText: '点我复制到剪贴板'});
  };

  showConfirm = () => {
    const {pcOtherInfo, topupAgentAnnouncement} = this.props;
    const title = topupAgentAnnouncement
      ? topupAgentAnnouncement.reportPriceTitle
      : '';
    const desc = topupAgentAnnouncement
      ? topupAgentAnnouncement.reportPriceDesc
      : '';

    confirm({
      width: '420px',
      title: '举报有奖',
      content: (
        <div>
          <div style={{marginBottom: '6px'}}>{title}</div>
          <div>{desc}</div>
        </div>
      ),
      onOk() {
        window.open(pcOtherInfo.onlineServiceUrl);
      },
      onCancel() {},
      okText: '我要举报',
      className: css.confirm_popup,
    });
  };

  renderRemarks = () => {
    const {tooltipText} = this.state;
    const {pcOtherInfo, id} = this.props;
    const csLiveChatProps = {};
    if(CUSTOM_LIVECHAT_TRIGGER){
      csLiveChatProps.onClick = CUSTOM_LIVECHAT_TRIGGER;
    }else{
      csLiveChatProps.href = pcOtherInfo.onlineServiceUrl;
      csLiveChatProps.target="_blank";
    }
    return (
      <div className={css.tagent_remarkRow}>
        您选择的充值方式（如有问题，请联系
          <a
            {...csLiveChatProps}
            rel="noopener noreferrer"
            className={css.link}>
            在线客服
          </a>
        ）
        <button
          type="button"
          className={css.button}
          onClick={this.showConfirm}
          style={{display: 'inline-block'}}>
          举报有奖
        </button>
        <div className={css.id}>
          用户ID: {id}{' '}
          <Tooltip
            title={tooltipText}
            onVisibleChange={this.onToolTipVisibleChange}>
            <div className={css.buttonContainer}>
              <ClipboardButton
                className={css.button}
                onSuccess={this.onCopySuccess}
                data-clipboard-text={id}>
                复制
              </ClipboardButton>
            </div>
          </Tooltip>
        </div>
      </div>
    );
  };

  renderContactMethods = () => {
    const {tooltipText} = this.state;
    const {list, paymentId} = this.props;
    const selectedMethod = find(list, item => item.id === paymentId);
    if (
      selectedMethod &&
      selectedMethod.contactMethodDetailList &&
      selectedMethod.contactMethodDetailList.length > 0
    ) {
      const output = map(selectedMethod.contactMethodDetailList, item => {
        return (
          <div key={item.value} className={css.tagent_contactMethod}>
            <div className={css.label}>
              <div>{item.chineseName}</div>
              <div className={css.value}>{item.value}</div>
            </div>
            <div>
              <Tooltip
                title={tooltipText}
                onVisibleChange={this.onToolTipVisibleChange}>
                <div style={{display: 'inline'}}>
                  <ClipboardButton
                    className={css.copyButton}
                    onSuccess={() => this.onCopySuccessAndOpen(item.name)}
                    data-clipboard-text={item.value}>
                    复制并打开
                  </ClipboardButton>
                </div>
              </Tooltip>
            </div>
          </div>
        );
      });
      return output;
    }

    return <div>没有数据</div>;
  };

  render() {
    const {topupAgentAnnouncement} = this.props;
    return (
      <React.Fragment>
        {topupAgentAnnouncement && topupAgentAnnouncement.vipTopUpDesc && (
          <div className={css.tagent_marqueeContainer}>
            <div className={css.announcement}>
              {topupAgentAnnouncement.vipTopUpDesc}
            </div>
          </div>
        )}
        <ContentContainer
          title={this.renderRemarks()}
          titleStyle={{marginBottom: '25px'}}>
          <div className={css.contactMethodsContainer}>
            {this.renderContactMethods()}
          </div>
        </ContentContainer>
      </React.Fragment>
    );
  }
}

function mapStatesToProps({gameInfosModel, transferModel, userModel}) {
  const {pcOtherInfo} = gameInfosModel;
  const {paymentId, topupAgentAnnouncement} = transferModel;
  const {id} = userModel;
  return {
    pcOtherInfo,
    paymentId,
    id,
    topupAgentAnnouncement,
  };
}
export default connect(mapStatesToProps)(TAgentPayment);
