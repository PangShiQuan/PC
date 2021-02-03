import React from 'react';
import {EllipsisLoader, LotteryBalls} from 'components/General';
import css from 'styles/betCenter/GameHeader.less';
import lotteryCss from 'styles/general/Dsf/lotteryBalls1.less';

function LastOpenResult({
  lastOpenCode,
  uniqueIssueNumber,
  currentTimeEpoch,
  thisGameId,
}) {
  if (lastOpenCode) {
    const lotteryBallsProps = {
      currentTimeEpoch,
      diceSize: '2rem',
      gameId: thisGameId,
      numsClassName: lotteryCss.lottery__highlight,
      numsDividerClassName: css.gameHeader_openNumberDivider,
      openCode: lastOpenCode,
      pokerSize: 1.2,
      forCQSSCFontStyle: '17px'
    };
    return (
      <React.Fragment>
        <p className={css.gameHeader_headerPhase}>
          第 <strong>{uniqueIssueNumber}</strong> 期开奖号码
        </p>
        <LotteryBalls {...lotteryBallsProps} />
      </React.Fragment>
    );
  }
  return (
    <p className={css.playground_headerPhase__grayOut}>
      正等待第 <strong>{uniqueIssueNumber}</strong> 期开奖
      <EllipsisLoader duration={5000} />
    </p>
  );
}

export default LastOpenResult;
