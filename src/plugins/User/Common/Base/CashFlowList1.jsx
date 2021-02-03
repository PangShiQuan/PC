import React, {Component} from 'react';
import moment from 'moment';
import _ from 'lodash';
import {Tooltip, Dropdown, DatePicker} from 'antd';
import ClipboardButton from 'react-clipboard.js';
import {connect} from 'dva';

import {addCommas, type as TYPE, getConcatArray} from 'utils';
import {MDIcon} from 'components/General';
import css from 'styles/User/TradingCenter/CashFlowList.less';
import userCSS from 'styles/User/User.less';
import tableCSS from 'styles/User/Form/Table.less';
import SVG from 'react-inlinesvg';
import arrowUpIcon from 'assets/image/User/ic-btn-transfer-active-up.svg';
import arrowDownIcon from 'assets/image/User/ic-btn-transfer-active-down.svg';

const {moneyOperationTypeRefs, dateFormat} = TYPE;

class CashFlowList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentList: [],
      tooltipText: '点我复制到剪贴板',
      sorting: '',
      searchText: '',
      typeDropdownVisible: false,
    };

    const {dispatch, onInitialListClick, onBreadcrumClick} = props;
    this.dispatch = dispatch;
    this.onBreadcrumClick = onBreadcrumClick;
    this.onInitialListClick = onInitialListClick;
  }

  componentDidMount() {
    this.dispatch({type: 'userModel/getMyCashFlow'});
  }

  componentWillReceiveProps(nextProps) {
    this.sliceList(nextProps);
    if (this.props.targetUser !== nextProps.targetUser) {
      this.dispatch({type: 'userModel/getMyCashFlow'});
    }
  }

  componentWillUnmount() {
    this.dispatch({
      type: 'dataTableModel/initializeState',
      payload: ['state', 'date', 'moneyOperationType', 'targetUser'],
    });
    this.dispatch({
      type: 'userModel/initializeState',
      payload: ['myCashFlow', 'myCashFlowPagingState'],
    });
  }

  onAllOperatesClick = () => {
    this.dispatch({
      type: 'dataTableModel/initializeState',
      payload: ['moneyOperationTypes'],
    });
    this.dispatch({type: 'userModel/getMyCashFlow'});
  };

  onSearchChange = event => {
    if (event.target) {
      const {value} = event.target;
      this.setState({searchText: value});
    }
  };

  onSearchClear = () => {
    this.setState({searchText: ''});
    this.dispatch({type: 'userModel/getMyCashFlow'});
  };

  onSearchClick = () => {
    this.dispatch({type: 'userModel/getMyCashFlow'});
  };

  onCopySuccess = () => {
    this.setState({tooltipText: '复制成功！'});
  };

  onToolTipVisibleChange = () => {
    this.setState({tooltipText: '点我复制到剪贴板'});
  };

  onTypeDropdownVisibleChange = flag => {
    this.setState({typeDropdownVisible: flag});
  };

  onSortChange = direction => {
    const {sorting} = this.state;
    if (sorting === direction) {
      this.setState({sorting: ''});
    } else {
      this.setState({sorting: direction});
    }
    this.dispatch({type: 'userModel/getMyCashFlow'});
  };

  onDateChange = date => {
    if (date) {
      this.dispatch({
        type: 'userModel/initializeState',
        payload: ['myCashFlowIsEnd', 'myCashFlowPagingState'],
      });
      this.dispatch({type: 'dataTableModel/updateState', payload: {date}});
      this.dispatch({type: 'userModel/getMyCashFlow'});
    }
  };

  onTypeClick = operationType => {
    this.dispatch({
      type: 'userModel/initializeState',
      payload: ['myCashFlowIsEnd', 'myCashFlowPagingState'],
    });
    this.dispatch({
      type: 'dataTableModel/updateState',
      payload: {moneyOperationType: operationType},
    });
    this.dispatch({type: 'userModel/getMyCashFlow'});
  };

  sliceList = ({myCashFlow}) => {
    const {sorting, searchText} = this.state;
    let currentList = [...myCashFlow];
    if (myCashFlow) {
      if (sorting === 'up') {
        currentList = _.sortBy([...currentList], ['delta']);
      } else if (sorting === 'down') {
        currentList = _.reverse(_.sortBy([...currentList], ['delta']));
      }
      if (searchText) {
        currentList = _.reduce(
          currentList,
          (newList, listItem) => {
            const {crossReferenceId} = listItem;
            if (crossReferenceId.indexOf(searchText) >= 0) {
              newList.push(listItem);
            }
            return newList;
          },
          [],
        );
      }
      this.setState({currentList});
    }
  };

  compareDate = date => {
    const today = moment(new Date());
    const dayDiff = today.diff(date, 'days', true);
    return dayDiff < 0 || dayDiff >= 90;
  };

  renderTableBody = () => {
    const {currentList} = this.state;
    if (currentList.length) {
      return _.map(currentList, listItem => {
        const {createdTime, delta, type, balance} = listItem;
        let {crossReferenceId} = listItem;
        const key = crossReferenceId;
        // const cutIndex = crossReferenceId.indexOf(':');
        // if (cutIndex > -1) {
        //   crossReferenceId = _.trimEnd(
        //     crossReferenceId,
        //     crossReferenceId.substring(cutIndex, crossReferenceId.length - 1),
        //   );
        // }
        const deltaColor = delta < 0 ? 'red' : 'green';
        const date = moment(createdTime * 1000).format(dateFormat);
        const stringArry = getConcatArray(crossReferenceId);
        return (
          <tr key={`${createdTime}${key}`}>
            <td>{date}</td>
            <td>
              <ClipboardButton
                onSuccess={this.onCopySuccess}
                data-clipboard-text={crossReferenceId}>
                <Tooltip
                  title={this.state.tooltipText}
                  onVisibleChange={this.onToolTipVisibleChange}>
                  <span className={css.profile_tableAnchor}>
                    <i>{stringArry[0]}</i>
                    <MDIcon iconName="multiplication" />
                    <MDIcon iconName="multiplication" />
                    <MDIcon iconName="multiplication" />
                    <MDIcon iconName="multiplication" />
                    <i>{stringArry[1]}</i>
                  </span>
                </Tooltip>
              </ClipboardButton>
            </td>
            <td>{type}</td>
            <td data-align="right" data-color={deltaColor}>
              {addCommas(delta)}元
            </td>
            <td data-align="right">{addCommas(balance)}元</td>
          </tr>
        );
      });
    }
    return (
      <tr>
        <td colSpan="5">暂无数据</td>
      </tr>
    );
  };

  renderTypesDropdown = () => {
    const {moneyOperationType} = this.props;
    const selectAll = () => this.onTypeClick(null);
    return (
      <ul className={css.header_dropdown}>
        <button
          type="button"
          className={css.header_dropdown_menuItem}
          data-checked={moneyOperationType === null}
          onClick={selectAll}>
          <span data-type="label">全部</span>
        </button>
        {_.map(moneyOperationTypeRefs, (typeValue, typeKey) => {
          const onClick = () => this.onTypeClick(typeKey);
          const btnProps = {
            className: css.header_dropdown_menuItem,
            'data-checked': moneyOperationType === typeKey,
            key: typeKey,
            onClick,
          };
          return (
            <button type="button" {...btnProps}>
              <span data-type="label">{typeValue}</span>
            </button>
          );
        })}
      </ul>
    );
  };

  renderDateThead = () => {
    const {date} = this.props;
    const yesterday = moment(date).add(-1, 'd');
    const tomorrow = moment(date).add(1, 'd');
    const prevDay = () => this.onDateChange(yesterday);
    const nextDay = () => this.onDateChange(tomorrow);
    return (
      <td>
        <DatePicker
          className={css.datePicker}
          defaultValue={moment()}
          value={date}
          onChange={this.onDateChange}
          disabledDate={this.compareDate}
        />

        <button
          type="button"
          onClick={prevDay}
          disabled={this.compareDate(yesterday)}>
          <MDIcon
            className={css.profile_tableChevronIcon}
            iconName="chevron-left"
          />
          <span>前一天</span>
        </button>
        <button
          type="button"
          onClick={nextDay}
          style={{marginLeft: 16}}
          disabled={this.compareDate(tomorrow)}>
          <span>后一天</span>
          <MDIcon
            className={css.profile_tableChevronIcon}
            iconName="chevron-right"
          />
        </button>
      </td>
    );
  };

  renderBreadcrum = () => {
    const {routes, targetUser} = this.props;
    return _.map(routes, (member, index) => {
      const {userId, username} = member;
      const onClick = () =>
        this.onBreadcrumClick({
          ...member,
          index,
        });
      return (
        <button
          type="button"
          disabled={`${targetUser}用户详情` === username}
          className={css.profile_breadcrumItem}
          key={userId}
          onClick={onClick}>
          <MDIcon iconName="chevron-right" />
          <i>{username}</i>
        </button>
      );
    });
  };

  renderFormLabel = () => {
    const {targetUser, profileSelectedNav} = this.props;
    if (profileSelectedNav === 'memberManage' && targetUser) {
      return (
        <h4 className={css.profile_formLabel}>
          <button
            type="button"
            onClick={this.props.onInitialListClick}
            className={css.profile_breadcrumItem__main}>
            <i>我的用户列表</i>
          </button>
          {this.renderBreadcrum()}
        </h4>
      );
    }
  };

  renderLoadMore = () => {
    const {myCashFlowIsEnd} = this.props;
    const loadMore = () => {
      this.dispatch({type: 'userModel/getMyCashFlow'});
    };
    return (
      <div className={css.loadMore_button_container}>
        {!myCashFlowIsEnd && (
          <button
            type="button"
            onClick={loadMore}
            className={css.loadMore_button}
            disabled={myCashFlowIsEnd}>
            加载更多
          </button>
        )}
      </div>
    );
  };

  render() {
    const {sorting, searchText} = this.state;
    const {moneyOperationType} = this.props;
    return (
      <div className={userCSS.content_body}>
        {this.renderFormLabel()}
        <div className={tableCSS.table_container}>
          <table className={tableCSS.table}>
            <thead>
              <tr>
                {this.renderDateThead()}
                <td>
                  <div className={css.profile_tableSearchBox}>
                    <button
                      type="button"
                      className={tableCSS.search_button}
                      onClick={this.onSearchClick}>
                      <MDIcon
                        className={searchText && tableCSS.search_icon_active}
                        iconName="magnify"
                      />
                    </button>
                    <input
                      className={css.table_search_input}
                      placeholder="收支单号"
                      value={searchText}
                      onChange={this.onSearchChange}
                    />
                    <button type="button" onClick={this.onSearchClear}>
                      <MDIcon
                        className={!searchText && tableCSS.close_icon_inactive}
                        iconName="close-circle"
                      />
                    </button>
                  </div>
                </td>
                <td>
                  <Dropdown
                    overlay={this.renderTypesDropdown()}
                    onVisibleChange={this.onTypeDropdownVisibleChange}
                    visible={this.state.typeDropdownVisible}>
                    <button type="button" style={{marginLeft: '0.5rem '}}>
                      {moneyOperationType
                        ? moneyOperationTypeRefs[moneyOperationType]
                        : '交易类型'}
                      <MDIcon
                        iconName="menu-down"
                        className={css.profile_tableMenuDownIcon}
                      />
                    </button>
                  </Dropdown>
                </td>
                <td data-align="right">
                  <i style={{marginRight: '0.5rem'}}>交易金额</i>
                  <button type="button" onClick={() => this.onSortChange('up')}>
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
                <td data-align="right">帐变后余额</td>
              </tr>
            </thead>
            <tbody>{this.renderTableBody()}</tbody>
          </table>

          {this.renderLoadMore()}
        </div>
      </div>
    );
  }
}

const mapStatesToProps = ({userModel, dataTableModel, layoutModel}) => ({
  myCashFlow: userModel.myCashFlow,
  myCashFlowIsEnd: userModel.myCashFlowIsEnd,
  profileSelectedNav: layoutModel.profileSelectedNav,
  ...dataTableModel,
});

export default connect(mapStatesToProps)(CashFlowList);
