import React, {Component} from 'react';
import moment from 'moment';
import {Pagination} from 'antd';
import {connect} from 'dva';
import {addCommas, type as TYPE} from 'utils';
import InputTextField from 'components/User/Form/InputTextField';
import css from 'styles/User/Base/statisticsReport1.less';
import tableCSS from 'styles/User/Form/Table.less';
import DateThread from 'components/User/Form/DateThread';
import SVG from 'react-inlinesvg';
import searchIcon from 'assets/image/User/ic-search.svg';

const {timeframeRefs} = TYPE;

const dataLabelMap = {
  effectiveBet: '投注',
  commission: '佣金',
  pnl: '盈亏',
  sum: '总额',
  topup: '充值',
  reportDate: '日期',
  win: '派彩',
  withdrawal: '提款',
};

class StatisticsReport extends Component {
  LABEL_WIDTH = '50px';

  constructor(props) {
    super(props);
    this.state = {
      searchText: !props.searchable ? props.loginName : props.username || '',
    };
    this.dispatch = props.dispatch;
  }

  componentDidMount() {
    this.getData();
  }

  componentDidUpdate(prevProps) {
    const {name: prevName} = prevProps;
    const {name, dataUrl, loginName, searchable} = this.props;

    if (prevName !== name) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        searchText: (!searchable && loginName) || '',
      });
      this.dispatch({
        type: 'dataTableModel/initializeAll',
      });
      this.dispatch({
        type: `statisticsReportModel/${dataUrl}`,
        payload: {username: !searchable ? loginName : ''},
      });
    }
  }

  componentWillUnmount() {
    this.dispatch({
      type: 'dataTableModel/initializeAll',
    });
    this.dispatch({
      type: 'statisticsReportModel/initializeAll',
    });
    this.dispatch({
      type: 'reportModel/updateState',
      payload: {
        username: null,
      },
    });
  }

  onPageChange = (currentPage, pageSize) => {
    const start = (currentPage - 1) * pageSize;

    this.dispatch({
      type: 'dataTableModel/updateState',
      payload: {start, currentPage},
    });
    this.getData();
  };

  onPageSizeChange = (currentPage, pageSize) => {
    this.dispatch({
      type: 'dataTableModel/updateState',
      payload: {pageSize, currentPage, start: 0},
    });
    this.getData();
  };

  onKeyPress = event => {
    if (event.key.toLowerCase() === 'enter') this.onSearchClick();
  };

  onSearchChange = event => {
    const {value} = event.target;

    this.setState({searchText: value});
  };

  onSearchClear = () => {
    const {dataUrl} = this.props;

    this.setState({searchText: ''});
    this.dispatch({type: `statisticsReportModel/${dataUrl}`});
  };

  onSearchClick = () => {
    this.getData();
  };

  onClearDateClick() {
    const dayCounts = 7; // reset to 一周
    const newStartTime = moment(new Date()).add(-dayCounts, 'days');
    const endTime = moment();

    this.dispatch({
      type: 'dataTableModel/updateState',
      payload: {startTime: newStartTime, endTime, dayCounts},
    });
    this.getData();
  }

  onDateChange = ([startTime, endTime]) => {
    if (!startTime && !endTime) {
      this.onClearDateClick();
    } else if (startTime && endTime) {
      const dayCounts = -1;
      this.dispatch({
        type: 'dataTableModel/updateState',
        payload: {startTime, endTime, dayCounts},
      });
      this.getData();
    }
  };

  onTimeframeChange = event => {
    const current = event.target;
    const dayCounts =
      (current.dataset && current.dataset.daycounts) ||
      current.getAttribute('data-daycounts');
    const newStartTime = moment(new Date()).add(-dayCounts, 'days');
    const endTime = moment();

    this.dispatch({
      type: 'dataTableModel/updateState',
      payload: {startTime: newStartTime, endTime, dayCounts},
    });
    this.getData();
  };

  getData = () => {
    const {dataUrl} = this.props;
    const {searchText} = this.state;

    this.dispatch({
      type: `statisticsReportModel/${dataUrl}`,
      payload: {username: searchText},
    });
  };

  renderTableBody() {
    const {data} = this.props;
    if (data) {
      const dataset = Array.isArray(data)
        ? data
        : Array.prototype.concat([], data);
      const dataMapping = Array.isArray(data) ? '' : 'sum';
      let dataName = [
        'pnl',
        'effectiveBet',
        'win',
        'commission',
        'topup',
        'withdrawal',
      ];

      if (dataMapping)
        dataName = dataName.map(
          name => dataMapping + name.slice(0, 1).toUpperCase() + name.slice(1),
        );

      return dataset.map(listItem => {
        const {id, reportDate} = listItem;

        return (
          <tr key={id || null}>
            {reportDate ? <td>{reportDate}</td> : null}
            <td>{addCommas(listItem[dataName[0]])} 元</td>
            <td>{addCommas(listItem[dataName[1]])} 元</td>
            <td>{addCommas(listItem[dataName[2]])} 元</td>
            <td>{addCommas(listItem[dataName[3]])} 元</td>
            <td>{addCommas(listItem[dataName[4]])} 元</td>
            <td>{addCommas(listItem[dataName[5]])} 元</td>
          </tr>
        );
      });
    }

    return (
      <tr>
        <td colSpan="7">暂无数据</td>
      </tr>
    );
  }

  renderSearchBox() {
    const {searchText} = this.state;

    return (
      <div className={css.statsReport_searchRow}>
        <div className={css.statsReport_searchBox}>
          <InputTextField
            id="searchInput"
            label="用户名"
            value={searchText}
            labelWidth={this.LABEL_WIDTH}
            onKeyPress={this.onKeyPress}
            onChange={this.onSearchChange}
          />
        </div>
        <div className={css.statsReport_searchBtnDiv}>
          <button
            type="button"
            className={css.statsReport_searchBtn}
            onClick={this.onSearchClick}>
            <SVG className={css.svg_icon_search} src={searchIcon} />
          </button>
        </div>
      </div>
    );
  }

  renderTableHead() {
    const {reportType} = this.props;
    const {
      pnl,
      effectiveBet,
      win,
      commission,
      topup,
      withdrawal,
    } = dataLabelMap;
    const datasLabelSeq = [
      pnl,
      effectiveBet,
      win,
      commission,
      topup,
      withdrawal,
    ];

    return reportType === 'personal'
      ? [
          <td key={0}>{dataLabelMap.reportDate}</td>,
          ...datasLabelSeq.map((label, index) => (
            <td key={index + 1}>{label}</td>
          )),
        ]
      : datasLabelSeq.map((label, index) => (
          <td key={index}>{label + dataLabelMap.sum}</td>
        ));
  }

  renderPagination() {
    const {currentPage, pageSize, totalCount} = this.props;

    return (
      <Pagination
        className={tableCSS.pagination}
        current={currentPage}
        pageSize={pageSize}
        onChange={this.onPageChange}
        onShowSizeChange={this.onPageSizeChange}
        showQuickJumper
        showSizeChanger
        total={totalCount}
      />
    );
  }

  render() {
    const {
      pagination,
      searchable,
      dayCounts: currentDayCounts,
      startTime,
      endTime,
    } = this.props;

    const dateThreadProps = {
      currentDayCounts,
      startTime,
      endTime,
      timeframeRefs,
      onDateChange: this.onDateChange,
      onTimeframeChange: this.onTimeframeChange,
    };
    return (
      <div>
        <div className={css.statsReport_filter}>
          <DateThread {...dateThreadProps} />
          {searchable ? this.renderSearchBox() : null}
        </div>
        <div className={tableCSS.table_container}>
          <table className={tableCSS.table}>
            <thead>
              <tr>{this.renderTableHead()}</tr>
            </thead>
            <tbody>{this.renderTableBody()}</tbody>
          </table>
        </div>
        {pagination ? this.renderPagination() : null}
      </div>
    );
  }
}

const mapStatesToProps = ({
  dataTableModel,
  statisticsReportModel,
  userModel,
}) => ({
  ...dataTableModel,
  ...statisticsReportModel,
  loginName: userModel.username,
});

export default connect(mapStatesToProps)(StatisticsReport);
