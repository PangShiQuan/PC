import React, {Component} from 'react';
import {connect} from 'dva';
import {Link} from 'dva/router';
import {map, sum, split, toNumber, chunk, ceil, union} from 'lodash';
import {Dropdown, Spin} from 'antd';
import moment from 'moment';
import {EllipsisLoader, LotteryBalls, MDIcon} from 'components/General';
import css from 'styles/results/Dsf/singleResult1.less';
import lotteryCss from 'styles/general/Dsf/lotteryBalls1.less';
import predictIcon from 'assets/image/iconpredict.png';
import rulesIcon from 'assets/image/iconrules.png';
import {
  calculate,
  codeResult,
  hasTrendChart,
  settingMap,
  type as TYPE,
} from 'utils';

const {
  GAME_CATEGORY: {SHISHICAI, FIVE11, KUAI3, PCDANDAN},
  CUSTOM_GAME_CATEGORY: {G1, PK},
} = TYPE;
const {
  default: GAME_RESULT,
  getElementSeq,
  getLunpanColor,
  getLunpanNumber,
} = codeResult;

class SingleResultTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      chunkCount: this.getChunkCount(props),
      displayCodeType: 0,
    };
    this.dispatch = props.dispatch;
  }

  componentWillMount() {
    const {
      match: {
        params: {gameUniqueId: id},
      },
    } = this.props;

    this.selectResult(id);
  }

  componentWillReceiveProps(nextProps) {
    const {
      match: {
        params: {gameUniqueId},
      },
      thisGameResults,
    } = nextProps;

    if (this.props.match.params.gameUniqueId !== gameUniqueId) {
      this.selectResult(gameUniqueId);
    }
    if (this.props.thisGameResults !== thisGameResults) {
      this.pickDefaultIssue(nextProps);
      this.setState({
        chunkCount: this.getChunkCount(nextProps),
      });
    }
  }

  componentWillUnmount() {
    this.dispatch({
      type: 'betCenter/initializeState',
      payload: ['thisGameId', 'resultLimit'],
    });
    this.dispatch({
      type: 'gameInfosModel/initializeState',
      payload: ['selectedResult', 'selectedIssue', 'thisGameResults'],
    });
  }

  onIssueSelect(selectedIssue) {
    this.dispatch({
      type: 'gameInfosModel/updateState',
      payload: {selectedIssue},
    });
  }

  onDateSelect = selectedDayCounts => {
    this.dispatch({
      type: 'gameInfosModel/updateState',
      payload: {selectedDayCounts},
    });
    this.dispatch({type: 'gameInfosModel/getThisGameResultsByDate'});
  };

  onDisplayCodeTypeSelect = displayType => {
    this.setState({
      displayCodeType: displayType,
    });
  };

  getChunkCount = ({selectedDayCounts, thisGameResults}) => {
    if (!thisGameResults || !thisGameResults.length) return 0;
    const {length} = thisGameResults;
    return ceil((length - 1) / 2);
  };

  pickDefaultIssue({thisGameResults}) {
    if (thisGameResults && thisGameResults.length) {
      this.dispatch({
        type: 'gameInfosModel/updateState',
        payload: {selectedIssue: thisGameResults[0]},
      });
    }
  }

  selectResult(id) {
    const selectedResult = settingMap.gamesMap.find(
      ({gameUniqueId}) => gameUniqueId === id,
    );
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {thisGameId: id},
    });
    this.dispatch({
      type: 'gameInfosModel/updateState',
      payload: {selectedResult},
    });
    if (selectedResult.issueFrequency === 'LOW') {
      this.dispatch({type: 'gameInfosModel/getThisGameResults'});
    } else {
      this.dispatch({type: 'gameInfosModel/getThisGameResultsByDate'});
    }
  }

  renderTableBody(resultsList) {
    if (resultsList && resultsList.length) {
      return map(resultsList, item => {
        const {
          gameUniqueId,
          uniqueIssueNumber,
          openCode,
          openTime,
          currentTimeEpoch,
          openStatus,
        } = item;
        let numsClassName = css.lotteryBall;
        if (gameUniqueId.endsWith('MARK_SIX') || gameUniqueId === 'HF_JSMS') {
          numsClassName = css.markSixBall;
        }
        const lotteryBallsProps = {
          currentTimeEpoch,
          diceSize: '1.5rem',
          gameId: gameUniqueId,
          numsClassName,
          numsDividerClassName: css.lotteryBallDivider,
          openCode,
          pokerSize: 0.75,
          hideSymbolic: false,
          hideElement: true,
          displayCodeType: this.state.displayCodeType,
        };
        return this.renderTableCell({
          uniqueIssueNumber,
          openTime,
          lotteryBallsProps,
          openCode,
          openStatus,
        });
      });
    }
  }

  renderTableHead() {
    const {selectedResult} = this.props;
    switch (selectedResult.gameSettingsMap) {
      case SHISHICAI:
        return (
          <thead>
            <tr>
              <th style={{width: '20%'}}>期号</th>
              <th style={{width: '50%'}}>开奖号码</th>
              <th style={{width: '10%'}}>总和</th>
              <th style={{width: '10%'}}>斗牛</th>
              <th style={{width: '10%'}}>轮盘</th>
            </tr>
          </thead>
        );
      case FIVE11:
        return (
          <thead>
            <tr>
              <th style={{width: '20%'}}>期号</th>
              <th style={{width: '60%'}}>开奖号码</th>
              <th style={{width: '10%'}}>大:小</th>
              <th style={{width: '10%'}}>奇:偶</th>
            </tr>
          </thead>
        );
      case G1:
        return (
          <thead>
            <tr>
              <th style={{width: '20%'}}>期号</th>
              <th style={{width: '40%'}}>开奖号码</th>
              <th style={{width: '10%'}}>和值</th>
              <th style={{width: '10%'}}>大小单双</th>
              <th style={{width: '10%'}}>形态</th>
              <th style={{width: '10%'}}>轮盘</th>
            </tr>
          </thead>
        );
      case KUAI3:
        return (
          <thead>
            <tr>
              <th style={{width: '20%'}}>期号</th>
              <th style={{width: '50%'}}>开奖号码</th>
              <th style={{width: '10%'}}>和值</th>
              <th style={{width: '10%'}}>大小单双</th>
              <th style={{width: '10%'}}>形态</th>
            </tr>
          </thead>
        );
      case PK:
        return (
          <thead>
            <tr>
              <th style={{width: '20%'}}>期号</th>
              <th style={{width: '60%'}}>开奖号码</th>
              <th style={{width: '20%'}}>形态</th>
            </tr>
          </thead>
        );
      case PCDANDAN:
        return (
          <thead>
            <tr>
              <th style={{width: '20%'}}>期号</th>
              <th style={{width: '60%'}}>开奖号码</th>
              <th style={{width: '10%'}}>总和</th>
              <th style={{width: '10%'}}>轮盘</th>
            </tr>
          </thead>
        );
      default:
        return (
          <thead>
            <tr>
              <th style={{width: '30%'}}>期号</th>
              <th style={{width: '70%'}}>开奖号码</th>
            </tr>
          </thead>
        );
    }
  }

  renderTableCell({
    uniqueIssueNumber,
    openTime,
    lotteryBallsProps,
    openStatus,
    openCode,
  }) {
    const {selectedResult} = this.props;
    if (!openStatus) {
      const colSpan =
        {
          SHISHICAI: 4,
          FIVE11: 4,
          KUAI3: 5,
          G1: 6,
          PK: 3,
          PCDANDAN: 4,
        }[selectedResult.gameSettingsMap] || 2;

      return (
        <tr key={uniqueIssueNumber}>
          <td colSpan={colSpan}>
            正在开奖 <EllipsisLoader duration={3000} />
          </td>
        </tr>
      );
    }
    const strArray = split(openCode, ',');
    const numsArray = map(strArray, num => toNumber(num));
    const sliceLunPanNumber = Number(getLunpanNumber(numsArray).slice(2, 4));
    const sliceLunPanNumberColor = getLunpanColor(sliceLunPanNumber);
    let Content = null;

    switch (selectedResult.gameSettingsMap) {
      case SHISHICAI:
        Content = (
          <React.Fragment>
            <td>
              {GAME_RESULT.getTotalBigSmallOddEven(
                {methodMapId: SHISHICAI},
                numsArray,
              )}
            </td>
            <td>
              {GAME_RESULT.getCowName({methodMapId: SHISHICAI}, numsArray)}
            </td>
            <td>
              <span style={{color: sliceLunPanNumberColor}}>
                {sliceLunPanNumber}
              </span>
            </td>
          </React.Fragment>
        );
        break;
      case FIVE11:
        Content = (
          <React.Fragment>
            <td>
              {GAME_RESULT.getBigSmallRatio({methodMapId: FIVE11}, numsArray)}
            </td>
            <td>{calculate.form.oddEvenRatio(numsArray)}</td>
          </React.Fragment>
        );
        break;
      case KUAI3:
        {
          const totals = sum(numsArray);
          Content = (
            <React.Fragment>
              <td>{totals}</td>
              <td>
                {GAME_RESULT.getBigSmallOddEven({methodMapId: KUAI3}, totals)}
              </td>
              <td>{getElementSeq(numsArray)}</td>
            </React.Fragment>
          );
        }
        break;
      case G1: {
        const totals = sum(numsArray);
        Content = (
          <React.Fragment>
            <td>{totals}</td>
            <td>{GAME_RESULT.getBigSmallOddEven({methodMapId: G1}, totals)}</td>
            <td>{getElementSeq(numsArray, 9, [0, 1])}</td>
            <td>
              <span style={{color: sliceLunPanNumberColor}}>
                {sliceLunPanNumber}
              </span>
            </td>
          </React.Fragment>
        );
        break;
      }
      case PCDANDAN: {
        Content = (
          <React.Fragment>
            <td>
              {GAME_RESULT.getTotalBigSmallOddEven(
                {methodMapId: PCDANDAN},
                numsArray,
              )}
            </td>
            <td>
              <span style={{color: sliceLunPanNumberColor}}>
                {sliceLunPanNumber}
              </span>
            </td>
          </React.Fragment>
        );
        break;
      }
      case PK:
        Content = (
          <td>{GAME_RESULT.getPokerElement({methodMapId: PK}, numsArray)}</td>
        );
        break;
      default:
        break;
    }

    return (
      <tr key={uniqueIssueNumber}>
        <td>{uniqueIssueNumber}</td>
        <td>
          <LotteryBalls {...lotteryBallsProps} />
        </td>
        {Content}
      </tr>
    );
  }

  renderIssueDropdown() {
    const {thisGameResults} = this.props;
    return (
      <div className={css.issueDropdown}>
        {map(thisGameResults, item => {
          const onClick = () => this.onIssueSelect(item);
          return (
            <button
              type="button"
              className={css.issueDropdownBtn}
              key={item.uniqueIssueNumber}
              onClick={onClick}>
              第{item.uniqueIssueNumber}期
            </button>
          );
        })}
      </div>
    );
  }

  renderSelectedIssue() {
    const {selectedIssue} = this.props;
    if (selectedIssue) {
      const {
        openTime,
        uniqueIssueNumber,
        currentTimeEpoch,
        openCode,
        gameUniqueId,
      } = selectedIssue;
      const lotteryBallsProps = {
        currentTimeEpoch,
        diceSize: '1.5rem',
        gameId: gameUniqueId,
        numsClassName: lotteryCss.lottery,
        numsContainerClassName: css.singleIssueNumContainer,
        numsDividerClassName: css.singleIssueNumDivider,
        openCode,
        pokerSize: 0.75,
      };
      return (
        <div className={css.gameInfoRow}>
          <span>
            第
            <Dropdown overlay={this.renderIssueDropdown()} trigger={['click']}>
              <button type="button" className={css.issueSelectBtn}>
                <i>{uniqueIssueNumber}</i>
                <MDIcon iconName="menu-down" />
              </button>
            </Dropdown>
            期
          </span>
          <span>
            开奖日期：{moment(openTime).format('YYYY-MM-DD HH:mm:ss')}
          </span>
          <LotteryBalls {...lotteryBallsProps} />
        </div>
      );
    }
    return null;
  }

  renderGameInfo() {
    const {gameInfos, selectedResult} = this.props;
    const {gameNameInChinese, issueDuration, gameUniqueId} = selectedResult;
    const withTrend = hasTrendChart(gameUniqueId, gameInfos);
    return (
      <div className={css.gameInfo}>
        <div className={css.gameInfoRow}>
          <span className={css.gameName}>{gameNameInChinese}开奖公告</span>
          <span className={css.gameFrequency}>[每{issueDuration}开奖]</span>
          <Link
            target="trendPage"
            disabled={!withTrend}
            to={`/trends/${gameUniqueId}`}
            className={css.predictBtn}>
            <img
              src={predictIcon}
              className={css.predictIcon}
              alt="predictIcon"
            />
            {withTrend ? '号码走势' : '暂不支持'}
          </Link>
          <Link
            target="_blank"
            to={`/instructions?gameUniqueId=${gameUniqueId}`}
            className={css.rulesBtn}>
            <img src={rulesIcon} className={css.rulesIcon} alt="rulesIcon" />
            <span>玩法规则</span>
          </Link>
        </div>
        {this.renderSelectedIssue()}
      </div>
    );
  }

  renderTable() {
    const {awaitingResponse, gameInfos, thisGameResults} = this.props;

    if (!gameInfos.length || awaitingResponse)
      return (
        <Spin
          className={css.container}
          size="large"
          tip="正在加载开奖公告..."
        />
      );
    if (!thisGameResults) {
      return (
        <div className={css.container}>
          <p>暂无数据</p>
        </div>
      );
    }

    const resultChunk = chunk(thisGameResults, this.state.chunkCount);
    resultChunk[1] = union(resultChunk[1], resultChunk[2]);
    resultChunk.length = 2;

    return map(resultChunk, (result, index) => (
      <div className={css.tableContainer} key={index}>
        <table className={css.table}>
          {this.renderTableHead()}
          <tbody>{this.renderTableBody(result)}</tbody>
        </table>
      </div>
    ));
  }

  renderDateOption() {
    const {displayCodeType} = this.state;
    const {selectedDayCounts, selectedResult} = this.props;
    const isHighFreq = selectedResult.issueFrequency === 'HIGH';

    return (
      <div className={css.optionContainer}>
        {isHighFreq ? (
          <div className={css.dateOptions}>
            {map(TYPE.resultHistoryDateCount, date => {
              const onClick = () => this.onDateSelect(date.dayCounts);
              return (
                <button
                  type="button"
                  key={date.displayText}
                  data-active={selectedDayCounts === date.dayCounts}
                  className={css.dateOption}
                  onClick={onClick}>
                  {date.displayText}
                </button>
              );
            })}
          </div>
        ) : (
          <div className={css.dateOptions}>
            <span data-active className={css.dateOption}>
              40期
            </span>
          </div>
        )}
        <div className={css.openCodeOptions}>
          {map(TYPE.resultHistoryDisplayCodeType, displayType => {
            return (
              <button
                type="button"
                key={displayType.displayText}
                data-active={displayCodeType === displayType.type}
                className={css.openCodeOption}
                onClick={() => this.onDisplayCodeTypeSelect(displayType.type)}>
                <span className={css.label}>{displayType.displayText}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className={css.result}>
        {this.renderGameInfo()}
        {this.renderDateOption()}
        <div className={css.tables}>{this.renderTable()}</div>
      </div>
    );
  }
}

function mapStatesToProp({gameInfosModel}) {
  const {
    awaitingResponse,
    gameInfos,
    selectedResult,
    selectedIssue,
    selectedDayCounts,
    thisGameResults,
  } = gameInfosModel;
  return {
    awaitingResponse,
    gameInfos,
    selectedResult,
    selectedIssue,
    selectedDayCounts,
    thisGameResults,
  };
}

export default connect(mapStatesToProp)(SingleResultTable);
