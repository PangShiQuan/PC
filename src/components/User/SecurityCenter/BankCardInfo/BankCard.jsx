import React, {Component} from 'react';
import {Tooltip} from 'antd';
import css from 'styles/User/SecurityCenter/BankCardInfo.less';
import SVG from 'react-inlinesvg';
import eyeOpenIcon from 'assets/image/User/ic-user center-eye-open.svg';
import eyeCloseIcon from 'assets/image/User/ic-user center-eye-close.svg';
import bankCardImage1 from 'assets/image/User/BankCard/card_1.png';
import bankCardImage2 from 'assets/image/User/BankCard/card_2.png';
import bankCardImage3 from 'assets/image/User/BankCard/card_3.png';
import bankCardImage4 from 'assets/image/User/BankCard/card_4.png';
import bankCardImage5 from 'assets/image/User/BankCard/card_5.png';
import bankCardImage6 from 'assets/image/User/BankCard/card_6.png';
import bankCardImage7 from 'assets/image/User/BankCard/card_7.png';
import bankCardImage8 from 'assets/image/User/BankCard/card_8.png';
import bankCardImage9 from 'assets/image/User/BankCard/card_9.png';
import bankCardImage10 from 'assets/image/User/BankCard/card_10.png';

const bankCardBG = {
  bankCardImage1,
  bankCardImage2,
  bankCardImage3,
  bankCardImage4,
  bankCardImage5,
  bankCardImage6,
  bankCardImage7,
  bankCardImage8,
  bankCardImage9,
  bankCardImage10,
};
class BankCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showNo: false,
    };
  }

  render() {
    const {showNo} = this.state;
    const {image, title, cardNo, name, address, imageNo} = this.props;
    const displayCardNo = showNo
      ? cardNo
      : `${cardNo.substr(0, 4)}*****${cardNo.substr(-4)}`;

    return (
      <div
        className={css.card}
        style={{
          backgroundImage: `url(${bankCardBG[`bankCardImage${imageNo}`]})`,
        }}>
        <div
          className={css.bankLogo}
          style={{
            background: `url(${image})`,
            backgroundSize: '60px',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
          }}
        />
        <div>
          <div className={css.card_title}>{title}</div>
          <div className={css.card_details}>
            <div className={css.card_cardNo_div}>
              <div className={css.card_cardNo}>
                {showNo ? (
                  <Tooltip placement="topLeft" title={displayCardNo}>
                    {displayCardNo}
                  </Tooltip>
                ) : (
                  displayCardNo
                )}
              </div>
              <button
                type="button"
                onClick={() =>
                  this.setState(prevState => {
                    return {
                      showNo: !prevState.showNo,
                    };
                  })
                }>
                <SVG
                  src={showNo ? eyeCloseIcon : eyeOpenIcon}
                  className={css.svg_icon}
                />
              </button>
            </div>
            <div>{name}</div>
            <div>{address}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default BankCard;
