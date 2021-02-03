import React, {PureComponent} from 'react';
import {find} from 'lodash';
import {LotteryBalls, Countdown} from 'components/General';
import lotteryCss from 'styles/general/Dsf/lotteryBalls1.less';
import resultCss from 'styles/results/resultsTable.less';
import css from 'styles/betCenter/BetEntrance.less';

class LargeCardItem extends PureComponent {
  renderItemResult(gameUniqueId) {
    const {allResults, awaitingResponse} = this.props;
    if (!allResults || awaitingResponse) return null;
    const results = find(allResults, {gameUniqueId});
    // console.log(results);
    if (!results) return null;
    const {
      currentTimeEpoch,
      nextOfficialOpenTimeEpoch,
      officialOpenTimeEpoch,
      openCode,
      uniqueIssueNumber,
    } = results;
    const lotteryBallsProps = {
      currentTimeEpoch,
      diceSize: '1.5rem',
      gameId: gameUniqueId,
      hideSymbolic: true,
      numsClassName: lotteryCss.lottery,
      numsDividerClassName: resultCss.lotteryBallDivider,
      openCode,
      pokerSize: 0.75,
      numsContainerClassName: resultCss.numsContainerClassName,
    };
    let issueNumber = uniqueIssueNumber;
    let timeRemain = (officialOpenTimeEpoch - currentTimeEpoch) * 1000;
    if (timeRemain <= 0) {
      issueNumber += 1;
      timeRemain = (nextOfficialOpenTimeEpoch - officialOpenTimeEpoch) * 1000;
    }
    if (openCode) return <LotteryBalls {...lotteryBallsProps} />;
    else if (timeRemain < 0 && !openCode) return <p>正在开奖</p>;
    return (
      <p className={css.betEntrace_recommendResult}>
        <span>距</span>
        {issueNumber && <span>第{issueNumber}期</span>}
        <span>开奖还有</span>
        <Countdown
          timeRemain={timeRemain}
          onComplete={this.props.onResultCountComplete}
        />
      </p>
    );
  }
  renderOrderTime(gameUniqueId) {
    const {currentResults} = this.props;
    if (!currentResults) return null;
    const results = find(currentResults, {gameUniqueId});
    // console.log(results);
    if (!results) return null;
    const {
      stopOrderTimeEpoch,
      nextStopOrderTimeEpoch,
      currentTimeEpoch,
      uniqueIssueNumber,
    } = results;
    let issueNumber = uniqueIssueNumber;
    let timeRemain = (stopOrderTimeEpoch - currentTimeEpoch) * 1000;
    if (timeRemain <= 0) {
      issueNumber += 1;
      timeRemain = (nextStopOrderTimeEpoch - stopOrderTimeEpoch) * 1000;
    }
    return (
      <p className={css.betEntrace_recommendOrderTime}>
        {issueNumber && <span>第{issueNumber}期 </span>}
        <span>截止</span>
        <Countdown
          timeRemain={timeRemain}
          onComplete={this.props.onOrderCountComplete}
        />
      </p>
    );
  }
  render() {
    const {
      gameIconUrl,
      gameIconGrayUrl,
      disabled,
      gameNameInChinese,
      gameUniqueId,
    } = this.props.item;
    const imgSrc = disabled ? gameIconGrayUrl : gameIconUrl;
    return (
      <li key={gameUniqueId} className={css.betEntrace_recommendListItem}>
        <span
          className={css.betEntrace_listItemAvatar}
          style={{backgroundImage: `url('${imgSrc}')`}}
        />
        <div className={css.betEntrace_listItemContent}>
          <p className={css.betEntrace_listItemDesc}>
            <strong>{gameNameInChinese}</strong>, 上期开奖号
          </p>
          {this.renderItemResult(gameUniqueId)}
          {this.renderOrderTime(gameUniqueId)}
          {this.props.children}
        </div>
      </li>
    );
  }
}

export default LargeCardItem;
