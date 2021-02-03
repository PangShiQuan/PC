import React from 'react';
import css from 'styles/MissionCenter/mission.less';

const EmptyMission = () => {
  return (
    <div className={css.wrapper}>
      <span className={css.empty_mission}>
        暂时无任务，请继续关注新任务噢。
      </span>
    </div>
  );
};

export default React.memo(EmptyMission);
