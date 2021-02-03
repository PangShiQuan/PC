import React, {Component} from 'react';
import moment from 'moment';
import {connect} from 'dva';

import {type as TYPE} from 'utils';
import CommissionList from 'components/User/AgentCenter/CommissionReport/CommissionList';
import CommissionDetail from 'components/User/AgentCenter/CommissionReport/CommissionDetail';

const {commissionStatusRefs, timeframeRefs} = TYPE;

class CommissionReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      manualTimeframe: false,
    };

    this.awaitingResponse = false;

    this.dispatch = this.props.dispatch;
    this.onToggleDateClick = this.onToggleDateClick.bind(this);
    this.onStatusChange = this.onStatusChange.bind(this);
    this.onClearDateClick = this.onClearDateClick.bind(this);
    this.onTimeframeChange = this.onTimeframeChange.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.onDetailsClick = this.onDetailsClick.bind(this);
    this.onBackClick = this.onBackClick.bind(this);
  }
  componentWillMount() {
    this.dispatch({type: 'userModel/getMyCommission'});
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.awaitingResponse !== nextProps.awaitingResponse) {
      this.awaitingResponse = nextProps.awaitingResponse;
    }
  }
  componentWillUnmount() {
    this.dispatch({
      type: 'userModel/initializeState',
      payload: [
        'myCommissionHistory',
        'status',
        'totalBetsSum',
        'totalCommission',
        'taskIdentifier',
      ],
    });
    this.dispatch({
      type: 'dataTableModel/initializeState',
      payload: ['startTime', 'endTime', 'dayCounts'],
    });
  }
  onToggleDateClick() {
    this.setState({manualTimeframe: true});
  }
  onClearDateClick() {
    const {dayCounts} = this.props;
    const newStartTime = moment(new Date()).add(-dayCounts, 'days');
    this.dispatch({
      type: 'dataTableModel/updateState',
      payload: {startTime: newStartTime},
    });
    this.dispatch({
      type: 'dataTableModel/initializeState',
      payload: ['endTime'],
    });
    this.setState({manualTimeframe: false});
    this.dispatch({type: 'userModel/getMyCommission'});
  }
  onDateChange([startTime, endTime]) {
    if (!startTime && !endTime) {
      this.onClearDateClick();
    } else if (startTime && endTime) {
      this.dispatch({
        type: 'dataTableModel/updateState',
        payload: {startTime, endTime},
      });
      this.dispatch({type: 'userModel/getMyCommission'});
    }
  }
  onTimeframeChange({dayCounts}) {
    this.setState({manualTimeframe: false});
    const newStartTime = moment(new Date()).add(-dayCounts, 'days');
    this.dispatch({
      type: 'dataTableModel/updateState',
      payload: {startTime: newStartTime, dayCounts},
    });
    this.dispatch({type: 'userModel/getMyCommission'});
  }
  onDetailsClick(taskIdentifier) {
    this.dispatch({type: 'userModel/updateState', payload: {taskIdentifier}});
  }
  onBackClick() {
    this.dispatch({
      type: 'userModel/initializeState',
      payload: ['taskIdentifier'],
    });
  }
  onStatusChange(status) {
    this.dispatch({type: 'userModel/updateState', payload: {status}});
    this.dispatch({type: 'userModel/getMyCommission'});
  }
  renderCommissionDetail() {
    const {
      taskIdentifier,
      awaitingResponse,
      commissionDetail,
      commissionDetailCount,
    } = this.props;
    const listProps = {
      taskIdentifier,
      awaitingResponse,
      onBackClick: this.onBackClick,
      dispatch: this.dispatch,
      commissionDetail,
      commissionDetailCount,
    };
    return <CommissionDetail {...listProps} />;
  }
  renderCommissionList() {
    const {manualTimeframe} = this.state;
    const {
      status,
      dayCounts,
      myCommissionHistory,
      totalBetsSum,
      totalCommission,
      startTime,
      endTime,
    } = this.props;
    const listProps = {
      awaitingResponse: this.awaitingResponse,
      commissionStatusRefs,
      dayCounts,
      dispatch: this.props.dispatch,
      endTime,
      manualTimeframe,
      myCommissionHistory,
      onClearDateClick: this.onClearDateClick,
      onDateChange: this.onDateChange,
      onDetailsClick: this.onDetailsClick,
      onStatusChange: this.onStatusChange,
      onTimeframeChange: this.onTimeframeChange,
      onToggleDateClick: this.onToggleDateClick,
      startTime,
      status,
      timeframeRefs,
      totalBetsSum,
      totalCommission,
    };
    return <CommissionList {...listProps} />;
  }
  render() {
    const {taskIdentifier} = this.props;
    if (taskIdentifier) {
      return this.renderCommissionDetail();
    }
    return this.renderCommissionList();
  }
}

function mapStateToProps({userModel, dataTableModel}) {
  return {...userModel, ...dataTableModel};
}

export default connect(mapStateToProps)(CommissionReport);
