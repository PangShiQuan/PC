import React, {Component} from 'react';
import moment from 'moment';
import _ from 'lodash';
import {Tooltip, Dropdown, DatePicker} from 'antd';
import ClipboardButton from 'react-clipboard.js';
import {connect} from 'dva';
import InputTextField from 'components/User/Form/InputTextField';
import {addCommas, type as TYPE, getConcatArray} from 'utils';
import {MDIcon} from 'components/General';
import css from 'styles/User/TradingCenter/CashFlowList.less';
import userCSS from 'styles/User/User.less';
import tableCSS from 'styles/User/Form/Table.less';
import SVG from 'react-inlinesvg';
import iconDropDown from 'assets/image/User/ic-angel-dm.svg';
import iconLeft from 'assets/image/User/ic-angel-last.svg';
import iconRight from 'assets/image/User/ic-angel-next.svg';
import searchIcon from 'assets/image/User/ic-search.svg';
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
        const {createdTime, delta, type, subType, balance} = listItem;
        const {crossReferenceId} = listItem;
        const key = crossReferenceId;
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
                  <span className={css.link}>
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
            <td>{subType}</td>
            <td data-color={deltaColor}>{addCommas(delta)}元</td>
            <td>{addCommas(balance)}元</td>
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
      <ul className={tableCSS.dropdown_menu}>
        <button
          type="button"
          className={tableCSS.dropdown_item}
          data-checked={moneyOperationType === null}
          onClick={selectAll}>
          <span data-type="label">全部</span>
        </button>
        {_.map(moneyOperationTypeRefs, (typeValue, typeKey) => {
          const onClick = () => this.onTypeClick(typeKey);
          const btnProps = {
            className: tableCSS.dropdown_item,
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
      <div className={css.dateTime}>
        <button
          className={css.button_prevDay}
          type="button"
          onClick={prevDay}
          disabled={this.compareDate(yesterday)}>
          <SVG className={css.svg_icon} src={iconLeft} />
        </button>
        <DatePicker
          className={css.datePicker}
          defaultValue={moment()}
          value={date}
          onChange={this.onDateChange}
          disabledDate={this.compareDate}
          allowClear={false}
        />
        <button
          className={css.button_nextDay}
          type="button"
          onClick={nextDay}
          disabled={this.compareDate(tomorrow)}>
          <SVG className={css.svg_icon} src={iconRight} />
        </button>
      </div>
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

  renderFilterThread = () => {
    const {searchText} = this.state;
    const {moneyOperationType} = this.props;

    return (
      <div style={{marginBottom: '20px'}}>
        <div className={css.filter_thread}>
          <div className={css.dateTime_div}>
            <div className={css.label}>日期</div>
            <div>{this.renderDateThead()}</div>
          </div>
          <div className={css.transaction_div}>
            <div className={css.label}>交易类型</div>
            <div>
              <Dropdown
                overlay={this.renderTypesDropdown()}
                trigger={['click']}>
                <button type="button" className={css.dropdown}>
                  {moneyOperationType
                    ? moneyOperationTypeRefs[moneyOperationType]
                    : '全部'}
                  <SVG className={css.svg_icon_dropdown} src={iconDropDown} />
                </button>
              </Dropdown>
            </div>
          </div>
        </div>
        <div className={css.search_div}>
          <div className={css.searchBox}>
            <InputTextField
              id="searchInput"
              label="订单号"
              value={searchText}
              labelWidth="70px"
              onChange={this.onSearchChange}
              style={{paddingRight: '43px'}}
            />
            <button
              type="button"
              className={css.search_button}
              onClick={this.onSearchClick}>
              <SVG className={css.svg_icon_search} src={searchIcon} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  render() {
    const {sorting} = this.state;

    return (
      <div className={userCSS.content_body}>
        {this.renderFilterThread()}
        <div className={tableCSS.table_container}>
          <table className={tableCSS.table}>
            <thead>
              <tr>
                <td>交易时间</td>
                <td>订单号</td>
                <td>交易类型</td>
                <td>交易项目</td>
                <td>
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
                <td>帐变后余额</td>
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
