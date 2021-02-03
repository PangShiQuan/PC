import React, {useState, useCallback, useEffect} from 'react';
import {connect} from 'dva';
import _ from 'lodash';
import tableCSS from 'styles/User/Form/Table.less';

const STATUS_TYPE = {
  RECEIVED: '已领取',
};

const SosFundReportTable = props => {
  const [displayData, setDisplayData] = useState();
  const {
    sosFundModel: {data},
  } = props;

  useEffect(() => {
    setDisplayData(data);
  }, [data]);

  const renderTableBody = useCallback(() => {
    if (displayData && displayData.length) {
      return _.map(displayData, (listItem, index) => {
        const {fundAmount, receivedTime, rewardStatus} = listItem;

        return (
          <tr key={index}>
            <td>{receivedTime}</td>
            <td>{fundAmount}</td>
            <td>{STATUS_TYPE[rewardStatus]}</td>
          </tr>
        );
      });
    }

    return (
      <tr>
        <td colSpan="100%">暂无数据</td>
      </tr>
    );
  }, [displayData]);

  return (
    <div className={tableCSS.table_container}>
      <table className={tableCSS.table}>
        <thead>
          <tr>
            <td>日期</td>
            <td>领取金额</td>
            <td>状态</td>
          </tr>
        </thead>
        <tbody>{renderTableBody()}</tbody>
      </table>
    </div>
  );
};

function mapStatesToProps({sosFundModel}) {
  return {
    sosFundModel,
  };
}

export default connect(mapStatesToProps)(SosFundReportTable);
