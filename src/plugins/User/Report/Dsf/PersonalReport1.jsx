import React, {Component} from 'react';
import {connect} from 'dva';
import _ from 'lodash';

import {type, getDateTimeRange, isGuestUser} from 'utils';
import isPlatformExist from 'utils/isPlatformExist';
import {MDIcon} from 'components/General';
import ResponseMessageBar from 'components/User/ResponseMessageBar';
import DateThread from 'components/User/Form/DateThread';
import GameThread from 'components/User/Form/GameThread';
import AntdTable from 'components/User/Form/AntdTable';
import css from 'styles/User/Dsf/PersonalReport1.less';
import {personalReportS, getExpandRowList} from 'services/gameReport/';
import {renderValue, renderDate} from 'services/gameReport/general';

const {
  gamePlatformType: {
    ALL,
    BET,
    MG,
    IMSPORT,
    KY,
    FG,
    AVIA,
    CR,
    SSSPORT,
    THQP,
    LC,
    CQ9,
    NWG,
    BG,
    JDB,
    BBLQP,
    RMG,
    SB,
    BBIN,
  },
  ReportSearchMaxDays,
  DateTimeframeQuickRefs,
} = type;

class PersonalReport extends Component {
  static generateDataThirdLayer({displayList, gamePlatform, betLogKey}) {
    return personalReportS[gamePlatform].gameReportThirdLayerData({
      displayList,
      selectedGamePlatform: gamePlatform,
      betLogKey,
    });
  }

  static isRecordEmpty(data) {
    let isEmpty = true;
    _.map(data, (value, property) => {
      if (
        [
          'rebateAmount',
          'actualBet',
          'playerWinLoss',
          'totalPayout',
          'totalTransferIn',
          'totalBet',
          'totalTransferOut',
          'totalBonus',
        ].includes(property)
      ) {
        if (value > 0) {
          isEmpty = false;
        }
      }
    });
    return isEmpty;
  }

  constructor(props) {
    super(props);
    this.state = {
      popUpDetails: null,
    };
    this.isGuest = isGuestUser(props.userData);
    this.onBackClick = props.onBackClick;
    this.dispatch = props.dispatch;
    this.onNavSelect = props.onNavSelect;
  }

  componentDidMount() {
    const {gamePlatformList} = this.props;
    this.dispatch({
      type: 'reportModel/initializeAll',
      payload: ['username', 'originPage'],
    });
    this.onTimeframeQuicklinkClick({
      value: 'ThisMonth',
      selectGamePlatform:
        isPlatformExist(gamePlatformList) && !this.isGuest ? ALL : BET,
    });
  }

  componentDidUpdate(prevProps) {
    const {
      layoutModel: {profileSelectedNav: prevProfileSelectedNav},
    } = prevProps;
    const {
      layoutModel: {profileSelectedNav},
      gamePlatformList,
    } = this.props;

    if (prevProfileSelectedNav !== profileSelectedNav) {
      this.dispatch({
        type: 'reportModel/initializeAll',
      });
      this.onTimeframeQuicklinkClick({
        value: 'ThisMonth',
        selectGamePlatform:
          isPlatformExist(gamePlatformList) && !this.isGuest ? ALL : BET,
      });
    }
  }

  componentWillUnmount() {
    this.dispatch({
      type: 'reportModel/initializeState',
      payload: [
        'startDatetime',
        'endDatetime',
        'selectGamePlatform',
        'username',
        'originPage',
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
      if (Math.abs(endTime.diff(startTime, 'days')) >= ReportSearchMaxDays) {
        this.dispatch({
          type: 'formModel/updateState',
          payload: {
            responseMsg: {
              msg: `查询区间需在${ReportSearchMaxDays}天以内`,
              icon: 'close-circle-outline',
              color: 'red',
            },
          },
        });
        return;
      }

      this.dispatch({
        type: 'reportModel/updateState',
        payload: {
          startDatetime: startTime,
          endDatetime: endTime,
          selectedTimeframeQuickLink: '',
        },
      });
      this.dispatch({
        type: 'reportModel/getPersonalListStatement',
        runAnother: () => {
          this.dispatch({
            type: 'reportModel/getPersonalLotteryStatement',
          });
        },
      });
    }
  };

  onTimeframeChange = event => {
    const current = event.target;
    const value =
      (current.dataset && current.dataset.daycounts) ||
      current.getAttribute('data-daycounts');
    this.onTimeframeQuicklinkClick({value});
  };

  onTimeframeQuicklinkClick({value, selectGamePlatform}) {
    const {selectedGamePlatform} = this.props;
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

      if (selectGamePlatform) {
        this.dispatch({
          type: 'reportModel/updateState',
          payload: {selectedGamePlatform: selectGamePlatform},
        });
      }

      this.onSearchClick(selectGamePlatform || selectedGamePlatform);
    }
  }

  onGamePlatformSelect = ({currentTarget}) => {
    const selectedGamePlatform = currentTarget.value;
    this.dispatch({
      type: 'reportModel/updateState',
      payload: {selectedGamePlatform},
    });
    this.onSearchClick(selectedGamePlatform);
  };

  onSearchClick = (gamePlatform, initializeState = true) => {
    const {gamePlatformList} = this.props;
    if (initializeState) {
      this.dispatch({
        type: 'reportModel/initializeState',
        payload: [
          'displayList',
          'displayListTemp',
          'previousSelectedTimeframeQuickLink',
        ],
      });
    }
    if (gamePlatform === ALL) {
      if (isPlatformExist(gamePlatformList)) {
        this.dispatch({
          type: 'reportModel/getPersonalListStatement',
          runAnother: () => {
            this.dispatch({
              type: 'reportModel/getPersonalLotteryStatement',
            });
          },
        });
      } else {
        this.dispatch({
          type: 'reportModel/updateState',
          payload: {selectedGamePlatform: BET},
        });
        this.dispatch({
          type: 'reportModel/getPersonalLotteryStatement',
          onlyBet: true,
        });
      }
    } else if (gamePlatform === BET) {
      this.dispatch({
        type: 'reportModel/getPersonalLotteryStatement',
        onlyBet: true,
      });
    } else {
      this.dispatch({
        type: 'reportModel/getPersonalListStatement',
      });
    }
  };

  onExpandRow = ({currentTarget}) => {
    const {displayList} = this.props;
    const {value} = currentTarget;
    const {details, gamePlatform, isExpand} = JSON.parse(value);

    if (isExpand) {
      displayList[gamePlatform].isExpand = false;
    } else {
      displayList[gamePlatform].isExpand = true;
    }
    this.dispatch({
      type: 'reportModel/updateDisplayList',
      displayList,
    });
    if (!details) {
      this.dispatch({
        type: 'reportModel/updateState',
        payload: {selectedGamePlatformFromTable: gamePlatform},
      });
      if (gamePlatform === BET) {
        this.dispatch({
          type: 'reportModel/getPersonalLotteryStatement',
        });
      } else {
        this.dispatch({
          type: 'reportModel/getPersonalListDetailStatement',
        });
      }
    }
  };

  onExpandRowDetail = ({currentTarget}) => {
    const {displayList} = this.props;
    const {value} = currentTarget;
    const {details: gamePlatformDisplayListDetail, key} = JSON.parse(value);
    const {betLogs, gamePlatform, isExpand} = gamePlatformDisplayListDetail;

    displayList[gamePlatform].details[key] = {
      ...gamePlatformDisplayListDetail,
      isExpand: !isExpand,
    };
    this.dispatch({
      type: 'reportModel/updateDisplayList',
      displayList,
    });
    if (!(betLogs && betLogs[key])) {
      this.dispatch({
        type: 'reportModel/updateState',
        payload: {
          selectedGamePlatformFromTable: gamePlatform,
          selectedGamePlatformFromTableDetails: {
            gamePlatformDisplayListDetail,
            key,
          },
        },
      });
      this.dispatch({
        type: 'reportModel/getPersonalBetLog',
      });
    }
  };

  onPageChange = gamePlatform => currentPage => {
    const {displayList} = this.props;
    this.dispatch({
      type: 'reportModel/updateState',
      payload: {
        paginationCurrentPage: currentPage,
      },
    });

    const containDetails =
      displayList[gamePlatform] && displayList[gamePlatform].details;
    if (containDetails) {
      displayList[gamePlatform].currentPage = currentPage;
      this.dispatch({
        type: 'reportModel/updateDisplayList',
        displayList,
      });
    }
  };

  onPageChangeBetLog = ({gamePlatformName, betLogKey}) => currentPage => {
    const {displayList} = this.props;
    const containDetails =
      displayList[gamePlatformName] &&
      displayList[gamePlatformName].details[betLogKey];
    if (containDetails) {
      displayList[gamePlatformName].details[
        betLogKey
      ].currentPage = currentPage;
      this.dispatch({
        type: 'reportModel/updateDisplayList',
        displayList,
      });
    }
  };

  getWidthLength = (layer, gamePlatform, innerGamePlatform = '') => {
    const dimension = personalReportS[gamePlatform].tableDimension(
      gamePlatform,
    )[layer];
    if (dimension[innerGamePlatform] && innerGamePlatform !== '') {
      return dimension[innerGamePlatform].width || 0;
    }
    return dimension.width || 0;
  };

  renderWinLoss = ({settled, winLoss, isSports, betTradeStatus}) => {
    let statusColor = '';
    if (winLoss > 0) {
      statusColor = 'green';
    } else if (winLoss < 0) {
      statusColor = 'red';
    }

    if (isSports && !settled) {
      return <span> - </span>;
    }
    return (
      <span className={css.orderRecord_status} data-color={statusColor}>
        {renderValue(winLoss)}
      </span>
    );
  };

  generateColumnFirstLayer = ({selectedGamePlatform, expandedRowKeys}) => {
    const {gamePlatformList} = this.props;
    const columns = [];
    columns.push(
      ...personalReportS[selectedGamePlatform].gameReportFirstLayerColumn({
        selectedGamePlatform,
        renderTitle: row => {
          if (row === '小计') {
            return <b>{row}</b>;
          }
          return <b>{gamePlatformList[row].gameNameInChinese}</b>;
        },
        renderValue: data => renderValue(data),
        renderOperation: data => this.renderOperation(data),
      }),
    );

    return columns;
  };

  generateColumnSecondLayer = ({selectedGamePlatform, record}) => {
    const columns = [];
    columns.push(
      ...personalReportS[selectedGamePlatform].gameReportSecondLayerColumn({
        selectedGamePlatform,
        renderTitle: row => <span>{row}</span>,
        renderValue: data => renderValue(data),
        renderOperation: data => this.renderOperationDetail(data, record),
      }),
    );
    return columns;
  };

  generateColumnThirdLayer = selectedGamePlatform => {
    const {sortedInfo, gamePlatformList} = this.props;
    const {popUpDetails} = this.state;

    const columns = [];
    columns.push(
      ...personalReportS[selectedGamePlatform].gameReportThirdLayerColumn({
        selectedGamePlatform,
        renderValue: data => renderValue(data),
        renderWinLoss: data => this.renderWinLoss(data),
        renderOrderSearch: gamePlatformList[selectedGamePlatform].idText,
        sortedInfo,
        renderDate: data => renderDate(data),
        popUpDetailsState: popUpDetails,
        togglePopUpDetails: id =>
          this.setState(prevState => ({
            popUpDetails: prevState.popUpDetails === id ? false : id,
          })),
      }),
    );
    return columns;
  };

  generateDataFirstLayer = selectedGamePlatform => {
    const {displayList, gamePlatformList} = this.props;
    return personalReportS[selectedGamePlatform].gameReportFirstLayerData({
      displayList,
      selectedGamePlatform,
      gamePlatformList,
    });
  };

  generateDataSecondLayer = gamePlatform => {
    const {displayList} = this.props;
    return personalReportS[gamePlatform].gameReportSecondLayerData({
      displayList,
      selectedGamePlatform: gamePlatform,
    });
  };

  renderOperation = data => {
    const {displayList} = this.props;
    const expandedRowKeys = getExpandRowList(displayList);
    const icon =
      expandedRowKeys.indexOf(data.key) > -1 ? 'menu-up' : 'menu-down';
    const isEmptyRecord = PersonalReport.isRecordEmpty(data);
    if (
      data.key === 'sumTable' ||
      !displayList[data.key] ||
      displayList[data.key].count === 0 ||
      isEmptyRecord
    ) {
      return <span />;
    }
    const {details, gamePlatform, isExpand} = displayList[data.key];
    return (
      <button
        type="button"
        className={css.personalReport_detailsBtn}
        onClick={this.onExpandRow}
        value={JSON.stringify({
          details: Boolean(details),
          gamePlatform,
          isExpand,
        })}>
        详情 <MDIcon iconName={icon} />
      </button>
    );
  };

  renderOperationDetail = (data, record) => {
    const {displayList} = this.props;
    if (displayList[record.key] && displayList[record.key].details) {
      const expandedRowKeys = getExpandRowList(displayList[record.key].details);
      if (record.key !== BET) {
        const icon =
          expandedRowKeys.indexOf(data.key) > -1 ? 'menu-up' : 'menu-down';
        if (data.key === 'sumTable' || data.totalBet === 0) {
          return <span />;
        }

        return (
          <button
            type="button"
            className={css.personalReport_detailsBtn}
            onClick={this.onExpandRowDetail}
            value={JSON.stringify({
              details: displayList[data.gamePlatform].details[data.key],
              key: data.key,
            })}>
            详情 <MDIcon iconName={icon} />
          </button>
        );
      }
    }
  };

  renderTable = () => {
    const {displayList, selectedGamePlatform} = this.props;
    const expandedRowKeys = getExpandRowList(displayList);
    const columns = this.generateColumnFirstLayer({
      selectedGamePlatform,
      expandedRowKeys,
    });
    let props = {};
    let expandProps = {};
    const {data, count} = this.generateDataFirstLayer(selectedGamePlatform);
    if (count > 0) {
      props = {
        pagination: false,
        dataSource: data,
        scroll: {
          x: this.getWidthLength('1', selectedGamePlatform),
        },
      };
      expandProps = {
        expandedRowRender: record => this.renderTableDetail(record),
        expandedRowKeys,
        expandIconColumnIndex: 99,
        expandIconAsCell: false,
      };
    }
    return <AntdTable columns={columns} {...props} {...expandProps} />;
  };

  renderTableDetail = record => {
    const {displayList, selectedGamePlatform} = this.props;
    const columns = this.generateColumnSecondLayer({
      selectedGamePlatform: record.key,
      record,
    });
    let props = {};
    if (displayList[record.key] && displayList[record.key].details) {
      const expandedRowKeys = getExpandRowList(displayList[record.key].details);
      const data = this.generateDataSecondLayer(record.key);
      const detailsLength = displayList[record.key].details.length;
      // const pageSize = 5;
      // const pagination = {
      //   defaultPageSize: pageSize,
      //   defaultCurrent: 1,
      //   pageSize,
      //   current: displayList[record.key].currentPage || 1,
      //   total: displayList[record.key].details.length,
      //   showQuickJumper: true,
      //   onChange: this.onPageChange(record.key),
      // };
      if (detailsLength > 0) {
        props = {
          // pagination: detailsLength > pageSize ? pagination : false,
          pagination: false,
          dataSource: data,
          expandedRowRender: recordDetail =>
            this.renderTableDetailDetail({
              record: recordDetail,
              gamePlatformName: record.key,
            }),
          expandedRowKeys,
          expandIconColumnIndex: 99,
          expandIconAsCell: false,
          scroll: {
            x: this.getWidthLength('2', selectedGamePlatform, record.key),
          },
        };
      }
    }
    return <AntdTable columns={columns} {...props} />;
  };

  renderTableDetailDetail = value => {
    const {displayList} = this.props;
    const {gamePlatformName, record} = value;
    const columns = this.generateColumnThirdLayer(gamePlatformName);
    let props = {};
    const displayListTemp = displayList[gamePlatformName].details[record.key];
    if (displayListTemp && displayListTemp.betLogs) {
      const betLogsLength = displayListTemp.betLogs.length;
      const pageSize = 5;
      const pagination = {
        defaultPageSize: pageSize,
        defaultCurrent: 1,
        pageSize,
        current: displayListTemp.currentPage || 1,
        total: betLogsLength,
        showQuickJumper: true,
        onChange: this.onPageChangeBetLog({
          gamePlatformName,
          betLogKey: record.key,
        }),
      };
      const data = PersonalReport.generateDataThirdLayer({
        displayList: displayListTemp,
        gamePlatform: gamePlatformName,
        betLogKey: record.key,
      });
      switch (gamePlatformName) {
        case MG:
        case FG:
        case KY:
        case IMSPORT:
        case AVIA:
        case CR:
        case SSSPORT:
        case THQP:
        case LC:
        case BG:
        case RMG:
        case CQ9:
        case NWG:
        case JDB:
        case BBLQP:
        case SB:
        case BBIN:
          props = {
            columns,
            pagination: betLogsLength > pageSize ? pagination : false,
            dataSource: data,
            scroll: {
              x: this.getWidthLength('3', gamePlatformName),
            },
          };
          break;
        default:
          props = {
            columns,
          };
          break;
      }
    }
    return <AntdTable columns={columns} {...props} />;
  };

  render() {
    const {
      selectedGamePlatform,
      startDatetime,
      endDatetime,
      selectedTimeframeQuickLink,
    } = this.props;

    const dateThreadProps = {
      currentDayCounts: selectedTimeframeQuickLink,
      startTime: startDatetime,
      endTime: endDatetime,
      timeframeRefs: DateTimeframeQuickRefs,
      onDateChange: this.onDateChange,
      onTimeframeChange: this.onTimeframeChange,
    };

    return (
      <React.Fragment>
        <ResponseMessageBar />
        <div className={css.profile_contentBody}>
          <div className={css.profile_popUpBody}>
            <div style={{marginBottom: '20px'}}>
              <DateThread {...dateThreadProps} />
              <GameThread
                onGamePlatformSelect={this.onGamePlatformSelect}
                selectedGamePlatform={selectedGamePlatform}
              />
            </div>
            <div>{this.renderTable()}</div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

function mapStatesToProps({
  dataTableModel,
  reportModel,
  playerModel,
  userModel,
  layoutModel,
}) {
  return {
    layoutModel,
    ...dataTableModel,
    ...reportModel,
    gamePlatformList: playerModel.gamePlatformList,
    userData: userModel.userData,
  };
}

export default connect(mapStatesToProps)(PersonalReport);
