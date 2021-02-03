import React from 'react';
import resolve from 'clientResolver';
import userCSS from 'styles/User/User.less';

const StatisticsReport = resolve.plugin('StatisticsReport');

const PersonalReport = ({
  name = null,
  pagination = true,
  searchable = true,
} = {}) => {
  if (!name) throw new Error('请命名报表[name]属性的值.');

  return (
    <div className={userCSS.content_body}>
      <StatisticsReport
        dataUrl="getPersonalReport"
        reportType="personal"
        name={name}
        pagination={pagination}
        searchable={searchable}
      />
    </div>
  );
};

export default PersonalReport;
