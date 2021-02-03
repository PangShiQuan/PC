import React, {useState, useEffect, useCallback, useMemo} from 'react';
import css from 'styles/MissionCenter/missionLobby.less';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import _ from 'lodash';
import Mission from './Mission';
import EmptyMission from './EmptyMission';

const ENUM_TAB_NAME = {
  DAILY: '日常任务',
  WEEKLY: '每周任务',
};

const ENUM_PLAN_TYPE = {
  TOPUP: 'TOPUP',
  BET: 'BET',
};

const MissionLobby = props => {
  const {missionCenterModel} = props;
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [selectedTab, setSelectedTab] = useState();

  useEffect(() => {
    props.dispatch({type: 'missionCenterModel/getTaskPlanRewards'});
  }, []);

  useEffect(() => {
    setLoading(_.isNull(missionCenterModel.taskPlanRewards));
    if (initialLoad && missionCenterModel.taskPlanRewards) {
      if (missionCenterModel.enableDailyTask) {
        setSelectedTab('DAILY');
      } else if (missionCenterModel.enableWeeklyTask) {
        setSelectedTab('WEEKLY');
      }
      setInitialLoad(false);
    }
  }, [missionCenterModel, initialLoad]);

  useEffect(() => {
    if (missionCenterModel.msg) {
      setTimeout(() => {
        props.dispatch({
          type: 'missionCenterModel/updateState',
          payload: {msg: null},
        });
      }, 3000);
    }
  }, [missionCenterModel.msg]);

  const redeemReward = useCallback((planType, taskReward) => {
    if (taskReward) {
      const {id} = taskReward;
      props.dispatch({
        type: 'missionCenterModel/redeemReward',
        payload: {id, selectedTab},
      });
    } else if (planType === ENUM_PLAN_TYPE.TOPUP) {
      props.dispatch({
        type: 'layoutModel/updateState',
        payload: {
          profileSelectedNav: 'topupCtrl',
        },
      });
      props.dispatch(routerRedux.push({pathname: '/user'}));
    } else if (planType === ENUM_PLAN_TYPE.BET) {
      props.dispatch(routerRedux.push({pathname: '/betcenter'}));
    }
  }, [selectedTab]);

  const isDisabledTab = useCallback(tabName => {
    const {enableDailyTask, enableWeeklyTask} = missionCenterModel;
    let isDisabled = false;
    switch (tabName) {
      case 'DAILY':
        isDisabled = !enableDailyTask;
        break;
      case 'WEEKLY':
        isDisabled = !enableWeeklyTask;
        break;
      default:
        break;
    }
    return isDisabled;
  }, [missionCenterModel]);

  return (
    <div className={css.body}>
      {loading ? (
        <div className={css.loading}>努力加载中。。。</div>
      ) : (
        <React.Fragment>
          {missionCenterModel &&
          !missionCenterModel.userBlacklisted &&
          (missionCenterModel.taskPlanRewards.DAILY.length > 0 ||
            missionCenterModel.taskPlanRewards.WEEKLY.length > 0) ? (
            <React.Fragment>
              <div className={css.sub_nav}>
                {_.map(Object.keys(ENUM_TAB_NAME), tabName => {
                  if (missionCenterModel.taskPlanRewards[tabName]) {
                    return (
                      <button
                        type="button"
                        key={tabName}
                        data-active={selectedTab === tabName}
                        disabled={isDisabledTab(tabName)}
                        onClick={() => setSelectedTab(tabName)}>
                        {ENUM_TAB_NAME[tabName]}
                      </button>
                    );
                  }
                })}
              </div>
              <div className={css.main}>
                {missionCenterModel.taskPlanRewards &&
                  _.map(
                    missionCenterModel.taskPlanRewards[selectedTab],
                    (data, index) => (
                      <Mission
                        key={index}
                        data={data}
                        redeemReward={redeemReward}
                      />
                    ),
                  )}
              </div>
            </React.Fragment>
          ) : (
            <EmptyMission />
          )}
        </React.Fragment>
      )}
      {missionCenterModel.msg && (
        <div className={css.alertMsg}>{missionCenterModel.msg}</div>
      )}
    </div>
  );
};

const mapStatesToProps = ({missionCenterModel}) => {
  return {
    missionCenterModel,
  };
};

export default React.memo(connect(mapStatesToProps)(MissionLobby));
