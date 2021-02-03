import React from 'react';
import css from 'styles/MissionCenter/mission.less';

const EmptySosFund = () => {
  return (
    <div className={css.wrapper}>
      <span className={css.empty_mission}>此活动暂时还未开启</span>
    </div>
  );
};

export default React.memo(EmptySosFund);
