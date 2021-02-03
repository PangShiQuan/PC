import React, {useState, useEffect, useCallback} from 'react';
import bannerCSS from 'styles/WelfareCenter/banner.less';
import css from 'styles/WelfareCenter/index.less';
import WelfareCenterNav from 'components/WelfareCenter/WelfareCenterNav';
import MissionLobby from 'components/MissionCenter/MissionLobby';
import SosFundLobby from 'components/SosFund2/SosFundLobby';
import {connect} from 'dva';
import ENUM_TABS from './enum_tabs';

const renderSelectedTab = tab => {
  let output = <div />;
  switch (tab) {
    case ENUM_TABS.SosFund:
      output = <SosFundLobby />;
      break;
    default:
      output = <MissionLobby />;
      break;
  }
  return output;
};

const WelfareCenter = props => {
  const [tab, setTab] = useState();
  const [bannerImage, setBannerImage] = useState();
  const {
    match: {params},
    history,
    pcPromotionTopImage,
    explainUrlPcMissionCenter,
    explainUrlPcSosFund,
  } = props;

  useEffect(() => {
    if (!params.type) {
      history.push(`/welfarecenter/mission`);
    } else {
      setTab(
        params.type === 'sosfund' ? ENUM_TABS.SosFund : ENUM_TABS.MissionCenter,
      );
    }
  }, [params]);

  useEffect(() => {
    if (!pcPromotionTopImage) {
      props.dispatch({type: 'promotionsModel/getSpecialOfferList'});
    } else {
      setBannerImage(pcPromotionTopImage);
    }
  }, [pcPromotionTopImage]);

  const setSelectedTab = useCallback(selectedTab => {
    let param = '';
    switch (selectedTab) {
      case ENUM_TABS.SosFund:
        param = 'sosfund';
        break;
      default:
        param = 'mission';
        break;
    }
    props.history.push(`/welfarecenter/${param}`);
  }, []);

  return (
    <div className={css.wrapper}>
      <div
        className={bannerCSS.banner}
        style={
          bannerImage && {
            background: `url(${bannerImage}) center / 100% 100% no-repeat`,
          }
        }
      />
      {tab === ENUM_TABS.MissionCenter && explainUrlPcMissionCenter && (
        <div className={css.missionInstruction}>
          <a
            className={css.instructionLinkButton}
            target="_blank"
            rel="noopener noreferrer"
            href={explainUrlPcMissionCenter}>
            任务说明
          </a>
        </div>
      )}
      {tab === ENUM_TABS.SosFund && explainUrlPcSosFund && (
        <div className={css.missionInstruction}>
          <a
            className={css.instructionLinkButton}
            target="_blank"
            rel="noopener noreferrer"
            href={explainUrlPcSosFund}>
            救济金说明
          </a>
        </div>
      )}
      <div className={css.container}>
        <WelfareCenterNav
          tab={tab}
          tabClick={selectedTab => setSelectedTab(selectedTab)}
        />
        {renderSelectedTab(tab)}
      </div>
    </div>
  );
};

function mapStatetoProps({promotionsModel, missionCenterModel, sosFundModel}) {
  const {pcPromotionTopImage} = promotionsModel;
  const {explainUrlPc: explainUrlPcMissionCenter} = missionCenterModel;
  const {explainUrlPc: explainUrlPcSosFund} = sosFundModel;

  return {pcPromotionTopImage, explainUrlPcMissionCenter, explainUrlPcSosFund};
}

export default connect(mapStatetoProps)(WelfareCenter);
