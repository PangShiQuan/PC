import React, {PureComponent} from 'react';
import {map, find, pick, mapValues} from 'lodash';
import {connect} from 'dva';
import ClipboardButton from 'react-clipboard.js';
import {Tooltip} from 'antd';
import OptionButton from 'components/User/Form/OptionButton';
import css from 'styles/User/TradingCenter/Recharge.less';
import SVG from 'react-inlinesvg';
import leftArrow from 'assets/image/User/ic-angel-last.svg';
import rightArrow from 'assets/image/User/ic-angel-next.svg';

class PaymentMethods extends PureComponent {
  BUTTON_DIRECTION = {
    Left: 'left',
    Right: 'right',
  };

  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
    this.state = {
      tooltipText: '点我复制到剪贴板',
    };
  }

  componentDidMount() {
    const {list} = this.props;
    if (list && list.length > 0) {
      this.defaultSelection();
    }
    this.dragFunction();
  }

  componentDidUpdate(prevProps) {
    const {list: prevList} = prevProps;
    const {list} = this.props;
    if (list && list.length > 0 && prevList !== list) {
      this.defaultSelection();
    }
  }

  defaultSelection = () => {
    const {list} = this.props;
    const isVIP = find(list, item => item.type === 'VIP');
    if (!isVIP) {
      this.onClick(list[0]);
    }
  };

  onClick = data => {
    const {selectedTopupGroup} = this.props;
    if (selectedTopupGroup === 'BANK') {
      this.onPaymentBankClick(data);
    } else if (selectedTopupGroup === 'TAGENT') {
      this.ontagentClick(data);
    } else if (data.isOdd) {
      this.onPaymentOddClick(data);
    } else {
      this.onPaymentClick(data);
    }
  };

  onCopySuccess = () => {
    this.setState({tooltipText: '复制成功！'});
  };

  onToolTipVisibleChange = () => {
    this.setState({tooltipText: '点我复制到剪贴板'});
  };

  renderItems = () => {
    const {list, selectedTopupGroup} = this.props;
    const isVIP = find(list, item => item.type === 'VIP');

    return map(list, (option, index) => {
      const {
        paymentId,
        merchantName,
        adminBankId,
        bankName,
        receiptName,
        methodName,
        methodInfo,
        id, // new VIP
        nickname, // new VIP
        paymentMethod, // new VIP
      } = option;

      const btnActive =
        adminBankId === this.props.paymentId ||
        paymentId === this.props.paymentId ||
        adminBankId === this.props.adminBankId ||
        id === this.props.paymentId;

      let desc;
      if (isVIP) {
        desc = `${methodName}: ${methodInfo}`;
      } else {
        desc = receiptName || '-';
      }

      if (isVIP) {
        const {tooltipText} = this.state;
        return (
          <OptionButton
            key={index}
            style={{
              textAlign: 'left',
              margin: '10px 20px',
              padding: '14px 30px',
              height: '78px',
              width: '285px',
            }}>
            <div className={css.vip_button}>
              <div style={{width: '144px'}}>
                <div className={css.title}>{bankName || merchantName}</div>
                <div className={css.description}>{desc}</div>
              </div>
              <div>
                <ClipboardButton
                  className={css.clipboard_button}
                  onSuccess={this.onCopySuccess}
                  data-clipboard-text={methodInfo}>
                  <Tooltip
                    title={tooltipText}
                    onVisibleChange={this.onToolTipVisibleChange}>
                    复制账号
                  </Tooltip>
                </ClipboardButton>
              </div>
            </div>
          </OptionButton>
        );
      }

      let title = bankName || merchantName;
      let description = desc;

      if (selectedTopupGroup === 'TAGENT') {
        title = nickname;
        description = paymentMethod;
      }

      return (
        <OptionButton
          key={index}
          checked={btnActive}
          style={{
            textAlign: 'left',
            margin: '10px 12px',
            padding: '14px 30px',
            height: '78px',
            width: '285px',
          }}
          onClick={() => this.onClick(option)}>
          <div className={css.recommended}>推荐</div>
          <div className={css.title}>{title}</div>
          <div className={css.description}>{description}</div>
        </OptionButton>
      );
    });
  };

  initializeTopupStatus = () => {
    this.dispatch({
      type: 'transferModel/initializeState',
      payload: [
        'adminBankId',
        'amount',
        'bankCardNo',
        'bankTopupQuery',
        'bankTopupResponse',
        'bankTypeList',
        'data',
        'dataImg',
        'dataImgUrl',
        'isBankTransfer',
        'maxAmount',
        'minAmount',
        'topupAmount',
        'merchantName',
        'fixedAmount',
        'oddObject',
        'paymentBankList',
        'paymentId',
        'paymentJumpTypeEnum',
        'paymentMethod',
        'paymentPlatformCode',
        'paymentPlatformOrderNo',
        'paymentType',
        'remainQuota',
        'topupRemarks',
        'topupType',
        'transactionId',
        'transferNo',
        'webview',
        'realNameReq',
        'userPrompt',
      ],
    });
    this.dispatch({
      type: 'formModel/initializeState',
      payload: [
        'bankAddress',
        'bankCardNo',
        'bankName',
        'bankValue',
        'cardNo',
        'cardType',
        'fixedAmount',
        'maxAmount',
        'minAmount',
        'mobileNo',
        'realName',
        'receiptName',
        'remarks',
        'responseMsg',
        'topupAmount',
        'topupCardRealname',
        'topupTime',
        'transferTopupType',
      ],
    });
  };

  onPaymentClick = ({
    dataImg,
    fixedAmount,
    maxAmount,
    merchantName,
    minAmount,
    paymentId,
    paymentType,
    platform,
    remarks,
    type,
    userPrompt,
    cardNoReq,
    mobileNoReq,
    realNameReq,
  }) => {
    this.initializeTopupStatus();
    const payload = {
      dataImg,
      isOdd: false,
      merchantName,
      paymentId,
      paymentType,
      platform,
      topupRemarks: remarks,
      topupType: type,
      userPrompt,
      isBankTransfer: false,
      realNameReq: null,
    };
    const formPayload = {
      fixedAmount,
      cardNoReq,
      mobileNoReq,
      realNameReq,
      minAmount: minAmount >= 0 ? minAmount : undefined,
      maxAmount,
    };
    this.dispatch({
      type: 'formModel/updateState',
      payload: formPayload,
    });
    this.dispatch({
      type: 'transferModel/getPaymentBankList',
      payload,
    });
  };

  ontagentClick = ({id}) => {
    this.initializeTopupStatus();
    const payload = {
      paymentId: id,
    };
    this.dispatch({
      type: 'transferModel/getPaymentBankList',
      payload,
    });
  };

  onPaymentOddClick = oddObject => {
    this.initializeTopupStatus();
    this.dispatch({
      type: 'transferModel/updateOddTransferInfo',
      payload: oddObject,
    });

    const {minAmount, maxAmount} = oddObject;
    const formPayload = {
      cardNoReq: null,
      mobileNoReq: null,
      realNameReq: null,
      minAmount: minAmount >= 0 ? minAmount : undefined,
      maxAmount,
    };
    this.dispatch({
      type: 'formModel/updateState',
      payload: formPayload,
    });
  };

  onPaymentBankClick = bankOption => {
    const {
      adminBankId,
      remarks,
      remainQuota,
      receiptName,
      fixedAmount,
      minAmount,
      maxAmount,
      realNameReq,
    } = bankOption;
    this.initializeTopupStatus();
    const neededFormData = pick(bankOption, [
      'bankAddress',
      'bankCardNo',
      'bankName',
      'receiptName',
      'remarks',
    ]);
    const formValues = mapValues(neededFormData, value => ({value}));
    const formPayload = {
      fixedAmount,
      ...formValues,
      minAmount: minAmount >= 0 ? minAmount : undefined,
      maxAmount,
      cardNoReq: null,
      mobileNoReq: null,
    };
    this.dispatch({
      type: 'transferModel/updateState',
      payload: {
        adminBankId,
        topupRemarks: remarks,
        remainQuota,
        merchantName: receiptName,
        isBankTransfer: true,
        realNameReq,
      },
    });
    this.dispatch({
      type: 'formModel/updateState',
      payload: formPayload,
    });
  };

  onHorizontalButtonClick = direction => {
    const curPosition = document.querySelector('#paymentmethods').scrollLeft;
    const totalWidth = document.querySelector('#paymentmethods').scrollWidth;
    const endDistance = totalWidth - curPosition;
    if (direction === this.BUTTON_DIRECTION.Left) {
      document.querySelector('#paymentmethods').scrollLeft -=
        curPosition <= 150 ? curPosition : 150;
    } else {
      document.querySelector('#paymentmethods').scrollLeft +=
        endDistance <= 150 ? endDistance : 150;
    }
  };

  dragFunction = () => {
    const slider = document.querySelector('#paymentmethods');
    slider.style.cursor = 'grab';
    let isDown = false;
    let startX, leftScroll;

    slider.addEventListener('mousedown', e => {
      isDown = true;
      startX = e.pageX - slider.offsetLeft;
      leftScroll = slider.scrollLeft;
    });

    slider.addEventListener('mouseleave', e => {
      slider.style.cursor = 'grab';
      isDown = false;
    });

    slider.addEventListener('mouseup', e => {
      slider.style.cursor = 'grab';
      isDown = false;
    });

    slider.addEventListener('mousemove', e => {
      if (!isDown) return;

      e.preventDefault();
      slider.style.cursor = 'grabbing';
      const x = e.pageX - slider.offsetLeft;
      const walk = x - startX;
      slider.scrollLeft = leftScroll - walk;
    });
  };

  render() {
    return (
      <div className={css.paymentMethods}>
        <button
          type="button"
          className={css.horizontal_scroll_button}
          onClick={() =>
            this.onHorizontalButtonClick(this.BUTTON_DIRECTION.Left)
          }>
          <SVG className={css.svg_icon_arrow} src={leftArrow} />
        </button>
        <div id="paymentmethods" className={css.paymentMethods_container}>
          {this.renderItems()}
        </div>
        <button
          type="button"
          className={css.horizontal_scroll_button}
          onClick={() =>
            this.onHorizontalButtonClick(this.BUTTON_DIRECTION.Right)
          }>
          <SVG className={css.svg_icon_arrow} src={rightArrow} />
        </button>
      </div>
    );
  }
}

function mapStatesToProps({transferModel}) {
  const {
    adminBankId,
    paymentId,
    paymentList,
    bankList,
    topupGroups,
    selectedTopupGroup,
  } = transferModel;
  return {
    adminBankId,
    paymentId,
    paymentList,
    bankList,
    topupGroups,
    selectedTopupGroup,
  };
}
export default connect(mapStatesToProps)(PaymentMethods);
