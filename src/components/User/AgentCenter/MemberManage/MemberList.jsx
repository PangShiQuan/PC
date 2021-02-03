import React, {Component} from 'react';
import {map} from 'lodash';
import {Dropdown, Pagination} from 'antd';
import moment from 'moment-timezone';
import {MDIcon, LoadingBar} from 'components/General';
import {type} from 'utils';
import css from 'styles/User/Dsf/ProfileIndex1.less';

const {commissionMode, dateFormat} = type;
const BreadCrum = ({disabled, onSelect, breadCrumRef, placeholder}) => {
  function onClick() {
    onSelect(breadCrumRef);
  }
  return (
    <button
      disabled={disabled}
      className={css.profile_breadcrumItem}
      onClick={onClick}>
      <MDIcon iconName="chevron-right" />
      <i>{placeholder}</i>
    </button>
  );
};

const TableAnchor = ({onSelect, memberRef, disabled, placeholder}) => {
  function onClick() {
    onSelect(memberRef);
  }
  return (
    <button
      disabled={disabled}
      className={css.memberList_tableAnchor}
      onClick={onClick}>
      {placeholder}
    </button>
  );
};

const TableSortIcon = ({sorting, active, onSelect}) => {
  function onClick() {
    onSelect(sorting);
  }
  return (
    <button onClick={onClick}>
      <MDIcon
        iconName={`arrow-${sorting}`}
        className={
          active ? css.profile_tableSortIcon__active : css.profile_tableSortIcon
        }
      />
    </button>
  );
};

const DropdownButton = ({disabled, memberRef, onSelect, placeholder}) => {
  function onClick() {
    onSelect(memberRef);
  }
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={css.profile_dropdownMenuItem}>
      {placeholder}
    </button>
  );
};

class MemberList extends Component {
  constructor(props) {
    super(props);
    this.state = {sorting: ''};
    this.awaitingResponse = false;
    this.dispatch = props.dispatch;
    this.initializeParentState = props.initializeParentState;
    this.onAgentClick = props.onAgentClick;
    this.onBreadcrumClick = props.onBreadcrumClick;
    this.onCreateNewClick = props.onCreateNewClick;
    this.onEditClick = props.onEditClick;
    this.onInitialListClick = props.onInitialListClick;
    this.onPageChange = props.onPageChange;
    this.onPageSizeChange = props.onPageSizeChange;
    this.onSearchChange = props.onSearchChange;
    this.onSearchClear = props.onSearchClear;
    this.onSearchClick = props.onSearchClick;
    this.onTransferClick = props.onTransferClick;
    this.onDetailClick = props.onDetailClick;
    this.onReportClick = props.onReportClick;
  }

  componentDidMount() {
    this.dispatch({type: 'teamModel/getMemberList'});
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.awaitingResponse !== nextProps.awaitingResponse) {
      this.awaitingResponse = nextProps.awaitingResponse;
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.sorting !== this.state.sorting) {
      let orderByLoginTime = '';
      const {sorting} = this.state;

      if (sorting === 'up') {
        orderByLoginTime = true;
      } else if (sorting === 'down') {
        orderByLoginTime = false;
      } else {
        orderByLoginTime = '';
      }

      this.dispatch({
        type: 'dataTableModel/updateState',
        payload: {orderByLoginTime},
      });
      this.dispatch({type: 'teamModel/getMemberList'});
    }
  }

  componentWillUnmount() {
    this.dispatch({
      type: 'dataTableModel/initializeState',
      payload: ['currentPage', 'start'],
    });
  }

  onSortChange = direction => {
    const {sorting} = this.state;

    if (sorting === direction) {
      this.setState({sorting: ''});
    } else {
      this.setState({sorting: direction});
    }
  };

  downloadUserList = () => {
    this.dispatch({type: 'teamModel/getDownloadUserListURL'});
  };

  renderCtrlBtnsDropdown(member) {
    const {agentId} = this.props;
    return (
      <ul className={css.profile_dropdownMenu}>
        <DropdownButton
          disabled={
            this.props.formDisabled || agentId || !member.isDirectTeamMember
          }
          onSelect={this.onEditClick}
          placeholder="修改"
          memberRef={member}
        />
        {/* <DropdownButton     //temporary remove for MT-4216
          onSelect={this.onTransferClick}
          placeholder="转账"
          disabled
          memberRef={member}
        /> */}
        <DropdownButton
          onSelect={this.onDetailClick}
          placeholder="详情"
          memberRef={member}
        />
        <DropdownButton
          onSelect={this.onReportClick}
          placeholder="个人报表"
          memberRef={member}
        />
      </ul>
    );
  }

  renderPagination() {
    const {memberListLength, currentPage, pageSize} = this.props;
    return (
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        onChange={this.onPageChange}
        onShowSizeChange={this.onPageSizeChange}
        showQuickJumper
        showSizeChanger
        total={memberListLength}
      />
    );
  }

  renderBreadcrum() {
    const {agentId, routes} = this.props;
    return map(routes, (member, index) => {
      const {userId, username} = member;
      return (
        <BreadCrum
          breadCrumRef={{...member, index}}
          key={userId}
          onSelect={this.onBreadcrumClick}
          disabled={agentId === userId}
          placeholder={username}
        />
      );
    });
  }

  renderTableBody() {
    const {memberList, memberTypeRefs} = this.props;
    const commissionModes =
      localStorage.getItem('commissionMode') ===
      commissionMode.COMMISSION_RATIO;
    if (memberList.length) {
      return map(memberList, member => {
        const {
          createTime,
          aggregateBets,
          balance,
          memberType,
          prizeGroup,
          teamBalance,
          teamMemberCount,
          topupAggregateAmount,
          topupCount,
          userId,
          username,
          withdrawAggregateAmount,
          lastOperateTime,
          alive,
        } = member;
        const disabled = memberType !== 'AGENT' || teamMemberCount < 2;
        const targetTime = 'Asia/Shanghai';
        let connectStatus = '';
        let connectTime = '';
        let signInTimeInShanghai, currentTimeInShanghai;
        let differentDay = '';
        let colorIndicator = '';
        if (lastOperateTime) {
          signInTimeInShanghai = moment(lastOperateTime)
            .tz(targetTime)
            .valueOf();
          currentTimeInShanghai = moment()
            .tz(targetTime)
            .valueOf();
          differentDay = moment(currentTimeInShanghai).diff(
            signInTimeInShanghai,
            'days',
          );
          if (differentDay === 0) {
            colorIndicator = 'green';
            connectStatus = '在线';
          }
          if (differentDay > 0) {
            colorIndicator = 'red';
            connectStatus = '离线';
            connectTime = `${differentDay}天`;
          }
        }
        return (
          <tr key={userId} data-color={colorIndicator}>
            <td>
              {disabled ? (
                username
              ) : (
                <TableAnchor
                  disabled={disabled}
                  onSelect={this.onAgentClick}
                  placeholder={username}
                  memberRef={member}
                />
              )}
            </td>
            <td>{moment(createTime).format(dateFormat)}</td>
            <td>
              <span
                className={css.profile_tableColorIndicator}
                data-color={colorIndicator}>
                {signInTimeInShanghai || alive
                  ? `${connectStatus} ${connectTime}`
                  : '-'}
              </span>
            </td>
            <td>{memberTypeRefs[memberType]}</td>
            <td data-align="right">{commissionModes ? null : prizeGroup}</td>
            <td data-align="right">
              <TableAnchor
                disabled={disabled}
                onSelect={this.onAgentClick}
                placeholder={teamMemberCount}
                memberRef={member}
              />
            </td>
            <td data-align="right">{teamBalance}</td>
            <td data-align="right">{balance}</td>
            <td data-align="right">{aggregateBets}</td>
            <td data-align="right">{topupAggregateAmount}</td>
            <td data-align="right">{topupCount}</td>
            <td data-align="right">{withdrawAggregateAmount}</td>
            <td data-align="right">
              <Dropdown overlay={this.renderCtrlBtnsDropdown(member)}>
                <button className={css.memberList_tableAnchor}>
                  <MDIcon iconName="more" />
                </button>
              </Dropdown>
            </td>
          </tr>
        );
      });
    }
    return (
      <tr>
        <td colSpan="11">暂无数据</td>
      </tr>
    );
  }

  render() {
    const {usernameSearchString, routes, renderResponseMsg} = this.props;
    const {sorting} = this.state;
    const commissionModes =
      localStorage.getItem('commissionMode') ===
      commissionMode.COMMISSION_RATIO;
    return (
      <div>
        <div className={css.profile_contentBody}>
          <h4 className={css.profile_formLabel}>
            <button
              disabled={!routes.length}
              onClick={this.onInitialListClick}
              className={css.profile_breadcrumItem__main}>
              我的用户列表
            </button>
            {this.renderBreadcrum()}

            <button
              onClick={this.downloadUserList}
              className={css.profile_userDownloadBtn}
              disabled={this.awaitingResponse}>
              下载列表
            </button>
            <LoadingBar isLoading={this.awaitingResponse} />
          </h4>
          {renderResponseMsg()}
          <button
            disabled={this.props.formDisabled}
            onClick={this.onCreateNewClick}
            className={css.profile_tableAddNewBtn}>
            <MDIcon iconName="plus" />
            创建新用户
          </button>
          <div className={css.profile_table_body}>
            <table className={css.profile_table}>
              <thead>
                <tr>
                  <td className={css.firstSearchBox}>
                    <div className={css.profile_tableSearchBox}>
                      <button onClick={this.onSearchClick}>
                        <MDIcon
                          className={
                            usernameSearchString
                              ? css.profile_tableSearchIcon__active
                              : css.profile_tableSearchIcon
                          }
                          iconName="magnify"
                        />
                      </button>
                      <input
                        className={css.profile_tableSearchInput}
                        placeholder="用户名"
                        value={usernameSearchString}
                        onChange={this.onSearchChange}
                        style={{width: '8rem'}}
                      />
                      <button onClick={this.onSearchClear}>
                        <MDIcon
                          className={
                            usernameSearchString
                              ? css.profile_tableClearIcon__active
                              : css.profile_tableClearIcon
                          }
                          iconName="close-circle"
                        />
                      </button>
                    </div>
                  </td>
                  <td>
                    <i style={{marginRight: '0.5rem'}}>注册时间</i>
                  </td>
                  <td>
                    <i style={{marginRight: '0.5rem'}}>登入状态</i>
                    <TableSortIcon
                      active={sorting === 'up'}
                      sorting="up"
                      onSelect={this.onSortChange}
                    />
                    <TableSortIcon
                      active={sorting === 'down'}
                      sorting="down"
                      onSelect={this.onSortChange}
                    />
                  </td>
                  <td>类型</td>
                  <td data-align="right">{commissionModes ? null : '返点'}</td>
                  <td data-align="right">团队人数</td>
                  <td data-align="right">团队余额</td>
                  <td data-align="right">个人余额</td>
                  <td data-align="right">个人投注</td>
                  <td data-align="right">个人充值</td>
                  <td data-align="right">存款次数</td>
                  <td data-align="right">个人提款</td>
                  <td data-align="right">操作</td>
                </tr>
              </thead>
              <tbody>{this.renderTableBody()}</tbody>
            </table>
          </div>
        </div>
        {this.renderPagination()}
      </div>
    );
  }
}

export default MemberList;
