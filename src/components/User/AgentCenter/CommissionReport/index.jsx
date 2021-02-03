import React, {PureComponent} from 'react';
import moment from 'moment';
import {connect} from 'dva';
import {type as TYPE} from 'utils';
import {Modal} from 'antd';
import CommissionListing from 'components/User/AgentCenter/CommissionReport/CommissionListing';
import CommissionDetails from 'components/User/AgentCenter/CommissionReport/CommissionDetails';
import userCSS from 'styles/User/User.less';

const {commissionStatusRefs, timeframeRefs} = TYPE;

class CommissionReport extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      manualTimeframe: false,
    };

    this.dispatch = props.dispatch;
  }

  componentWillMount() {
    this.dispatch({type: 'userModel/getMyCommission'});
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

  onToggleDateClick = () => {
    this.setState({manualTimeframe: true});
  };

  onClearDateClick = () => {
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
  };

  onDateChange = ([startTime, endTime]) => {
    if (!startTime && !endTime) {
      this.onClearDateClick();
    } else if (startTime && endTime) {
      const dayCounts = -1;
      this.dispatch({
        type: 'dataTableModel/updateState',
        payload: {startTime, endTime, dayCounts},
      });
      this.dispatch({type: 'userModel/getMyCommission'});
    }
  };

  onTimeframeChange = event => {
    const current = event.target;
    const dayCounts =
      (current.dataset && current.dataset.daycounts) ||
      current.getAttribute('data-daycounts');
    this.setState({manualTimeframe: false});
    const newStartTime = moment(new Date()).add(-dayCounts, 'days');
    const endTime = moment();
    this.dispatch({
      type: 'dataTableModel/updateState',
      payload: {startTime: newStartTime, endTime, dayCounts},
    });
    this.dispatch({type: 'userModel/getMyCommission'});
  };

  onDetailsClick = taskIdentifier => {
    this.dispatch({type: 'userModel/updateState', payload: {taskIdentifier}});
  };

  onCloseClick = () => {
    this.dispatch({
      type: 'userModel/initializeState',
      payload: ['taskIdentifier'],
    });
  };

  onStatusChange = status => {
    this.dispatch({type: 'userModel/updateState', payload: {status}});
    this.dispatch({type: 'userModel/getMyCommission'});
  };

  renderCommissionDetail = () => {
    const {
      taskIdentifier,
      commissionDetail,
      commissionDetailCount,
    } = this.props;

    const listProps = {
      taskIdentifier,
      dispatch: this.dispatch,
      commissionDetail,
      commissionDetailCount,
    };
    return <CommissionDetails {...listProps} />;
  };

  renderCommissionList = () => {
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
    return <CommissionListing {...listProps} />;
  };

  render() {
    const {taskIdentifier} = this.props;
    let modalVisible = false;
    if (taskIdentifier) modalVisible = true;

    return (
      <div className={userCSS.content_body}>
        {this.renderCommissionList()}
        <Modal
          width="1000px"
          visible={modalVisible}
          maskClosable={false}
          closable
          onCancel={this.onCloseClick}
          footer={null}>
          {modalVisible && this.renderCommissionDetail()}
        </Modal>
      </div>
    );
  }
}

function mapStateToProps({userModel, dataTableModel}) {
  return {...userModel, ...dataTableModel};
}

export default connect(mapStateToProps)(CommissionReport);
