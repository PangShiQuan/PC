import React, {Component} from 'react';
import {map} from 'lodash';
import {Link} from 'dva/router';
import {MDIcon, LotteryBalls} from 'components/General';
import resolve from 'clientResolver';
import lotteryCss from 'styles/general/Dsf/lotteryBalls1.less';

const css = resolve.client('styles/betCenter/GameHistory.less');

class GameHistory extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      collapse: false,
    };
    this.dispatch = props.dispatch;
    this.onCollapseClick = this.onCollapseClick.bind(this);
    this.getThisGameResults = props.getThisGameResults;
    this.onShowMoreClick = props.onShowMoreClick;
    this.onRefreshClick = props.onRefreshClick;
  }

  onCollapseClick() {
    const {collapse} = this.state;
    if (collapse) {
      this.dispatch({type: 'gameInfosModel/getThisGameResults'});
    }
    this.setState({collapse: !collapse});
  }

  renderOpenCode({openCode, currentTimeEpoch}, index) {
    const {thisGameId} = this.props;

    if (openCode) {
      const lotteryBallsProps = {
        currentTimeEpoch,
        diceSize: '1rem',
        gameId: thisGameId,
        numsClassName: lotteryCss.lottery__s,
        numsContainerClassName: css.gameHistory_openCodes,
        numsDividerClassName: css.gameHistory_openCodeDivider,
        openCode,
        pokerSize: 0.75,
        hideSymbolic: true,
        showPkTenIndex: index,
        inBetCenter: true,
      };
      return <LotteryBalls {...lotteryBallsProps} />;
    }
    return null;
  }

  renderTableBody() {
    const {thisGameId, thisGameResults} = this.props;
    if (thisGameResults && thisGameResults.length) {
      if (thisGameResults[0].gameUniqueId === thisGameId) {
        return map(thisGameResults, (listItem, index) => {
          const {uniqueIssueNumber, officialOpenTime} = listItem;
          const showUniqueIssueNumber = String(uniqueIssueNumber).slice(-4);
          return (
            <tr key={`${officialOpenTime}__${uniqueIssueNumber}`}>
              <td width="15%" className={lotteryCss.lottery__size}>
                <div>{showUniqueIssueNumber}</div>
              </td>
              <td width="85%">{this.renderOpenCode(listItem, index)}</td>
            </tr>
          );
        });
      }

      return (
        <tr>
          <td width="100%">数据加载中</td>
        </tr>
      );
    }

    return (
      <tr>
        <td width="100%">暂无数据</td>
      </tr>
    );
  }

  render() {
    return (
      <div className={css.gameHistory}>
        <div className={css.gameHistory_tableHeaderRow}>
          <div className={css.gameHistory_tableCell}>期号</div>
          <div className={css.gameHistory_tableCell}>开奖号</div>
        </div>
        <div
          className={css.gameHistory_body}
          data-collapse={this.state.collapse}>
          <table className={css.gameHistory_table}>
            <tbody>{this.renderTableBody()}</tbody>
          </table>
        </div>
        <div className={css.gameHistory_tableFooterRow}>
          <div className={css.gameHistory_tableCell}>
            <button
              type="button"
              onClick={this.onRefreshClick}
              className={css.gameHistory_tableFooterBtn}>
              <MDIcon iconName="refresh" />
              <i>刷新</i>
            </button>
          </div>
          <div className={css.gameHistory_tableCell}>
            <button
              type="button"
              onClick={this.onCollapseClick}
              className={css.gameHistory_tableFooterBtn}
              data-collapse={this.state.collapse}>
              <MDIcon
                iconName={
                  this.state.collapse
                    ? 'chevron-double-down'
                    : 'chevron-double-up'
                }
              />
            </button>
          </div>
          <div className={css.gameHistory_tableCell}>
            <Link
              target="_blank"
              to={`/result/${this.props.thisGameId}`}
              className={css.gameHistory_tableFooterBtn}>
              <MDIcon iconName="open-in-new" />
              <i>更多</i>
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

export default GameHistory;
