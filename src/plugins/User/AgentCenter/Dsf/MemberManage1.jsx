import React, {Component} from 'react';
import {connect} from 'dva';
import _ from 'lodash';

import {type as TYPE} from 'utils';
import {MDIcon} from 'components/General';
import css from 'styles/User/Dsf/ProfileIndex1.less';
import MemberInfoForm from 'components/User/AgentCenter/MemberManage/MemberInfoForm';
import MemberList from 'components/User/AgentCenter/MemberManage/MemberList';
// import TransferForm from './MemberManage/TransferForm';
import resolve from 'clientResolver';

const MemberDetail = resolve.plugin('CashFlowList');
const PersonalReport = resolve.plugin('PersonalReport');
const {memberTypeRefs, inputFieldRefs} = TYPE;
const INITIAL_STATE = {
  applyTarget: '',
  currentList: [],
  formIsPristine: true,
  initialMemberType: '',
  initialMinRange: 0,
  initialMaxRange: 0,
  initialValue: 0,
  mode: 'LIST',
  routes: [],
  sorting: '',
  sortingTarget: '',
};
// @mode: LIST || CREATE || EDIT || TRANSFER || DETAIL

class MemberManageIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {...INITIAL_STATE};
    this.awaitingResponse = false;
    this.dispatch = props.dispatch;
    this.onNavSelect = props.onNavSelect;
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.awaitingResponse !== nextProps.awaitingResponse) {
      this.awaitingResponse = nextProps.awaitingResponse;
    }
    if (this.props.memberList !== nextProps.memberList) {
      this.initializeState(['mode', 'applyTarget', 'formIsPristine']);
    }
  }

  componentWillUnmount() {
    this.dispatch({
      type: 'dataTableModel/initializeState',
      payload: ['targetUser', 'pageSize', 'currentPage'],
    });
    this.dispatch({
      type: 'teamModel/initializeState',
      payload: ['usernameSearchString', 'memberList', 'agentId', 'agentName'],
    });
  }

  onInitialListClick = () => {
    const {routes} = this.state;
    const {previousPage, pageSize} = routes[0];
    this.setState({routes: []});
    const start = (previousPage - 1) * pageSize;
    this.dispatch({
      type: 'dataTableModel/updateState',
      payload: {currentPage: previousPage, start, pageSize},
    });
    this.dispatch({
      type: 'teamModel/initializeState',
      payload: ['agentId', 'agentName'],
    });
    this.dispatch({type: 'teamModel/getMemberList'});
  };

  onBackClick = () => {
    this.initializeState([
      'applyTarget',
      'mode',
      'formIsPristine',
      'initialMinRange',
      'initialMaxRange',
      'initialValue',
    ]);
  };

  onCreateNewClick = () => {
    const {minMemberPrizeGroup, userData} = this.props;
    const userPrizeGroup = userData.prizeGroup;
    const platformPrizeGroup = minMemberPrizeGroup;
    const initialMinRange = platformPrizeGroup;
    const initialValue = userPrizeGroup;
    const initialMaxRange = userPrizeGroup;

    this.setState({
      mode: 'CREATE',
      initialValue,
      initialMaxRange,
      initialMinRange,
      formIsPristine: true,
    });
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['responseMsg'],
    });
    this.dispatch({
      type: 'formModel/updateState',
      payload: {
        password: {value: '123456'},
        prizeGroup: {value: userPrizeGroup},
      },
    });
  };

  onEditClick = member => {
    const {minMemberPrizeGroup, userData} = this.props;
    const {username, memberType, prizeGroup} = member;
    const memberPrizeGroup = prizeGroup;
    const userPrizeGroup = userData.prizeGroup;
    const platformPrizeGroup = minMemberPrizeGroup;
    let initialMinRange = platformPrizeGroup;
    let initialValue = memberPrizeGroup;
    let initialMaxRange = userPrizeGroup;

    if (userPrizeGroup > platformPrizeGroup) {
      if (memberPrizeGroup < platformPrizeGroup) {
        initialMinRange = platformPrizeGroup;
        initialValue = platformPrizeGroup;
        initialMaxRange = userPrizeGroup;
      } else if (memberPrizeGroup > platformPrizeGroup) {
        initialMinRange = memberPrizeGroup;
        initialMaxRange = userPrizeGroup;
      }
    }
    this.setState({
      applyTarget: username,
      initialValue,
      initialMaxRange,
      initialMinRange,
      initialMemberType: memberType,
      mode: 'EDIT',
    });
    this.dispatch({
      type: 'formModel/updateState',
      payload: {
        memberType,
        username: {value: username, validatePassed: true},
        prizeGroup: {value: prizeGroup, validatePassed: true},
      },
    });
  };

  onTransferClick = ({username}) => {
    this.setState({mode: 'TRANSFER', applyTarget: username});
    this.dispatch({
      type: 'formModel/updateState',
      payload: {
        username: {value: username},
      },
    });
  };

  onDetailClick = ({userId, username}) => {
    const {routes} = this.state;
    const {currentPage, pageSize} = this.props;
    const newRoutes = [
      ...routes,
      {
        userId,
        username: `${username}用户详情`,
        previousPage: currentPage,
        pageSize,
      },
    ];
    this.setState({
      mode: 'DETAIL',
      applyTarget: username,
      routes: newRoutes,
    });
    this.dispatch({
      type: 'dataTableModel/updateState',
      payload: {targetUser: username, currentPage: 1, start: 0},
    });
  };

  onReportClick = ({username}) => {
    this.dispatch({
      type: 'reportModel/initializeAll',
    });
    this.dispatch({
      type: 'reportModel/updateState',
      payload: {username, originPage: 'memberManage'},
    });
    this.setState({
      mode: 'PERSONAL_REPORT',
      applyTarget: username,
    });
    this.onNavSelect('personalReport');
  };

  onInputChange = event => {
    this.poluteForm();
    event.persist();
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['responseMsg'],
    });
    const eventTarget = event.target;
    const {value, max, name} = eventTarget;
    if (`${value}`.length <= max) {
      if (name.indexOf('repeat') > -1) {
        this.validateRepeatInput(event);
      } else {
        this.validateInput(event);
      }
    }
  };

  onRangeChange = event => {
    this.poluteForm();
    const {initialMinRange, initialMaxRange} = this.state;
    event.persist();
    const eventTarget = event.target;
    const {value, name} = eventTarget;
    let payload = {[name]: {value}};
    if (value < initialMinRange) {
      payload = {[name]: {value: initialMinRange}};
    } else if (value > initialMaxRange) {
      payload = {[name]: {value: initialMaxRange}};
    }
    this.dispatch({
      type: 'formModel/updateState',
      payload,
    });
  };

  onRadioSelect = memberType => {
    this.poluteForm();
    this.dispatch({type: 'formModel/updateState', payload: {memberType}});
  };

  onSubmitClick = () => {
    const {applyTarget, mode} = this.state;
    if (applyTarget) {
      this.dispatch({type: 'teamModel/putUserInfo'});
    } else if (mode === 'CREATE') {
      this.dispatch({type: 'teamModel/postUser'});
    }
  };

  onSearchChange = event => {
    if (event.target) {
      const {value} = event.target;
      this.dispatch({
        type: 'teamModel/updateState',
        payload: {usernameSearchString: value},
      });
    }
  };

  onSearchClear = () => {
    this.dispatch({
      type: 'teamModel/initializeState',
      payload: ['usernameSearchString'],
    });
    this.dispatch({type: 'teamModel/getMemberList'});
  };

  onSearchClick = () => {
    this.dispatch({type: 'teamModel/getMemberList'});
  };

  onPageSizeChange = (currentPage, pageSize) => {
    const start = (currentPage - 1) * pageSize;
    this.dispatch({
      type: 'dataTableModel/updateState',
      payload: {pageSize, currentPage, start},
    });
    this.dispatch({type: 'teamModel/getMemberList'});
  };

  onPageChange = (currentPage, pageSize) => {
    const start = (currentPage - 1) * pageSize;
    this.dispatch({
      type: 'dataTableModel/updateState',
      payload: {start, currentPage},
    });
    this.dispatch({type: 'teamModel/getMemberList'});
  };

  onAgentClick = ({userId, username}) => {
    const {routes} = this.state;
    const {currentPage, pageSize} = this.props;
    const newRoutes = [
      ...routes,
      {userId, username, previousPage: currentPage, pageSize},
    ];
    this.setState({routes: newRoutes});
    this.dispatch({
      type: 'teamModel/updateState',
      payload: {agentId: userId, agentName: username, usernameSearchString: ''},
    });
    this.dispatch({
      type: 'dataTableModel/initializeState',
      payload: ['currentPage', 'start'],
    });
    this.dispatch({type: 'teamModel/getMemberList'});
  };

  onBreadcrumClick = route => {
    const {userId, index, username} = route;
    const {routes} = this.state;
    const lastRoute = routes[index + 1];
    const newCurrentPage = lastRoute.previousPage;
    const newPageSize = lastRoute.pageSize;
    const newRoutes = [...routes].slice(0, index + 1);
    this.setState({routes: newRoutes});
    const start = (newCurrentPage - 1) * newPageSize;
    this.dispatch({
      type: 'teamModel/updateState',
      payload: {agentId: userId, agentName: username, usernameSearchString: ''},
    });
    this.dispatch({
      type: 'dataTableModel/updateState',
      payload: {currentPage: newCurrentPage, start, pageSize: newPageSize},
    });
    this.dispatch({type: 'teamModel/getMemberList'});
  };

  initializeState = targets => {
    const initialStates = _.pick(INITIAL_STATE, targets);
    this.setState({...initialStates});
  };

  // validateUsername = payload => {
  //   this.dispatch({type: 'formModel/getUsernameExistState', payload});
  // };

  validateInput = payload => {
    this.dispatch({type: 'formModel/validateInput', payload});
  };

  poluteForm = () => {
    this.setState({formIsPristine: false});
  };

  renderResponseMsg = () => {
    const {responseMsg} = this.props;
    const {msg, color, icon} = responseMsg;
    if (msg) {
      return (
        <div data-color={color} className={css.profile_formResponse}>
          <MDIcon iconName={icon} />
          <span>{msg}</span>
        </div>
      );
    }
    return null;
  };

  renderList() {
    const {routes, applyTarget} = this.state;
    const {
      memberListLength,
      currentPage,
      pageSize,
      usernameSearchString,
      agentId,
      memberList,
      userListDownloadURL,
    } = this.props;
    const listProps = {
      awaitingResponse: this.awaitingResponse,
      agentId,
      applyTarget,
      currentPage,
      dispatch: this.dispatch,
      initializeParentState: this.initializeState,
      memberList,
      memberListLength,
      memberTypeRefs,
      userListDownloadURL,
      onAgentClick: this.onAgentClick,
      onBackClick: this.onBackClick,
      onBreadcrumClick: this.onBreadcrumClick,
      onCreateNewClick: this.onCreateNewClick,
      onDetailClick: this.onDetailClick,
      onEditClick: this.onEditClick,
      onInitialListClick: this.onInitialListClick,
      onInputChange: this.onInputChange,
      onPageChange: this.onPageChange,
      onPageSizeChange: this.onPageSizeChange,
      onRadioSelect: this.onRadioSelect,
      onRangeChange: this.onRangeChange,
      onReportClick: this.onReportClick,
      onSearchChange: this.onSearchChange,
      onSearchClear: this.onSearchClear,
      onSearchClick: this.onSearchClick,
      onSubmitClick: this.onSubmitClick,
      onTransferClick: this.onTransferClick,
      pageSize,
      renderResponseMsg: this.renderResponseMsg,
      routes,
      usernameSearchString,
      validateInput: this.validateInput,
      // validateUsername: this.validateUsername,
    };
    return <MemberList {...listProps} />;
  }

  // renderTransferForm() {
  //   const formProps = {
  //     applyTarget: this.state.applyTarget,
  //     awaitingResponse: this.awaitingResponse,
  //     dailyWithdrawWithAdminSettingsResult: this.props
  //       .dailyWithdrawWithAdminSettingsResult,
  //     dispatch: this.props.dispatch,
  //     inputFieldRefs,
  //     onBackClick: this.onBackClick,
  //     renderResponseMsg: this.renderResponseMsg,
  //     securityPassword: this.props.securityPassword,
  //     transferAmount: this.props.transferAmount,
  //     username: this.props.username,
  //   };
  //   return <TransferForm {...formProps} />;
  // }
  renderMemberDetails() {
    const detailProps = {
      onBackClick: this.onBackClick,
      onInitialListClick: this.onInitialListClick,
      routes: this.state.routes,
      angentId: this.props.agentId,
      onBreadcrumClick: this.onBreadcrumClick,
    };
    return <MemberDetail {...detailProps} />;
  }

  renderPersonalReport() {
    const detailProps = {
      onBackClick: this.onBackClick,
      onInitialListClick: this.onInitialListClick,
    };
    return <PersonalReport {...detailProps} />;
  }

  renderMemberInfoForm() {
    const formProps = {
      applyTarget: this.state.applyTarget,
      awaitingResponse: this.awaitingResponse,
      dispatch: this.dispatch,
      formIsPristine: this.state.formIsPristine,
      initializeParentState: this.initializeState,
      initialMaxRange: this.state.initialMaxRange,
      initialMemberType: this.state.initialMemberType,
      initialMinRange: this.state.initialMinRange,
      initialValue: this.state.initialValue,
      inputFieldRefs,
      memberType: this.props.memberType,
      minMemberPrizeGroup: this.props.minMemberPrizeGroup,
      mode: this.state.mode,
      onBackClick: this.onBackClick,
      onInputChange: this.onInputChange,
      onRadioSelect: this.onRadioSelect,
      onRangeChange: this.onRangeChange,
      onSubmitClick: this.onSubmitClick,
      password: this.props.password,
      prizeGroup: this.props.prizeGroup,
      renderResponseMsg: this.renderResponseMsg,
      userData: this.props.userData,
      username: this.props.username,
      // validateUsername: this.validateUsername,
    };
    return <MemberInfoForm {...formProps} />;
  }

  render() {
    const {mode} = this.state;
    switch (mode) {
      case 'CREATE':
      case 'EDIT':
        return this.renderMemberInfoForm();
      // case 'TRANSFER':
      //   return this.renderTransferForm();
      case 'DETAIL':
        return this.renderMemberDetails();
      case 'PERSONAL_REPORT':
        return this.renderPersonalReport();
      default:
        return this.renderList();
    }
  }
}

function mapStateToProps({teamModel, dataTableModel, userModel, formModel}) {
  const {
    userData,
    minMemberPrizeGroup,
    dailyWithdrawWithAdminSettingsResult,
  } = userModel;
  return {
    ...teamModel,
    ...dataTableModel,
    ...formModel,
    userData,
    minMemberPrizeGroup,
    dailyWithdrawWithAdminSettingsResult,
  };
}

export default connect(mapStateToProps)(MemberManageIndex);
