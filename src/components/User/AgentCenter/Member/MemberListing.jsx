import React, {Component} from 'react';
import {map} from 'lodash';
import {Dropdown, Pagination} from 'antd';
import moment from 'moment-timezone';
import {type} from 'utils';
import css from 'styles/User/AgentCenter/Member.less';
import tableCSS from 'styles/User/Form/Table.less';
import SVG from 'react-inlinesvg';
import addIcon from 'assets/image/User/ic-agency-add.svg';
import moreIcon from 'assets/image/User/ic-more.svg';
import searchIcon from 'assets/image/User/ic-search.svg';
import downloadIcon from 'assets/image/User/ic-download.svg';
import arrowUpIcon from 'assets/image/User/ic-btn-transfer-active-up.svg';
import arrowDownIcon from 'assets/image/User/ic-btn-transfer-active-down.svg';

const {commissionMode, dateFormat, memberTypeRefs} = type;

const TableAnchor = ({onSelect, memberRef, disabled, placeholder}) => {
  function onClick() {
    onSelect(memberRef);
  }
  return (
    <button
      type="button"
      disabled={disabled}
      className={css.link_button}
      onClick={onClick}>
      {placeholder}
    </button>
  );
};

const DropdownButton = ({disabled, memberRef, onSelect, placeholder}) => {
  function onClick() {
    onSelect(memberRef);
  }
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={css.dropdown_menu_item}>
      {placeholder}
    </button>
  );
};

class MemberListing extends Component {
  constructor(props) {
    super(props);
    this.state = {sorting: ''};
    this.dispatch = props.dispatch;
    this.onAgentClick = props.onAgentClick;
    // this.onTransferClick = props.onTransferClick;
    this.onDetailClick = props.onDetailClick;
    this.onCreateNewClick = props.onCreateNewClick;
    this.onEditClick = props.onEditClick;
    this.onReportClick = props.onReportClick;
  }

  componentDidMount() {
    this.dispatch({type: 'teamModel/getMemberList'});
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
      <ul className={css.dropdown_menu}>
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
        className={tableCSS.pagination}
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

  renderTableBody() {
    const {memberList} = this.props;
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
              <Dropdown
                overlay={this.renderCtrlBtnsDropdown(member)}
                placement="bottomCenter">
                <button type="button" className={css.more_button}>
                  <SVG className={css.svg_icon} src={moreIcon} />
                </button>
              </Dropdown>
            </td>
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
              <span className={css.color_indicator} data-color={colorIndicator}>
                {signInTimeInShanghai || alive
                  ? `${connectStatus} ${connectTime}`
                  : '-'}
              </span>
            </td>
            <td>{memberTypeRefs[memberType]}</td>
            <td>{commissionModes ? null : prizeGroup}</td>
            <td>
              <TableAnchor
                disabled={disabled}
                onSelect={this.onAgentClick}
                placeholder={teamMemberCount}
                memberRef={member}
              />
            </td>
            <td>{teamBalance}</td>
            <td>{balance}</td>
            <td>{aggregateBets}</td>
            <td>{topupAggregateAmount}</td>
            <td>{topupCount}</td>
            <td>{withdrawAggregateAmount}</td>
          </tr>
        );
      });
    }
    return (
      <tr>
        <td colSpan="100%">暂无数据</td>
      </tr>
    );
  }

  renderTopRow = () => {
    const {usernameSearchString, formDisabled} = this.props;
    return (
      <div className={css.addNewRow}>
        <div>
          <button
            type="button"
            disabled={formDisabled}
            onClick={this.onCreateNewClick}
            className={css.addNewButton}>
            <SVG className={css.svg_icon} src={addIcon} />
            创建新用户
          </button>
        </div>
        <div>
          <button
            type="button"
            className={css.search_icon_button}
            onClick={this.onSearchClick}>
            <SVG className={css.svg_icon_search} src={searchIcon} />
          </button>
          <input
            className={css.search_input}
            placeholder="请输入用户名进行搜索"
            value={usernameSearchString}
            onChange={this.onSearchChange}
          />
          {/* <button
            type="button"
            className={css.cancel_icon_button}
            onClick={this.onSearchClear}>
            <MDIcon
              className={
                usernameSearchString
                  ? css.profile_tableClearIcon__active
                  : css.profile_tableClearIcon
              }
              iconName="close-circle"
            />
          </button> */}
          <button
            type="button"
            onClick={this.downloadUserList}
            className={css.download_button}>
            <SVG className={css.svg_icon} src={downloadIcon} />
            下载列表
          </button>
        </div>
      </div>
    );
  };

  render() {
    const {sorting} = this.state;
    const commissionModes =
      localStorage.getItem('commissionMode') ===
      commissionMode.COMMISSION_RATIO;
    return (
      <div>
        <div>
          {this.renderTopRow()}
          <div className={tableCSS.table_container}>
            <table
              className={tableCSS.table}
              style={{
                whiteSpace: 'nowrap',
                fontSize: '0.75rem',
              }}>
              <thead>
                <tr>
                  <td>操作</td>
                  <td>用户名</td>
                  <td>注册时间</td>
                  <td>
                    <i style={{marginRight: '0.2rem'}}>登入状态</i>
                    <button
                      type="button"
                      onClick={() => this.onSortChange('up')}>
                      <SVG
                        src={arrowUpIcon}
                        className={
                          sorting === 'up'
                            ? tableCSS.sort_icon_active
                            : tableCSS.sort_icon
                        }
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => this.onSortChange('down')}>
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
                  <td>类型</td>
                  <td>{commissionModes ? null : '返点'}</td>
                  <td>团队人数</td>
                  <td>团队余额</td>
                  <td>个人余额</td>
                  <td>个人投注</td>
                  <td>个人充值</td>
                  <td>存款次数</td>
                  <td>个人提款</td>
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

export default MemberListing;
