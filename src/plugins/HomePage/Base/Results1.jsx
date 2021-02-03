import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux, Link} from 'dva/router';
import moment from 'moment';
import classnames from 'classnames';

import {EllipsisLoader, LotteryBalls, MDIcon} from 'components/General';
import css from 'styles/homepage/Base/results1.less';
import lotteryCss from 'styles/general/Base/lotteryBalls1.less';
import homeCss from 'styles/homepage/Base/homepageBody1.less';
import {hasTrendChart} from 'utils';

class Results extends Component {
  constructor(props) {
    super(props);
    this.state = {
      histories: [],
    };
    this.dispatch = props.dispatch;
  }

  componentWillMount() {
    if (this.props.currentResults) {
      // console.debug('componentWillMount', this.props.currentResults);
      this.setState({
        histories: this.storeAnnoucement(this.props),
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.currentResults &&
      nextProps.currentResults !== this.props.currentResults
    ) {
      this.setState({
        histories: this.storeAnnoucement(nextProps),
      });
    }
  }

  onBetCenterClick = thisGameId => {
    this.dispatch({type: 'betCenter/updateState', payload: {thisGameId}});
    this.dispatch(routerRedux.push({pathname: '/betcenter'}));
  };

  storeAnnoucement({currentResults}) {
    const newHistories = [];
    currentResults.forEach(results => {
      const {
        gameNameInChinese,
        openTime,
        gameUniqueId,
        lastOpenCode,
        lastIssueNumber,
      } = results;
      const isPK = gameUniqueId === 'HF_XYPK' || gameUniqueId === 'HF_LFKLPK';
      newHistories.push(
        <li
          key={gameNameInChinese + lastIssueNumber}
          className={css.results_listItem}>
          <div>
            <div className={css.results_itemHeaders}>
              <p className={css.results_lotName}>{gameNameInChinese}</p>
              <p className={css.results_lotPhase}>第{lastIssueNumber}期</p>
            </div>
            <p className={css.results_lotDate}>
              {moment(openTime).format('YYYY-MM-DD HH:mm:ss')}
            </p>
          </div>
          {lastOpenCode ? (
            Results.renderLotBalls(results)
          ) : (
            <p className={css.results_awaitMsg}>
              正在开奖 <EllipsisLoader duration={5000} />
            </p>
          )}
          <p className={css.results_permalinks}>
            {hasTrendChart(gameUniqueId) ? (
              <Link
                to={`/trends/${gameUniqueId}`}
                className={css.results_permalink}
                target="trendPage">
                走势
              </Link>
            ) : null}
            <button
              disabled={isPK}
              onClick={() => this.onBetCenterClick(gameUniqueId)}
              className={css.results_permalink}>
              {isPK ? '尚未开放' : '投注'}
            </button>
            <Link
              target="_blank"
              to={`/result/${gameUniqueId}`}
              className={css.results_permalink}>
              历史开奖
            </Link>
          </p>
        </li>,
      );
    }, this);
    return newHistories;
  }

  static renderLotBalls({gameUniqueId, lastOpenCode, currentTimeEpoch}) {
    const lotteryBallsProps = {
      currentTimeEpoch,
      diceSize: '1.5rem',
      gameId: gameUniqueId,
      numsClassName: lotteryCss.lottery,
      numsContainerClassName: css.results_numbers,
      numsDividerClassName: css.results_numberDivider,
      openCode: lastOpenCode,
      pokerSize: 0.75,
      hideSymbolic: true,
      indexShow:true,
    };
    return <LotteryBalls {...lotteryBallsProps} />;
  }

  render() {
    const {histories} = this.state;
    return (
      <div className={classnames(homeCss.homePage_panel, css.results_panel)}>
        <div className={css.results_headers}>
          <h4
            className={classnames(
              homeCss.homePage_panelHeader,
              css.results_header,
            )}>
            开奖公告
          </h4>
          <h3
            className={classnames(
              homeCss.homePage_panelHeader,
              css.results_btn__loadMore,
            )}>
            <Link to="/result">更多<MDIcon iconName="chevron-right" className={css.result_chevron} /></Link>

          </h3>
        </div>
        <div className={css.results_list}>{histories}</div>
      </div>
    );
  }
}

function mapStatesToProps({gameInfosModel}) {
  return {
    currentResults: gameInfosModel.currentResults,
  };
}

export default connect(mapStatesToProps)(Results);
