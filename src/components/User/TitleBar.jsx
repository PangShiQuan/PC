import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {cloneDeep, findIndex} from 'lodash';
import css from 'styles/User/TitleBar.less';
import SVG from 'react-inlinesvg';
import classnames from 'classnames';
import feedbackIcon from 'assets/image/User/Title/ic-title-feedback.svg';
import newsIcon from 'assets/image/User/Title/ic-title-news.svg';
import profileIcon from 'assets/image/User/Title/ic-title-profile.svg';
import pwIcon from 'assets/image/User/Title/ic-title-pw.svg';
import personalReportIcon from 'assets/image/User/Title/ic-title-individual.svg';
import rechargeIcon from 'assets/image/User/Title/ic-title-recharge.svg';
import rechargeRecordIcon from 'assets/image/User/Title/ic-title-records-recharge.svg';
import withdrawalIcon from 'assets/image/User/Title/ic-title-withdrawals.svg';
import transferIcon from 'assets/image/User/Title/ic-title-records-transfer.svg';
import withdrawalRecordIcon from 'assets/image/User/Title/ic-title-records-withdrawals.svg';
import orderRecordIcon from 'assets/image/User/Title/ic-title-records-account.svg';
import teamOverallReportIcon from 'assets/image/User/Title/ic-title-records-team.svg';
import memberManageIcon from 'assets/image/User/Title/ic-title-agency-center.svg';
import affCodeManageIcon from 'assets/image/User/Title/ic-title-marketing.svg';
import commissionReportIcon from 'assets/image/User/Title/ic-title-agency-commission.svg';
import drawInfoIcon from 'assets/image/User/Title/ic-title-bankmanage.svg';
import {type as TYPE} from 'utils';

const getIcon = key => {
  switch (key) {
    case 'feedback':
      return feedbackIcon;
    case 'msgInbox':
      return newsIcon;
    case 'basicInfo':
      return profileIcon;
    case 'securityInfo':
      return pwIcon;
    case 'personalReport':
    case 'agentPersonalReport':
      return personalReportIcon;
    case 'topupCtrl':
      return rechargeIcon;
    case 'withdrawalCtrl':
      return withdrawalIcon;
    case 'transferCtrl':
    case 'transferReport':
      return transferIcon;
    case 'topupRecord':
      return rechargeRecordIcon;
    case 'withdrawalRecord':
      return withdrawalRecordIcon;
    case 'orderRecord':
      return orderRecordIcon;
    case 'myCashFlow':
      return orderRecordIcon;
    case 'teamOverallReport':
      return teamOverallReportIcon;
    case 'memberManage':
      return memberManageIcon;
    case 'affCodeManage':
      return affCodeManageIcon;
    case 'commissionReport':
      return commissionReportIcon;
    case 'drawInfo':
      return drawInfoIcon;
    default:
      return null;
  }
};

const {userProfileNavsFirst} = TYPE;
const Page = {
  TeamReport: 'teamReport',
  MemberManage: 'memberManage',
  OrderRecord: 'orderRecord',
  AgentPersonalReport: 'agentPersonalReport',
};

class TitleBar extends PureComponent {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
    this.state = {
      breadcrumbs: null,
      routes: [],
    };
  }

  componentDidUpdate(prevProps) {
    const {
      breadcrumbs: prevBreadcrumbs,
      usernameList: prevUsernameList,
      gameNameInChinese: prevGameNameInChinese,
      username: prevUsername,
    } = prevProps;
    const {
      breadcrumbs,
      usernameList,
      gameNameInChinese,
      gameIssueNo,
      username,
      profileSelectedNav,
    } = this.props;

    if (
      prevBreadcrumbs !== breadcrumbs ||
      prevUsernameList !== usernameList ||
      prevGameNameInChinese !== gameNameInChinese ||
      prevUsername !== username
    ) {
      let list = null;
      let routes = null;

      if (
        breadcrumbs.length > 0 &&
        profileSelectedNav === 'agentPersonalReport'
      ) {
        // 用户详情 > 用户的个人报表
        routes = breadcrumbs;
        list = [
          {
            userId: null,
            username,
          },
        ];
      } else if (breadcrumbs.length > 0) {
        // 用户详情
        list = breadcrumbs;
      } else if (usernameList.length > 0) {
        // 彩票团队报表
        list = usernameList;
      } else if (gameNameInChinese) {
        // 投注记录 > 游戏详情
        list = [
          {
            userId: gameIssueNo,
            username: `${gameNameInChinese} - 第${gameIssueNo}期详情`,
          },
        ];
      } else if (username) {
        list = [
          {
            userId: null,
            username,
          },
        ];
      }
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({breadcrumbs: list, routes});
    }
  }

  onUsernameClick = breadcrumbObj => {
    const {breadcrumbs: bc, routes} = this.state;
    const {profileSelectedNav} = this.props;

    if (!breadcrumbObj) {
      if (profileSelectedNav === Page.MemberManage) {
        if (bc && bc[0]) {
          // click 用户管理 1st breadcrumb
          const {previousPage, pageSize} = bc[0];
          const start = (previousPage - 1) * pageSize;
          this.dispatch({
            type: 'dataTableModel/updateState',
            payload: {
              currentPage: previousPage,
              start,
              pageSize,
            },
          });
        } else {
          this.dispatch({
            type: 'dataTableModel/initializeState',
            payload: ['currentPage', 'start'],
          });
        }
        this.dispatch({
          type: 'teamModel/initializeState',
          payload: ['agentId', 'agentName', 'username', 'breadcrumbs'],
        });
        this.dispatch({type: 'teamModel/getMemberList'});
      } else if (profileSelectedNav === Page.TeamReport) {
        this.dispatch({
          type: 'reportModel/updateState',
          payload: {
            username: null,
            usernameList: [],
            agentId: '',
          },
        });
        this.dispatch({
          type: 'reportModel/getTeamListSummary',
        });
      } else if (profileSelectedNav === Page.OrderRecord) {
        this.dispatch({
          type: 'orderModel/initializeState',
          payload: [
            'orderInfo',
            'subOrders',
            'transactionTimeuuid',
            'isContinueOrder',
            'coChildOrderList',
          ],
        });
        this.dispatch({
          type: 'formModel/initializeState',
          payload: ['responseMsg'],
        });
      } else if (profileSelectedNav === Page.AgentPersonalReport) {
        const {previousPage, pageSize} = routes[routes.length - 1];
        let agentId = '';
        let agentName = '';
        if (routes[routes.length - 2]) {
          const {userId, username} = routes[routes.length - 2];
          agentId = userId;
          agentName = username;
        }

        const start = (previousPage - 1) * pageSize;
        this.dispatch({
          type: 'dataTableModel/updateState',
          payload: {
            currentPage: previousPage,
            start,
            pageSize,
          },
        });
        this.dispatch({
          type: 'teamModel/updateState',
          payload: {
            agentId,
            agentName,
            breadcrumbs: routes.filter((x, index) => index < routes.length - 1),
          },
        });
        this.dispatch({
          type: 'reportModel/updateState',
          payload: {
            username: null,
            usernameList: [],
            agentId: '',
          },
        });
        this.dispatch({
          type: 'layoutModel/updateState',
          payload: {profileSelectedNav: 'memberManage'},
        });

        this.setState({
          routes: [],
        });
      }
      return;
    }

    const {userId, username} = breadcrumbObj;
    const breadcrumbs = cloneDeep(bc);
    const index = findIndex(breadcrumbs, x => x.userId === userId);
    const nextBreadcrumbs = breadcrumbs[index + 1];
    breadcrumbs.length = index + 1;

    if (profileSelectedNav === Page.MemberManage) {
      const {previousPage, pageSize} = nextBreadcrumbs;
      const start = (previousPage - 1) * pageSize;
      this.dispatch({
        type: 'dataTableModel/updateState',
        payload: {currentPage: previousPage, start, pageSize},
      });
      this.dispatch({
        type: 'teamModel/updateState',
        payload: {
          agentId: userId,
          agentName: username,
          usernameSearchString: '',
          breadcrumbs,
        },
      });
      this.dispatch({type: 'teamModel/getMemberList'});
    } else if (profileSelectedNav === Page.TeamReport) {
      this.dispatch({
        type: 'reportModel/updateState',
        payload: {
          username,
          isMain: true,
          usernameList: breadcrumbs,
          agentId: userId,
        },
      });
      this.dispatch({
        type: 'reportModel/getTeamListSummary',
      });
    }
  };

  generateBreadcrumbs = ({nav}) => {
    const {breadcrumbs} = this.state;
    if (breadcrumbs) {
      return (
        <React.Fragment>
          {breadcrumbs.map((item, index) => {
            const {username} = item;

            if (!username) return;

            // last index
            if (index === breadcrumbs.length - 1) {
              return (
                <React.Fragment key={username}>
                  {' > '}
                  <button type="button" disabled key={username}>
                    {username}
                  </button>
                </React.Fragment>
              );
            }

            return (
              <React.Fragment key={username}>
                {' > '}
                <button
                  type="button"
                  onClick={() => this.onUsernameClick(item)}>
                  {username}
                </button>
              </React.Fragment>
            );
          })}
        </React.Fragment>
      );
    }

    return nav.displayName;
  };

  render() {
    const {breadcrumbs} = this.state;
    const {profileSelectedNav, transferNo, bankTopupResponse} = this.props;
    let nav;
    const keys = Object.keys(userProfileNavsFirst);
    for (let i = 0; i < keys.length; i++) {
      const center = userProfileNavsFirst[keys[i]];
      nav = center.find(x => x.navKey === profileSelectedNav);
      if (nav) break;
    }
    const icon = nav ? getIcon(nav.navKey) : null;
    let title = nav && nav.displayName;

    if (nav && nav.displayName === '充值') {
      if (transferNo || bankTopupResponse) {
        title = (
          <React.Fragment>
            充值订单已生成
            <span className={css.small_title}>
              请您在尽快完成以下操作，过时将取消您的订单
            </span>
          </React.Fragment>
        );
      } else {
        title = (
          <React.Fragment>
            充值
            <span className={css.small_title}>请先选择以下充值方式</span>
          </React.Fragment>
        );
      }
    }

    return (
      <div className={css.titleBar}>
        {icon && <SVG className={classnames(css.svg_icon)} src={icon} />}
        {title && (
          <button
            type="button"
            onClick={breadcrumbs ? () => this.onUsernameClick(null) : undefined}
            style={{cursor: breadcrumbs ? 'pointer' : 'default'}}>
            {title}
          </button>
        )}
        {breadcrumbs && this.generateBreadcrumbs({nav})}
      </div>
    );
  }
}

function mapStatesToProps({teamModel, reportModel, orderModel, transferModel}) {
  const {
    orderInfo: {gameNameInChinese, gameIssueNo},
  } = orderModel;
  const {breadcrumbs} = teamModel;
  const {username, usernameList} = reportModel;
  const {transferNo, bankTopupResponse} = transferModel;
  return {
    gameNameInChinese,
    gameIssueNo,
    breadcrumbs,
    username,
    usernameList,
    transferNo,
    bankTopupResponse,
  };
}

export default connect(mapStatesToProps)(TitleBar);
