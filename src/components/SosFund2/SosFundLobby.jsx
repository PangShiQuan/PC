import React, {useState, useEffect, useCallback} from 'react';
import SosFundPopUp from 'components/SosFund2/SosFundPopUp2';
import EmptySosFund from 'components/SosFund2/EmptySosFund';
import css from 'styles/SosFund2/sos.less';
import {connect} from 'dva';
import {MDIcon} from 'components/General';

const SosFundLobby = props => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [iframeHeight, setIframeHeight] = useState();
  const {sosFundModel} = props;

  const applySos = useCallback(() => {
    props.dispatch({type: 'sosFundModel/redeemSosFundReward'});
  }, []);

  const closePopUp = useCallback(() => {
    props.dispatch({
      type: 'sosFundModel/updateState',
      payload: {successfulRedeem: null},
    });
  }, []);

  const handleArrowButton = useCallback(event => {
    event.stopPropagation();
    setExpanded(!expanded);
  }, [expanded]);

  const setContentHeight = useCallback(event => {
    if (event.data && event.data.height) {
      setIframeHeight(event.data.height + 21);
    }
  }, []);

  useEffect(() => {
    props.dispatch({type: 'sosFundModel/getSosFundRewards'});
    window.addEventListener('message', setContentHeight);
    return () => {
      window.removeEventListener('message', setContentHeight);
    };
  }, []);

  useEffect(() => {
    if (props.sosFundModel.enableSosFund !== null) {
      setLoading(false);
    }
  }, [props.sosFundModel]);

  return (
    <React.Fragment>
      {loading ? (
        <div className={css.loading}>努力加载中。。。</div>
      ) : (
        <React.Fragment>
          {sosFundModel.enableSosFund && !sosFundModel.userBlacklisted ? (
            <React.Fragment>
              <div
                role="button"
                tabIndex="0"
                className={css.banner}
                style={{backgroundImage: `url(${sosFundModel.imageUrl}`}}
                onKeyPress={() => {}}
                onClick={applySos}>
                <div className={css.remark}>
                  <span>（充值差:{sosFundModel.requiredTopUpAmount}</span>
                  <span>
                    当日亏损:
                    {sosFundModel.requiredLossAmount}）
                  </span>
                </div>
                <button
                  type="button"
                  className={css.arrowButton}
                  onClick={handleArrowButton}
                  data-rotated={expanded}>
                  <MDIcon
                    className={css.downArrowIcon}
                    iconName="chevron-down"
                  />
                </button>
              </div>
              <div className={css.contentBox} data-expanded={expanded}>
                <div className={css.contentBoxTitle}>{sosFundModel.title}</div>
                {sosFundModel.content ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: sosFundModel.content,
                    }}
                  />
                ) : (
                  <div
                    className={css.iframeDiv}
                    style={{height: expanded ? iframeHeight : 0}}>
                    <iframe
                      title="Sos Iframe"
                      src={sosFundModel.promotionUrl}
                      // referrerPolicy="strict-origin-when-cross-origin"
                      // sandbox={
                      //   ['activity', 'promotion'].some(el =>
                      //     photoWeb.includes(el),
                      //   ) // 管端设置的优惠活动详情地址含有此字段, 有点不靠谱
                      //     ? `allow-scripts allow-same-origin ${commonAttr}`
                      //     : commonAttr
                      // }
                      // onLoad={this.onContentLoad}
                      // allowFullScreen
                      className={css.iframe}
                    />
                  </div>
                )}
              </div>
              {sosFundModel.successfulRedeem !== null && (
                <SosFundPopUp
                  closePopUp={closePopUp}
                  ruleLink={sosFundModel.explainUrlPc}
                  requiredTopUpAmount={sosFundModel.requiredTopUpAmount}
                  requiredLossAmount={sosFundModel.requiredLossAmount}
                  successfulRedeem={sosFundModel.successfulRedeem}
                  popUpErrMsg={sosFundModel.popUpErrMsg}
                  receivedAmount={
                    sosFundModel.sosFundReward
                      ? sosFundModel.sosFundReward.fundAmount
                      : 0
                  }
                />
              )}
            </React.Fragment>
          ) : (
            <EmptySosFund />
          )}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

const mapStatesToProps = ({sosFundModel}) => {
  return {
    sosFundModel,
  };
};

export default React.memo(connect(mapStatesToProps)(SosFundLobby));
