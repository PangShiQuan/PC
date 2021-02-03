import React from 'react';
import css from 'styles/SosFund2/SosFundPopUp2.less';
import btnRule from 'assets/image/sosFund/btnRule.png';
import successBg from 'assets/image/sosFund/congmsgbox.png';
import failBg from 'assets/image/sosFund/sorrymsgbox.png';
import SVG from 'react-inlinesvg';
import closeIcon from 'assets/image/icn_close.svg';

const renderFailPopUp = ({
  ruleLink,
  requiredTopUpAmount,
  requiredLossAmount,
  popUpErrMsg,
}) => {
  return (
    <div className={css.wrapper}>
      <div className={css.title}>很抱歉</div>
      <div className={css.desc}>{popUpErrMsg}</div>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={ruleLink}
        className={css.ruleButton}>
        <img src={btnRule} alt="button" />
      </a>
      <div className={css.remark}>
        （充值差:{requiredTopUpAmount} 当日亏损:{requiredLossAmount}）
      </div>
    </div>
  );
};

const renderSuccessPopUp = ({receivedAmount}) => {
  return (
    <div className={css.wrapper}>
      <div className={css.titleSuccess}>恭喜您获得</div>
      <div className={css.descSuccess}>
        {receivedAmount} <span className={css.yuan}>元</span>
      </div>
    </div>
  );
};

const SosFundPopup = props => {
  const {
    closePopUp,
    ruleLink,
    requiredTopUpAmount,
    requiredLossAmount,
    successfulRedeem,
    popUpErrMsg,
    receivedAmount,
  } = props;

  return (
    <div className={css.masking}>
      <div
        className={css.container}
        style={{
          backgroundImage: `url(${successfulRedeem ? successBg : failBg})`,
        }}>
        {successfulRedeem
          ? renderSuccessPopUp({receivedAmount})
          : renderFailPopUp({
              ruleLink,
              requiredTopUpAmount,
              requiredLossAmount,
              popUpErrMsg,
            })}

        <button type="button" className={css.closeButton} onClick={closePopUp}>
          <SVG className={css.svg_icon} src={closeIcon} />
        </button>
      </div>
    </div>
  );
};

export default React.memo(SosFundPopup);
