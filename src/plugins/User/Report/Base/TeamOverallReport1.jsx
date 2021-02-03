import React from 'react';
import resolve from 'clientResolver';
import userCSS from 'styles/User/User.less';

const StatisticsReport = resolve.plugin('StatisticsReport');

const TeamOverallReport = () => (
  <div className={userCSS.content_body}>
    <StatisticsReport dataUrl="getTeamOverallReport" reportType="team" />
  </div>
);

export default TeamOverallReport;
