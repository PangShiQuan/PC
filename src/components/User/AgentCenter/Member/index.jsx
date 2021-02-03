import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {Modal} from 'antd';
import _ from 'lodash';
import ResponseMessageBar from 'components/User/ResponseMessageBar';
import MemberListing from 'components/User/AgentCenter/Member/MemberListing';
import MemberForm from 'components/User/AgentCenter/Member/MemberForm';
import CashFlowList from 'components/User/TradingCenter/CashFlowList';
import userCSS from 'styles/User/User.less';

const INITIAL_STATE = {
  applyTarget: '',
  currentList: [],
  formIsPristine: true,
  initialMemberType: '',
  initialMinRange: 0,
  initialMaxRange: 0,
  initialValue: 0,
  mode: 'LIST',
  sorting: '',
  sortingTarget: '',
};

class Member extends PureComponent {
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
    this.dispatch = props.dispatch;
    this.onNavSelect = props.onNavSelect;
  }

  componentDidUpdate(prevProps) {
    const {memberList: prevMemberList} = prevProps;
    const {memberList} = this.props;

    if (prevMemberList !== memberList) {
      this.initializeState(['mode', 'applyTarget', 'formIsPristine']);
    }
  }

  componentWillUnmount() {
    this.dispatch({
      type: 'teamModel/initializeState',
      payload: ['agentId', 'agentName', 'username'],
    });
  }

  initializeState = targets => {
    const initialStates = _.pick(INITIAL_STATE, targets);
    this.setState({...initialStates});
  };

  poluteForm = () => {
    this.setState({formIsPristine: false});
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

  onCloseClick = () => {
    this.initializeState([
      'applyTarget',
      'mode',
      'formIsPristine',
      'initialMinRange',
      'initialMaxRange',
      'initialValue',
    ]);
    this.dispatch({
      type: 'formModel/initializeState',
      payload: [
        'username',
        'password',
        'realName',
        'email',
        'memberType',
        'prizeGroup',
        'responseMsg',
      ],
    });
  };

  onSubmitClick = () => {
    const {applyTarget, mode} = this.state;
    if (applyTarget) {
      this.dispatch({type: 'teamModel/putUserInfo'});
    } else if (mode === 'CREATE') {
      this.dispatch({type: 'teamModel/postUser'});
    }
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

  onReportClick = ({username}) => {
    const {currentPage, pageSize, breadcrumbs} = this.props;
    const newRoutes = [
      ...breadcrumbs,
      {username, previousPage: currentPage, pageSize},
    ];
    this.dispatch({
      // this is to update breadcrumbs
      type: 'teamModel/updateState',
      payload: {
        breadcrumbs: newRoutes,
      },
    });

    this.dispatch({
      type: 'statisticsReportModel/updateState',
      payload: {username},
    });
    this.dispatch({
      type: 'reportModel/updateState',
      payload: {username},
    });
    this.onNavSelect('agentPersonalReport');
  };

  onDetailClick = ({userId, username}) => {
    const {currentPage, pageSize, breadcrumbs} = this.props;
    const newRoutes = [
      ...breadcrumbs,
      {
        userId,
        username: `${username} 用户详情`,
        previousPage: currentPage,
        pageSize,
      },
    ];
    this.setState({
      mode: 'DETAIL',
      applyTarget: username,
    });
    this.dispatch({
      // this is to update breadcrumbs
      type: 'teamModel/updateState',
      payload: {
        breadcrumbs: newRoutes,
      },
    });
    this.dispatch({
      type: 'dataTableModel/updateState',
      payload: {targetUser: username, currentPage: 1, start: 0},
    });
  };

  onAgentClick = ({userId, username}) => {
    const {currentPage, pageSize, breadcrumbs} = this.props;
    const newRoutes = [
      ...breadcrumbs,
      {userId, username, previousPage: currentPage, pageSize},
    ];

    this.dispatch({
      type: 'teamModel/updateState',
      payload: {
        agentId: userId,
        agentName: username,
        usernameSearchString: '',
        breadcrumbs: newRoutes,
      },
    });
    this.dispatch({
      type: 'dataTableModel/initializeState',
      payload: ['currentPage', 'start'],
    });
    this.dispatch({type: 'teamModel/getMemberList'});
  };

  renderList() {
    const {applyTarget} = this.state;
    const {
      memberListLength,
      currentPage,
      pageSize,
      usernameSearchString,
      agentId,
      memberList,
    } = this.props;

    const listProps = {
      dispatch: this.dispatch,
      agentId,
      applyTarget,
      currentPage,
      memberList,
      memberListLength,
      pageSize,
      usernameSearchString,
      onCreateNewClick: this.onCreateNewClick,
      onEditClick: this.onEditClick,
      onReportClick: this.onReportClick,
      // onTransferClick: this.onTransferClick,
      onDetailClick: this.onDetailClick,
      onAgentClick: this.onAgentClick,
    };

    return <MemberListing {...listProps} />;
  }

  renderForm() {
    const {
      formIsPristine,
      initialMinRange,
      initialMaxRange,
      initialValue,
      initialMemberType,
      applyTarget,
      mode,
    } = this.state;

    const {
      memberType,
      minMemberPrizeGroup,
      password,
      prizeGroup,
      userData,
      username,
      responseMsg,
    } = this.props;

    const formProps = {
      applyTarget,
      formIsPristine,
      initialMinRange,
      initialMaxRange,
      initialValue,
      initialMemberType,
      mode,
      dispatch: this.dispatch,
      poluteForm: this.poluteForm,
      memberType,
      minMemberPrizeGroup,
      password,
      prizeGroup,
      userData,
      username,
      responseMsg,
      onCloseClick: this.onCloseClick,
      onSubmitClick: this.onSubmitClick,
    };

    return <MemberForm {...formProps} />;
  }

  renderMemberDetails() {
    const detailProps = {
      onBackClick: this.onBackClick,
      onInitialListClick: this.onInitialListClick,
      onBreadcrumClick: this.onBreadcrumClick,
    };
    return <CashFlowList {...detailProps} />;
  }

  render() {
    const {mode, initialMaxRange, initialValue, applyTarget} = this.state;
    const modalVisible = ['CREATE', 'EDIT'].includes(mode);
    const {
      minMemberPrizeGroup,
      userData: {prizeGroup},
    } = this.props;
    let showRange = true;

    if (
      prizeGroup <= minMemberPrizeGroup ||
      (!!applyTarget && initialValue >= initialMaxRange)
    ) {
      showRange = false;
    }

    return (
      <React.Fragment>
        {!modalVisible && <ResponseMessageBar />}
        {mode === 'DETAIL' && this.renderMemberDetails()}
        {mode === 'LIST' && (
          <div className={userCSS.content_body}>{this.renderList()}</div>
        )}
        <Modal
          width={showRange ? '800px' : '370px'}
          visible={modalVisible}
          maskClosable={false}
          centered
          closable={false}
          onCancel={() => this.setState({mode: 'LIST'})}
          footer={null}>
          <React.Fragment>{modalVisible && this.renderForm()}</React.Fragment>
        </Modal>
      </React.Fragment>
    );
  }
}

const mapStateToProps = ({teamModel, dataTableModel, userModel, formModel}) => {
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
};

export default connect(mapStateToProps)(Member);
