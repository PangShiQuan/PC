import React, {useState, useCallback, useEffect} from 'react';
import {connect} from 'dva';
import _ from 'lodash';
import tableCSS from 'styles/User/Form/Table.less';
import SVG from 'react-inlinesvg';
import arrowUpIcon from 'assets/image/User/ic-btn-transfer-active-up.svg';
import arrowDownIcon from 'assets/image/User/ic-btn-transfer-active-down.svg';

const ENUM_TAB_NAME = {
  DAILY: '日常任务',
  WEEKLY: '每周任务',
};

const MissionReportTable = props => {
  const [sorting, setSorting] = useState();
  const [displayData, setDisplayData] = useState();
  const {
    missionCenterModel: {data},
  } = props;

  useEffect(() => {
    setDisplayData(data);
  }, [data]);

  const onSortChange = useCallback(direction => {
    if (sorting === direction) {
      setSorting('');
      setDisplayData(_.orderBy(displayData, ['receivedTime'], ['desc']));
    } else {
      setSorting(direction);
      setDisplayData(
        _.orderBy(
          displayData,
          ['rewardAmount', 'receivedTime'],
          [sorting === 'down' ? 'desc' : 'asc', 'desc'],
        ),
      );
    }
  }, [displayData]);

  const renderTableBody = useCallback(() => {
    if (displayData && displayData.length) {
      return _.map(displayData, (listItem, index) => {
        const {
          planAmount,
          planType,
          receivedTime,
          rewardAmount,
          taskRewardId,
          type,
        } = listItem;

        return (
          <tr key={`${taskRewardId}_${index}`}>
            <td>{receivedTime}</td>
            <td>{ENUM_TAB_NAME[type]}</td>
            <td>
              {planType === 'TOPUP' ? '充值 ' : '投注 '}
              {planAmount}元金额
            </td>
            <td data-color="red">{rewardAmount} 元</td>
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
            <td>类别</td>
            <td>任务</td>
            <td>
              <i style={{marginRight: '0.5rem'}}>金额</i>
              <button type="button" onClick={() => onSortChange('up')}>
                <SVG
                  src={arrowUpIcon}
                  className={
                    sorting === 'up'
                      ? tableCSS.sort_icon_active
                      : tableCSS.sort_icon
                  }
                />
              </button>
              <button type="button" onClick={() => onSortChange('down')}>
                <SVG
                  src={arrowDownIcon}
                  className={
                    sorting === 'down'
                      ? tableCSS.sort_icon_active
                      : tableCSS.sort_icon
                  }
                />
              </button>
            </td>
          </tr>
        </thead>
        <tbody>{renderTableBody()}</tbody>
      </table>
    </div>
  );
};

function mapStatesToProps({missionCenterModel}) {
  return {
    missionCenterModel,
  };
}

export default connect(mapStatesToProps)(MissionReportTable);
