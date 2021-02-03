import React, {Component} from 'react';
import classnames from 'classnames';
import DateThread from 'components/User/Form/DateThread';
import InputTextField from 'components/User/Form/InputTextField';
import AntdTable from 'components/User/Form/AntdTable';
import TeamReportPopUp from 'components/User/AgentCenter/TeamReport/TeamReportPopUp';
import _ from 'lodash';
import {connect} from 'dva';
import {type, getDateTimeRange} from 'utils';
import {Button} from 'components/General';
import SVG from 'react-inlinesvg';
import searchIcon from 'assets/image/User/ic-search.svg';
import css from 'styles/User/Dsf/TeamReport1.less';
import userCSS from 'styles/User/User.less';
import {teamReportS} from 'services/gameReport/';
import {renderValue} from 'services/gameReport/general';

const {
  ReportSearchMaxDays,
  gamePlatformType: {ALL, BET, MG},
  DateTimeframeQuickRefs,
} = type;

class TeamReport extends Component {
  LABEL_WIDTH = '50px';

  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
    this.state = {
      selectedRow: null,
    };
  }

  componentDidMount() {
    this.dispatch({
      type: 'reportModel/initializeAll',
    });
    this.dispatch({
      type: 'reportModel/updateState',
      payload: {
        usernameList: [],
        selectedGamePlatform: BET,
      },
    });
    this.onTimeframeQuicklinkClick({
      value: 'ThisMonth',
      selectGamePlatform: BET,
    });
  }

  componentWillUnmount() {
    this.dispatch({
      type: 'reportModel/initializeState',
      payload: [
        'startDatetime',
        'endDatetime',
        'agentId',
        'selectedGamePlatform',
      ],
    });
  }

  onClearDateClick = () => {
    this.onTimeframeQuicklinkClick({
      value: 'ThisMonth',
    });
  };

  onDateChange = ([startTime, endTime]) => {
    if (!startTime && !endTime) {
      this.onClearDateClick();
    } else if (startTime && endTime) {
      this.dispatch({
        type: 'reportModel/updateState',
        payload: {
          startDatetime: startTime,
          endDatetime: endTime,
          selectedTimeframeQuickLink: '',
        },
      });
      this.onGetTeamListSummary();
    }
  };

  onTimeframeChange = event => {
    const current = event.target;
    const value =
      (current.dataset && current.dataset.daycounts) ||
      current.getAttribute('data-daycounts');
    this.onTimeframeQuicklinkClick({value});
  };

  onTimeframeQuicklinkClick = ({value, selectGamePlatform}) => {
    const {selectedGamePlatform} = this.props.reportModel;
    const dateTimeRange = getDateTimeRange(value);

    if (dateTimeRange) {
      this.dispatch({
        type: 'reportModel/updateState',
        payload: {
          startDatetime: dateTimeRange.startDatetime,
          endDatetime: dateTimeRange.endDatetime,
          selectedTimeframeQuickLink: value,
        },
      });
      if (selectGamePlatform !== undefined) {
        this.dispatch({
          type: 'reportModel/updateState',
          payload: {selectedGamePlatform: selectGamePlatform},
        });
      }
      this.onSearchClick(selectGamePlatform || selectedGamePlatform);
    }
  };

  onRangePickerChange = event => {
    const {selectedGamePlatform} = this.props.reportModel;

    if (event && event.length >= 2) {
      if (Math.abs(event[0].diff(event[1], 'days')) >= ReportSearchMaxDays) {
        this.dispatch({
          type: 'formModel/postErrorMessage',
          payload: {
            msg: `查询区间需在${ReportSearchMaxDays}天以内`,
          },
        });
      } else {
        this.dispatch({
          type: 'reportModel/updateState',
          payload: {startDatetime: event[0], endDatetime: event[1]},
        });
        this.dispatch({
          type: 'reportModel/initializeState',
          payload: ['selectedTimeframeQuickLink'],
        });
        this.onSearchClick(selectedGamePlatform);
      }
    }
  };

  onGamePlatformSelect = ({currentTarget}) => {
    const selectedGamePlatform = currentTarget.value;
    this.dispatch({
      type: 'reportModel/updateState',
      payload: {selectedGamePlatform},
    });
    this.onSearchClick(selectedGamePlatform);
  };

  onSearchClick = gamePlatform => {
    this.dispatch({
      type: 'reportModel/initializeState',
      payload: [
        'displayListTemp',
        'displayList',
        'displayListPersonalReport',
        'displayListDownline',
        'sortedInfo',
        'previousSelectedTimeframeQuickLink',
      ],
    });
    this.dispatch({
      type: 'reportModel/updateState',
      payload: {selectedGamePlatform: gamePlatform},
    });
    this.onGetTeamListSummary();
  };

  onUserClick = ({username, userId, isClearList = false}) => {
    const {selectedTimeframeQuickLink} = this.props.reportModel;
    const {usernameList} = this.props.reportModel;
    let userList = _.cloneDeep(usernameList);
    if (isClearList) {
      userList = [];
    } else {
      const index = userList.findIndex(x => x.username === username);
      if (index > -1) {
        if (userList[index + 1]) {
          userList.splice(index + 1, userList.length);
        }
      } else {
        userList.push({username, userId});
      }
    }

    this.dispatch({
      type: 'reportModel/updateState',
      payload: {
        username: isClearList ? '' : username,
        isMain: true,
        usernameList: userList,
        agentId: userId,
      },
    });

    this.onTimeframeQuicklinkClick({
      value:
        selectedTimeframeQuickLink === ''
          ? 'Today'
          : selectedTimeframeQuickLink,
    });
  };

  onGamePlatformClick = gamePlatform => {
    this.dispatch({
      type: 'reportModel/updateState',
      payload: {selectedGamePlatform: gamePlatform},
    });
    this.onGetTeamListSummary();
  };

  onPersonalReportClick = ({selectedKey, username}) => {
    const {displayList, selectedGamePlatform} = this.props.reportModel;
    const {username: currentUsername} = this.props.userModel;
    const selectedRow = displayList[selectedGamePlatform].data[selectedKey];
    if (selectedRow.isPersonalReportPopUp) {
      selectedRow.isPersonalReportPopUp = false;
    } else {
      selectedRow.isPersonalReportPopUp = true;
    }
    selectedRow.key = selectedKey;

    this.setState({
      selectedRow: selectedRow.isPersonalReportPopUp ? selectedRow : null,
    });

    const selectedUsername = currentUsername === username ? '' : username;

    if (username) {
      if (selectedGamePlatform === BET) {
        this.dispatch({
          type: 'reportModel/getTeamPersonalLotteryListStatement',
          username: selectedUsername,
        });
      } else {
        this.dispatch({
          type: 'reportModel/getTeamPersonalListStatement',
          username: selectedUsername,
        });
      }
    }
    this.dispatch({
      type: 'reportModel/updateDisplayList',
      displayList,
    });
  };

  onKeyPress = event => {
    if (event.key.toLowerCase() === 'enter') this.onSearchUserClick();
  };

  onSearchUserChange = event => {
    if (event.target) {
      const {value} = event.target;

      if (value === '') {
        this.onGetTeamListSummary();
        this.dispatch({
          type: 'reportModel/initializeState',
          payload: ['searchText'],
        });
      } else {
        this.dispatch({
          type: 'reportModel/updateState',
          payload: {
            searchText: value,
          },
        });
      }
    }
  };

  onPageChange = currentPage => {
    const {displayList, selectedGamePlatform} = this.props.reportModel;
    displayList[selectedGamePlatform].currentPage = currentPage;
    this.dispatch({
      type: 'reportModel/updateDisplayList',
      displayList,
    });
  };

  onPageChangeDownline = currentPage => {
    const {displayListDownline} = this.props.reportModel;
    displayListDownline.currentPage = currentPage;
    this.dispatch({
      type: 'updateState',
      payload: {
        displayListDownline: _.cloneDeep(displayListDownline),
      },
    });
  };

  onPageSizeChange = (currentPage, pageSize) => {
    this.dispatch({
      type: 'reportModel/updateState',
      payload: {pageSize},
    });
  };

  static getDimension = (gamePlatform, layer) => {
    const {width = 0, height = 450} = teamReportS[gamePlatform].tableDimension(
      gamePlatform,
    )[layer];

    return {width, height};
  };

  gameReportMain = gamePlatform => {
    const {sortedInfo} = this.props.reportModel;
    const columns = [];
    columns.push(
      ...teamReportS[gamePlatform].gameReportMain({
        selectedGamePlatform: gamePlatform,
        renderTitle: row => {
          if (row === '小计') {
            return <b>小计</b>;
          }
          return <b>{row}</b>;
        },
        renderTitleAnchor: ({username, userCount, teamMemberCount, userId}) => {
          if (username === '小计') {
            return <b>小计</b>;
          }
          if (teamMemberCount > 1) {
            return (
              <button
                type="button"
                className={css.teamReport_link}
                onClick={() =>
                  this.onUserClick({
                    username,
                    userId,
                  })
                }>
                {username}
              </button>
            );
          }

          return <span>{username}</span>;
        },
        renderValue: data => renderValue(data),
        renderOperation: data => this.renderOperation(data),
        sortedInfo,
      }),
    );

    return columns;
  };

  gameReportMainData = selectedGamePlatform => {
    const {displayList} = this.props.reportModel;
    if (displayList) {
      return teamReportS[selectedGamePlatform].gameReportMainData({
        displayList,
        selectedGamePlatform:
          selectedGamePlatform === ALL ? MG : selectedGamePlatform,
      });
    }

    return {};
  };

  onGetTeamListSummary = () => {
    this.dispatch({
      type: 'reportModel/getTeamListSummary',
    });
    this.dispatch({
      type: 'reportModel/initializeState',
      payload: ['searchText'],
    });
  };

  onSearchUserClick = () => {
    this.dispatch({
      type: 'reportModel/getSearchDisplayListItem',
    });
  };

  renderGamePlatformTab = () => {
    const {
      gamePlatformList,
      reportModel: {selectedGamePlatform},
    } = this.props;
    const gamePlatformTab = Object.values(gamePlatformList).map(
      ({gamePlatform, gameNameInChinese}) => {
        if (gamePlatform !== BET || !teamReportS[gamePlatform]) return null;
        return (
          <button
            type="button"
            className={css.teamReport_gamePlatformTab}
            key={gamePlatform}
            value={gamePlatform}
            onClick={this.onGamePlatformSelect}
            data-active={gamePlatform === selectedGamePlatform}>
            {gameNameInChinese}
          </button>
        );
      },
    );
    return (
      <div className={css.teamReport_gamePlatformTabOuter}>
        {gamePlatformTab}
      </div>
    );
  };

  renderPersonalReportTable = ({selectedUsername, selectedUplineUsername}) => {
    const {
      displayListPersonalReport,
      selectedGamePlatform,
    } = this.props.reportModel;
    const columns = teamReportS[selectedGamePlatform].gameReportPersonal({
      selectedGamePlatform,
      renderTitle: row => {
        if (row === '小计') {
          return <b>小计</b>;
        }
        return <span>{row}</span>;
      },
      renderValue: data => renderValue(data),
    });
    let props = {};
    const {data, count} = teamReportS[
      selectedGamePlatform
    ].gameReportPersonalData({
      displayList: displayListPersonalReport,
      selectedGamePlatform,
      selectedUsername,
      selectedUplineUsername,
    });
    if (count > 0) {
      const {width: x, height: y} = TeamReport.getDimension(
        selectedGamePlatform,
        'personalReport',
      );
      props = {
        pagination: false,
        dataSource: data,
        scroll: {
          x,
          y,
        },
      };
    }
    return (
      <AntdTable
        // className={css.teamReport_personalReportTable}
        columns={columns}
        {...props}
      />
    );
  };

  renderOperation = row => {
    const {
      reportModel: {displayList, selectedGamePlatform},
    } = this.props;

    if (row.key === 'sumTable' || !displayList[selectedGamePlatform]) {
      return <span>&nbsp;</span>;
    }
    const returnValue = [];
    returnValue.push(
      <div key={`${row.key}个人报表div`}>
        <Button
          key={`${row.key}个人报表CoreButton`}
          className={classnames(
            css.profile_formBtn__submit,
            css.teamReport_personalReportBtn,
          )}
          style={{minWidth: '4rem', height: '2rem'}}
          onClick={() =>
            this.onPersonalReportClick({
              selectedKey: row.key,
              username: row.title.username,
            })
          }
          placeholder="个人报表"
          disabled={row.totalBet === 0 && row.totalPayout === 0}
        />
      </div>,
    );
    return <div className={css.teamReport_detailBtns}>{returnValue}</div>;
  };

  sortChange = (pagination, filters, sorter) => {
    this.dispatch({
      type: 'reportModel/updateState',
      payload: {
        sortedInfo: sorter,
      },
    });
  };

  renderTable() {
    const {reportModel} = this.props;
    const {displayList, pageSize} = reportModel;
    const gamePlatformSelected = BET;
    const columns = this.gameReportMain(gamePlatformSelected);
    let props = {};
    const {data, count} = this.gameReportMainData(gamePlatformSelected);
    let pagination = {};
    if (displayList[gamePlatformSelected]) {
      pagination = {
        defaultCurrent: 1,
        pageSize,
        pageSizeOptions: ['10', '20', '50'],
        current: displayList[gamePlatformSelected].currentPage || 1,
        showQuickJumper: true,
        showSizeChanger: true,
        total:
          (displayList[gamePlatformSelected].data &&
            displayList[gamePlatformSelected].data.length) ||
          0,
        onChange: this.onPageChange.bind(this),
        onShowSizeChange: this.onPageSizeChange.bind(this),
      };
    }

    if (count > 0) {
      props = {
        pagination,
        dataSource: data,
        scroll: {
          x: TeamReport.getDimension(gamePlatformSelected, 'main').width,
        },
        onChange: this.sortChange,
      };
    }
    return (
      <AntdTable
        className={css.teamReport_mainTableOuter}
        columns={columns}
        {...props}
      />
    );
  }

  renderSearchBox() {
    const {reportModel} = this.props;
    const {searchText} = reportModel;

    return (
      <div>
        <div className={css.teamReport_searchBox}>
          <InputTextField
            id="searchInput"
            label="用户名"
            value={searchText}
            labelWidth={this.LABEL_WIDTH}
            onKeyPress={this.onKeyPress}
            onChange={this.onSearchUserChange}
          />
        </div>
        <div className={css.teamReport_searchBtnDiv}>
          <button
            type="button"
            className={css.teamReport_searchBtn}
            onClick={this.onSearchUserClick}>
            <SVG className={css.svg_icon_search} src={searchIcon} />
          </button>
        </div>
      </div>
    );
  }

  render() {
    const {selectedRow} = this.state;
    const {reportModel} = this.props;
    const {
      startDatetime,
      endDatetime,
      selectedTimeframeQuickLink,
    } = reportModel;

    const dateThreadProps = {
      currentDayCounts: selectedTimeframeQuickLink,
      startTime: startDatetime,
      endTime: endDatetime,
      timeframeRefs: DateTimeframeQuickRefs,
      onDateChange: this.onDateChange,
      onTimeframeChange: this.onTimeframeChange,
    };

    return (
      <div>
        <div className={userCSS.content_body}>
          <div className={css.teamReport_filter_div}>
            <DateThread {...dateThreadProps} />
            {this.renderSearchBox()}
          </div>
          {/* <div className={css.teamReport_filter}>
            {this.renderGamePlatformTab()}
          </div> */}
          <div>{this.renderTable()}</div>
        </div>
        {selectedRow && (
          <TeamReportPopUp
            onPersonalReportClick={this.onPersonalReportClick}
            row={selectedRow}
          />
        )}
      </div>
    );
  }
}

function mapStatesToProps({reportModel, userModel, playerModel}) {
  const {gamePlatformList} = playerModel;
  return {reportModel, userModel, gamePlatformList};
}

export default connect(mapStatesToProps)(TeamReport);
