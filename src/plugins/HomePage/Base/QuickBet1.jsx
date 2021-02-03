import React, {Component} from 'react';
import {Link, routerRedux} from 'dva/router';
import {connect} from 'dva';
import {
  split,
  find,
  keys,
  toNumber,
  map,
  random,
  ceil,
  throttle,
  filter,
  uniq,
  isEmpty,
} from 'lodash';
import classnames from 'classnames';
import {
  MDIcon,
  LoadingBar,
  SubButton,
  EllipsisLoader,
  Countdown,
} from 'components/General';
import {
  type,
  hasTrendChart,
  getHotGameList,
  getHotGameListsFilter,
} from 'utils';
import {betService} from 'services';
import css from 'styles/homepage/Base/quickBet1.less';
import lotteryCss from 'styles/general/Base/lotteryBalls1.less';
import homeCss from 'styles/homepage/Base/homepageBody1.less';
import trendIcon from 'assets/image/allIcon/trendIcon.svg';
import handIcon from 'assets/image/allIcon/handIcon.svg';
import changeBetIcon from 'assets/image/allIcon/changeBetIcon.svg';
import SVG from 'react-inlinesvg';

const {getRandomPicks, getBetString} = betService;
const {UNITS} = type;

class QuickBet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      amount: 0,
      amountUnit: 1,
      betStrArry: [],
      betString: '',
      multiply: 1,
      nextTimeRemain: 0,
      thisBetObj: '',
      thisGameResult: '',
      thisTimeRemain: 0,
      availableGame: {},
      hotGame: [],
    };
    this.secondPassed = props.secondPassed;
    this.awaitingResponse = props.awaitingResponse;
    this.dispatch = props.dispatch;
    this.onConfirmClick = this.onConfirmClick.bind(this);
    this.onRandomNumClick = this.onRandomNumClick.bind(this);
  }

  componentWillMount() {
    this.setAmount();
    this.setBetString(this.props);
    const {gameInfos} = this.props;
    const list = filter(gameInfos, ['recommendType', 'HOT']);
    const thisGameId = map(list, (item, index) => {
      return item.gameUniqueId;
    });
    this.dispatch({
      type: 'gameInfosModel/getSingleCollections',
      thisGameId,
    });
  }

  componentDidMount() {
    const {allGamesPrizeSettings, gameInfos, thisGameId} = this.props;
    this.secondPassed = 1;
    this.setCurrentGameResult(this.props);

    if (!isEmpty(allGamesPrizeSettings)) {
      const hotList = getHotGameListsFilter(
        gameInfos,
        allGamesPrizeSettings,
        thisGameId,
      );
      this.getHotGameLists(gameInfos, allGamesPrizeSettings, thisGameId);
      this.setState({hotGame: hotList});
    }
  }

  componentWillReceiveProps(nextProps) {
    const {gameInfos} = this.props;
    const list = filter(gameInfos, ['recommendType', 'HOT']);
    const thisGameId = map(list, (item, index) => {
      return item.gameUniqueId;
    });
    this.awaitingResponse = nextProps.awaitingResponse;
    if (this.props.currentResults !== nextProps.currentResults) {
      this.secondPassed = 1;
      this.setCurrentGameResult(nextProps);
      this.dispatch({
        type: 'gameInfosModel/getSingleCollections',
        thisGameId,
      });
    }

    if (this.props.thisGameId !== nextProps.thisGameId) {
      this.setCurrentGameResult(nextProps);
      this.setBetString(nextProps);
    }

    if (!isEmpty(nextProps.allGamesPrizeSettings)) {
      const hotList = getHotGameListsFilter(
        nextProps.gameInfos,
        nextProps.allGamesPrizeSettings,
        nextProps.thisGameId,
      );
      this.getHotGameLists(
        nextProps.gameInfos,
        nextProps.allGamesPrizeSettings,
        nextProps.thisGameId,
      );
      this.setState({hotGame: hotList});
    }

    if (
      this.props.allGamesPrizeSettings !== nextProps.allGamesPrizeSettings ||
      this.props.gameInfos !== nextProps.gameInfos
    ) {
      const hotList = getHotGameListsFilter(
        nextProps.gameInfos,
        nextProps.allGamesPrizeSettings,
        nextProps.thisGameId,
      );
      this.getHotGameLists(
        nextProps.gameInfos,
        nextProps.allGamesPrizeSettings,
        nextProps.thisGameId,
      );
      if (hotList.length !== 0) {
        this.onSelectGame(hotList[0].gameUniqueId);
      }
    }
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (prevState.thisGameResult !== this.state.thisGameResult) {
      this.setGameInfos(this.state);
    }
    if (
      prevState.amountUnit !== this.state.amountUnit ||
      prevState.multiply !== this.state.multiply
    ) {
      this.setAmount();
    }
  };

  componentWillUnmount() {
    this.dispatch({
      type: 'gameInfosModel/updateState',
      payload: {secondPassed: this.state.secondPassed},
    });
  }

  onBetCenterClick = () => {
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {
        homePageMethod: this.state.availableGame[this.props.thisGameId],
      },
    });
    this.dispatch(routerRedux.push({pathname: '/betcenter'}));
  };

  onRandomNumClick() {
    const {thisGameId} = this.props;
    const {gameRules} = this.state.availableGame[thisGameId];
    const thisBetObj = getRandomPicks(gameRules);
    const betString = getBetString({thisBetObj}, gameRules);
    const betStrArry = split(betString, '|');
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {thisGameId},
    });
    const newState = {
      betStrArry,
      thisBetObj,
      betString,
    };
    this.setState(newState);
  }

  onConfirmClick() {
    const {thisGameId} = this.props;
    const {betString, thisBetObj, amount, amountUnit, multiply} = this.state;
    const {gameMethod, methodId: gameplayMethod} = this.state.availableGame[
      thisGameId
    ];
    const methodGroup = split(gameMethod, '-')[0];
    const betEntry = {
      amount,
      amountUnit,
      betString,
      thisBetObj,
      gameMethod,
      gameplayMethod,
      id: `0__${gameplayMethod}__${gameMethod}__${betString}`,
      methodGroup,
      multiply,
      numberOfUnits: 1,
      thisOpenOption: [],
      pricePerUnit: amount,
      returnMoneyRatio: '0.000',
    };
    this.onBetCenterClick();
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {
        betEntries: [betEntry],
        amountUnit,
        multiply,
      },
    });
  }

  onMultipleChange(multiply) {
    if (multiply > 0) {
      this.setState({multiply});
    } else {
      this.setState({multiply: 1});
    }
  }

  onUnitToggle(amountUnit) {
    this.setState({amountUnit});
  }

  onSelectGame(thisGameId) {
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {thisGameId},
    });
  }

  onCountdownFinish = throttle(() => {
    this.setState(prevState => ({
      thisTimeRemain: prevState.nextTimeRemain,
    }));
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {
        uniqueIssueNumber: this.props.nextUniqueIssueNumber,
        nextUniqueIssueNumber: this.props.nextUniqueIssueNumber + 1,
      },
    });
  }, 1000);

  onTick = timeRemain => {
    this.secondPassed += 1;

    const randomTime = ceil(random(10000, 30000), -3);
    if (timeRemain > 0 && ceil(timeRemain, -3) % randomTime === 0) {
      this.dispatch({type: 'gameInfosModel/getCurrentResults'});
    }
    if (timeRemain <= 1000) {
      this.onCountdownFinish();
    }
  };

  setCurrentGameResult({currentResults, thisGameId}) {
    const thisGameResult = find(currentResults, ['gameUniqueId', thisGameId]);
    this.setState({thisGameResult, amountUnit: 1});
  }

  setGameInfos({thisGameResult}) {
    if (thisGameResult) {
      let {currentTimeEpoch} = thisGameResult;
      currentTimeEpoch += this.secondPassed;
      const {
        uniqueIssueNumber,
        nextUniqueIssueNumber,
        stopOrderTimeEpoch,
        nextStopOrderTimeEpoch,
      } = thisGameResult;
      let thisTimeRemain = (stopOrderTimeEpoch - currentTimeEpoch) * 1000;
      const nextTimeRemain =
        (nextStopOrderTimeEpoch - stopOrderTimeEpoch) * 1000;
      if (thisTimeRemain <= 0) {
        thisTimeRemain = nextTimeRemain + thisTimeRemain;
      }
      this.dispatch({
        type: 'betCenter/updateState',
        payload: {
          uniqueIssueNumber,
          nextUniqueIssueNumber,
        },
      });
      this.setState({
        nextTimeRemain,
        thisTimeRemain,
      });
    } else {
      this.setState({
        nextTimeRemain: 0,
        thisTimeRemain: 0,
      });
    }
  }

  setBetString({thisGameId}) {
    const {gameInfos, allGamesPrizeSettings} = this.props;
    const list = getHotGameList({gameInfos, allGamesPrizeSettings, thisGameId});
    const selectedGame = list[thisGameId] || list[keys(list)[0]];
    const {gameRules} = selectedGame;

    const thisBetObj = getRandomPicks(gameRules);
    const betString = getBetString({thisBetObj}, gameRules);
    const betStrArry = split(betString, '|');

    this.setState({
      betStrArry,
      betString,
      thisBetObj,
    });
  }

  setAmount() {
    const {amountUnit, multiply} = this.state;
    let amount = 2 * amountUnit * multiply;
    amount = amount.toFixed(2);
    amount = toNumber(amount);
    this.setState({amount});
  }

  increaseMultiple = () => {
    this.onMultipleChange(this.state.multiply + 1);
  };

  decreaseMultiply = () => {
    this.onMultipleChange(this.state.multiply - 1);
  };

  renderLotBalls = () => {
    const {betStrArry} = this.state;
    const {thisGameId, gameInfos, allGamesPrizeSettings} = this.props;
    const list = getHotGameList({gameInfos, allGamesPrizeSettings, thisGameId});
    let isList = false;
    map(list, (item, index) => {
      if (index === thisGameId) {
        isList = true;
      }
    });
    let LotBalls;
    if (!betStrArry.length) {
      LotBalls = (
        <p className={css.quickBet_awaitingMsg}>
          正获取彩种信息
          <EllipsisLoader duration={500} />
        </p>
      );
    } else {
      LotBalls = betStrArry.map((number, index) => (
        <div
          className={lotteryCss.lottery__highlight}
          key={`${number}${index}`}>
          <p>{number}</p>
        </div>
      ));
    }

    return (
      <div className={css.quickBet_numberingRow}>
        <div className={css.quickBet_lotNumbers}>{LotBalls}</div>
        <p className={css.quickBet_gameStyle}>
          {isList ? list[thisGameId].gameMethod : ''}
        </p>
        <button
          type="button"
          onClick={this.onRandomNumClick}
          className={css.quickBet_refreshBtn}>
          <SVG className={css.changeBetIcon} src={changeBetIcon} />
          换一注
        </button>
      </div>
    );
  };

  getHotGameLists = (gameInfos, allGamesPrizeSettings, thisGameId) => {
    const list = getHotGameList({gameInfos, allGamesPrizeSettings, thisGameId});
    this.setState({availableGame: list});
  };

  renderTabs() {
    const {thisGameId} = this.props;
    if (this.state.hotGame.length) {
      return map(this.state.hotGame, (listItem, index) => {
        if (index < 5) {
          const {gameUniqueId, gameNameInChinese} = listItem;
          const btnIsActive = gameUniqueId === thisGameId;
          const onClick = () => this.onSelectGame(gameUniqueId);

          if (this.state.hotGame.length === 1) {
            return null;
          }

          return (
            <button
              type="button"
              data-active={btnIsActive}
              disabled={btnIsActive}
              key={gameUniqueId}
              className={css.quickBet_tab}
              onClick={onClick}>
              {gameNameInChinese}
            </button>
          );
        }
      });
    }
    return null;
  }

  renderCal() {
    const {thisGameId, gameInfos, allGamesPrizeSettings} = this.props;
    const {multiply, amount, amountUnit, betString, betStrArry} = this.state;
    let selectedUnits = UNITS;
    let isDuplicateXYSM = false;
    const filterGame = find(gameInfos, ['gameUniqueId', thisGameId]);
    if (
      (filterGame.category === 'PK10', 'FIVE11') &&
      uniq(betStrArry).length === 2
    ) {
      isDuplicateXYSM = true;
    }
    if (
      this.state.availableGame[thisGameId] &&
      this.state.availableGame[thisGameId].units
    ) {
      selectedUnits = this.state.availableGame[thisGameId].units;
    }
    return (
      <div className={css.quickBet_calRow}>
        <div className={css.quickBet_calulator}>
          <div className={css.quickBet_unitBtns}>
            {map(selectedUnits, (unit, unitName) => {
              const buttonProps = {
                key: unitName,
                className: css.quickBet_unitBtn,
                'data-active': unit === amountUnit,
                onClick: this.onUnitToggle.bind(this, unit),
              };
              return (
                <button type="button" {...buttonProps}>
                  {unitName}
                </button>
              );
            })}
          </div>
          <div className={css.quickBet_multiplier}>
            <button
              type="button"
              className={css.quickBet_multiplyBtn}
              onClick={this.decreaseMultiply}>
              <MDIcon iconName="minus-circle" />
            </button>
            <strong className={css.quickBet_multiplySpan}>{multiply} 倍</strong>
            <button
              type="button"
              className={css.quickBet_multiplyBtn}
              onClick={this.increaseMultiple}>
              <MDIcon iconName="plus-circle" />
            </button>
          </div>
          <span className={css.quickBet_amount}>{amount} 元</span>
        </div>
        <SubButton
          disabled={isDuplicateXYSM ? true : !betString}
          placeholder="立刻下注"
          onClick={this.onConfirmClick}
          className={css.betSubtton}
        />
      </div>
    );
  }

  renderCoundown() {
    const {thisGameId, uniqueIssueNumber, gameInfos} = this.props;
    const gameInfo = find(gameInfos, ['gameUniqueId', thisGameId]);
    if (gameInfo) {
      return (
        <span className={css.quickBet_countDown}>
          距第 {uniqueIssueNumber} 期封盘，还有{' '}
          <Countdown
            onTick={this.onTick}
            timeRemain={this.state.thisTimeRemain}
          />
        </span>
      );
    }
    return null;
  }

  renderBody() {
    const {thisGameId, gameInfos, allGamesPrizeSettings} = this.props;
    const gameInfo = find(gameInfos, ['gameUniqueId', thisGameId]);
    const hotList = getHotGameListsFilter(
      gameInfos,
      allGamesPrizeSettings,
      thisGameId,
    );
    if (hotList.length === 0) {
      return <div className={css.quickBet_bodyNoGame} />;
    }
    if (gameInfo) {
      const {gameDescription, gameIconUrl, gameNameInChinese} = gameInfo;
      return (
        <div className={css.quickBet_body}>
          <div className={css.quickBet_gameInfos}>
            <img
              src={gameIconUrl}
              alt={gameNameInChinese}
              className={css.quickBet_gameIcon}
            />
            <div className={css.quickBet_infoContent}>
              <p className={css.quickBet_gameName}>{gameNameInChinese}</p>
              <p className={css.quickBet_gameDescription}>{gameDescription}</p>
              {this.renderCoundown()}
            </div>
            <div className={css.quickBet_actionBtns}>
              {hasTrendChart(thisGameId) ? (
                <Link
                  to={`/trends/${thisGameId}`}
                  className={css.quickBet_actionBtn}
                  target="trendPage">
                  <SVG className={css.trendIcon} src={trendIcon} />
                  <i>走势图</i>
                </Link>
              ) : null}
              <button
                type="button"
                className={css.quickBet_actionBtn}
                onClick={this.onBetCenterClick}>
                <SVG className={css.handIcon} src={handIcon} />
                <i>手动选号</i>
              </button>
            </div>
          </div>
          {this.renderLotBalls()}
          {this.renderCal()}
        </div>
      );
    }
    return null;
  }

  renderScene() {
    const {awaitingResponse} = this.props;
    return (
      <div className={classnames(homeCss.homePage_panel, css.quickBet_section)}>
        <div className={css.quickBet_tabs}>{this.renderTabs()}</div>
        <LoadingBar isLoading={awaitingResponse} />
        {this.renderBody()}
      </div>
    );
  }

  render() {
    const {gameInfos, thisGameId} = this.props;
    const {hotGame} = this.state;

    if (
      gameInfos.length &&
      hotGame.length &&
      hotGame.find(game => game.gameUniqueId === thisGameId)
    ) {
      return this.renderScene();
    }
    return null;
  }
}

function mapStatesToProps({gameInfosModel, betCenter}) {
  const {
    awaitingResponse,
    currentResults,
    gameInfos,
    secondPassed,
  } = gameInfosModel;
  const {uniqueIssueNumber, nextUniqueIssueNumber, thisGameId} = betCenter;
  return {
    awaitingResponse,
    currentResults,
    gameInfos,
    nextUniqueIssueNumber,
    secondPassed,
    thisGameId,
    uniqueIssueNumber,
  };
}

export default connect(mapStatesToProps)(QuickBet);
