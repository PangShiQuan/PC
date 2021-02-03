import React from 'react';
import css from 'styles/WelfareCenter/index.less';
import ENUM_TABS from './enum_tabs';

const WelfareCenterNav = props => {
  const {tab, tabClick} = props;
  return (
    <div className={css.navigation}>
      <button
        type="button"
        className={css.nav_button}
        data-active={tab === ENUM_TABS.MissionCenter}
        onClick={() => tabClick(ENUM_TABS.MissionCenter)}>
        任务大厅
      </button>
      <button
        type="button"
        className={css.nav_button}
        data-active={tab === ENUM_TABS.SosFund}
        onClick={() => tabClick(ENUM_TABS.SosFund)}>
        救济金
      </button>
    </div>
  );
};

export default React.memo(WelfareCenterNav);
