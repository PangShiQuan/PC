import React, {Component} from 'react';
import {isEqual, ceil, random, pickBy, isUndefined} from 'lodash';
import {Link} from 'dva/router';
import moment from 'moment';
import {Countdown} from 'components/General';
import {hasTrendChart} from 'utils';
import {Switch} from 'antd';
import {edition} from 'config';
import css from 'styles/betCenter/GameHeader.less';
import resolve from 'clientResolver';
import SVG from 'react-inlinesvg';
import misspredictIcon from 'assets/image/allIcon/misspredictIcon.svg';
import historyIcon from 'assets/image/allIcon/historyIcon.svg';

const LastOpenResult = resolve.plugin('LastOpenResult');
const CountDownTimer = resolve.plugin('CountDownTimer');

class GameHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nextOrderTimeRemain: 0,
      thisOrderTimeRemain: 0,
    };
    this.dispatch = props.dispatch;
    this.onCountDownFinish = props.onCountDownFinish;
    this.toggleGameStatus = props.toggleGameStatus;
  }

  componentDidMount() {
    this.setupTimeRemain(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props.thisGameResult, nextProps.thisGameResult)) {
      this.setupTimeRemain(nextProps);
    }
  }

  componentWillUnmount() {
    clearTimeout(this.timeoutId);
  }

  onOrderFinish = () => {
    this.setState(prevState => ({
      thisOrderTimeRemain: prevState.nextOrderTimeRemain,
    }));
    this.onCountDownFinish();
  };

  onOrderTick = timeRemain => {
    let randomTime;
    const {thisGameInfo} = this.props;
    const {frequency} = thisGameInfo;
    // 如果是高频彩的话，时间就短些，低频彩的话按照原来的逻辑执行30秒
    if (frequency === 'HIGH') {
      randomTime = ceil(random(8000, 12000), -3);
    } else {
      randomTime = ceil(random(10000, 30000), -3);
    }
    if (timeRemain > 0 && ceil(timeRemain, -3) % randomTime === 0) {
      this.dispatch({type: 'gameInfosModel/getCurrentResults'});
      this.dispatch({type: 'gameInfosModel/getThisGameResults'});
    }
    if (timeRemain <= 0) {
      this.onCountDownFinish();
    }
    if (timeRemain < 3000) {
      this.toggleGameStatus(true);
    } else {
      this.toggleGameStatus(false);
    }
  };

  setupTimeRemain({thisGameResult, currentServerTime}) {
    if (thisGameResult) {
      const {
        lastIssueNumber,
        lastOpenCode,
        nextStopOrderTimeEpoch,
        nextUniqueIssueNumber,
        stopOrderTimeEpoch,
        uniqueIssueNumber,
        gameUniqueId,
      } = thisGameResult;

      const nextOrderTimeRemain =
        (nextStopOrderTimeEpoch - stopOrderTimeEpoch) * 1000;

      let thisOrderTimeRemain =
        (stopOrderTimeEpoch - currentServerTime()) * 1000;
      if (thisOrderTimeRemain <= 0) {
        thisOrderTimeRemain += nextOrderTimeRemain;
      }

      const payLoad = {
        nextOrderTimeRemain,
        thisOrderTimeRemain,
      };

      // 检查该更新期数
      if (
        this.props.uniqueIssueNumber === '-' ||
        this.props.thisGameId !== gameUniqueId ||
        this.props.uniqueIssueNumber !== uniqueIssueNumber + 1
      ) {
        payLoad.lastIssueNumber = lastIssueNumber;
        payLoad.nextUniqueIssueNumber = nextUniqueIssueNumber;
        payLoad.uniqueIssueNumber = uniqueIssueNumber;
        payLoad.lastOpenCode = lastOpenCode;
      }

      this.dispatch({
        type: 'betCenter/updateState',
        payload: payLoad,
      });

      if (
        thisOrderTimeRemain !== this.state.thisOrderTimeRemain ||
        nextOrderTimeRemain !== this.state.nextOrderTimeRemain
      ) {
        this.setState({
          nextOrderTimeRemain,
          thisOrderTimeRemain,
        });
      }
    } else {
      this.timeoutId = setTimeout(() => {
        this.dispatch({type: 'gameInfosModel/getCurrentResults'});
        this.dispatch({type: 'gameInfosModel/getThisGameResults'});
        this.setupTimeRemain(this.props);
      }, 10000);
    }
  }

  toggleGameLayout = checked => {
    const {onInitializeClick, onRemoveAll, gameNav, onNavSelect} = this.props;
    onInitializeClick();
    onRemoveAll();

    this.dispatch({
      type: 'betCenter/updateState',
      payload: {displayTableLayout: !checked},
    });
    onNavSelect({
      methodGroup: Object.keys(gameNav)[0],
      gameSubNav: gameNav[Object.keys(gameNav)[0]],
    });
  };

  shouldShowGameLayoutSwitch = () => {
    const {
      thisGameInfo: {category, displayType},
      thisGameId,
    } = this.props;

    return (
      edition === 'New' &&
      category === 'KUAI3' &&
      thisGameId.endsWith('K3') &&
      displayType &&
      displayType === 'USER_DEFINE'
    );
  };

  renderInfo() {
    const {thisGameInfo, thisGameId, displayTableLayout} = this.props;
    if (thisGameInfo) {
      const {gameNameInChinese, gameIconUrl} = thisGameInfo;
      const withTrend = hasTrendChart(thisGameId, [thisGameInfo]);

      return (
        <div className={css.gameHeader_infos}>
          <img
            className={css.gameIcon}
            src={gameIconUrl}
            alt={gameNameInChinese}
          />
          <div className={css.gameHeader_infosContent}>
            <p className={css.headerGameName}>{gameNameInChinese}</p>
            <div className={css.headerLinks}>
              <Link
                target="trendPage"
                disabled={!withTrend}
                to={`/trends/${thisGameId}`}
                className={css.headerLink}>
                <SVG className={css.misspredictIcon} src={misspredictIcon} />
                {withTrend ? '遗漏分析' : '暂不支持'}
              </Link>
              <Link
                target="_blank"
                to={`/result/${thisGameId}`}
                className={css.headerLink}>
                <SVG className={css.historyIcon} src={historyIcon} />
                历史开奖
              </Link>
            </div>
            {this.shouldShowGameLayoutSwitch() && (
              <div className={css.gameLayoutSwitch_container}>
                <span data-active={displayTableLayout}>赌桌</span>
                <Switch
                  defaultChecked
                  checked={!displayTableLayout}
                  onChange={this.toggleGameLayout}
                />
                <span data-active={!displayTableLayout}>简化</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  }

  renderCountDown() {
    const lotteryPriceList =
      localStorage.getItem('UserlotteryPriceList') ||
      localStorage.getItem('GuestlotteryPriceList');
    const filteredGame = pickBy(
      JSON.parse(lotteryPriceList),
      (value, key) => key === this.props.thisGameId,
    );

    const thisGame = filteredGame[Object.keys(filteredGame)[0]];

    if (this.state.thisOrderTimeRemain) {
      const countDownProps = {
        onComplete: this.onOrderFinish,
        onTick: this.onOrderTick,
        parseTime: CountDownTimer,
        timeRemain: this.state.thisOrderTimeRemain,
      };

      return (
        <div className={css.gameHeader_timer}>
          <div className={css.gameHeader_Label}>
            <p className={css.gameHeaderLabel}>
              距<strong>{this.props.uniqueIssueNumber}</strong>期封盘，还有
            </p>
          </div>
          <Countdown {...countDownProps} />
        </div>
      );
    }
    return (
      <div className={css.gameHeader_timer}>
        <p>
          {isUndefined(thisGame)
            ? '此彩种已关闭，尚未获得购彩时间'
            : '加载购彩时间中...'}
        </p>
      </div>
    );
  }

  renderResult() {
    const {
      thisGameResult,
      thisGameId,
      lastIssueNumber,
      lastOpenCode,
    } = this.props;
    if (thisGameResult) {
      const {lastOpenTime} = thisGameResult;
      const openTimeEpoch = moment(lastOpenTime).format('x') / 1000;
      const lastOpenProps = {
        lastOpenCode,
        thisGameId,
        uniqueIssueNumber: lastIssueNumber,
        currentTimeEpoch: openTimeEpoch,
      };
      return (
        <div className={css.gameHeader__LastOpenResult}>
          <LastOpenResult {...lastOpenProps} />
        </div>
      );
    }
    return (
      <div className={css.gameHeader__LastOpenResult}>
        <p className={css.LastOpenResultLabel}>距离开奖尚未获得开奖数据</p>
      </div>
    );
  }

  render() {
    return (
      <div className={css.gameHeader}>
        {this.renderInfo()}
        {this.renderCountDown()}
        {this.renderResult()}
      </div>
    );
  }
}

export default GameHeader;
