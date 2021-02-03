import React, {useEffect, useCallback} from 'react';
import DateThread from 'components/User/Form/DateThread';
import ResponseMessageBar from 'components/User/ResponseMessageBar';
import {connect} from 'dva';
import {type, getDateTimeRange} from 'utils';
import userCSS from 'styles/User/User.less';
import MissionReportTable from './MissionReportTable';

const {ReportSearchMaxDays, DateTimeframeQuickRefs} = type;

const MissionReport = props => {
  const {dataTableModel, orderModel, dispatch} = props;

  const {startTime, endTime} = dataTableModel;

  const onTimeframeQuicklinkClick = useCallback(({value, isSearch}) => {
    const dateTimeRange = getDateTimeRange(value);
    if (dateTimeRange) {
      dispatch({
        type: 'dataTableModel/updateState',
        payload: {
          startTime: dateTimeRange.startDatetime,
          endTime: dateTimeRange.endDatetime,
        },
      });
      dispatch({
        type: 'orderModel/updateState',
        payload: {
          selectedTimeframeQuickLink: value,
        },
      });
      dispatch({type: 'missionCenterModel/getMissionHistory'});
    }
  }, []);

  const onTimeframeChange = useCallback(event => {
    const current = event.target;
    const value =
      (current.dataset && current.dataset.daycounts) ||
      current.getAttribute('data-daycounts');
    onTimeframeQuicklinkClick({value});
  }, []);

  const onClearDateClick = useCallback(() => {
    onTimeframeQuicklinkClick({
      value: 'ThisMonth',
    });
  }, []);

  const onDateChange = useCallback(([startDateTime, endDateTime]) => {
    if (!startDateTime && !endDateTime) {
      onClearDateClick();
    } else if (startDateTime && endDateTime) {
      if (
        Math.abs(endDateTime.diff(startDateTime, 'days')) >= ReportSearchMaxDays
      ) {
        dispatch({
          type: 'formModel/updateState',
          payload: {
            responseMsg: {
              msg: `查询区间需在${ReportSearchMaxDays}天以内`,
              icon: 'close-circle-outline',
              color: 'red',
            },
          },
        });
        return;
      }

      dispatch({
        type: 'dataTableModel/updateState',
        payload: {startTime: startDateTime, endTime: endDateTime},
      });
      dispatch({type: 'missionCenterModel/getMissionHistory'});
      dispatch({
        type: 'orderModel/initializeState',
        payload: ['selectedTimeframeQuickLink'],
      });
    }
  }, []);

  useEffect(() => {
    onTimeframeQuicklinkClick({
      value: 'ThisMonth',
      isSearch: true,
    });
  }, []);

  const dateThreadProps = {
    currentDayCounts: orderModel.selectedTimeframeQuickLink,
    startTime,
    endTime,
    timeframeRefs: DateTimeframeQuickRefs,
    onDateChange,
    onTimeframeChange,
  };

  return (
    <React.Fragment>
      <ResponseMessageBar />
      <div className={userCSS.content_body}>
        <div style={{marginBottom: '20px'}}>
          <DateThread {...dateThreadProps} />
        </div>
        <MissionReportTable />
      </div>
    </React.Fragment>
  );
};

function mapStatesToProps({dataTableModel, orderModel}) {
  return {
    dataTableModel,
    orderModel,
  };
}

export default connect(mapStatesToProps)(MissionReport);
