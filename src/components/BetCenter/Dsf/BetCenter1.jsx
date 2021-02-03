import React, {Component} from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import {Spin, notification, Modal} from 'antd';
import {
  isEqual,
  round,
  find,
  toNumber,
  reject,
  forEach,
  slice,
  isEmpty,
  split,
  keys,
} from 'lodash';
import betPrize from 'utils/betPrize';
import resolve from 'clientResolver';
import {edition} from 'config';
import {settingMap, type as TYPE, specialHandleLunpanBetString} from 'utils';
import getSeparator from 'utils/betCenter/textBetIdentifier';
import {getBetString as getBetsString} from 'utils/betCenter/getBetStringFromText';
import updateBet from 'utils/betCenter/updateBet';
import css from 'styles/betCenter/Dsf/BetCenterIndex1.less';
import {betService} from 'services';
import GameNav from 'components/BetCenter/GameNav';
import GameSubNav from 'components/BetCenter/GameSubNav';
import GameHeader from 'components/BetCenter/GameHeader';
import GameOpenOption from 'components/BetCenter/GameOpenOption';
import GameTextBoard from 'components/BetCenter/GameTextBoard';
import GameHistory from 'components/BetCenter/GameHistory';
import ReturnRatioCtrl from 'components/BetCenter/ReturnRatioCtrl';
import GameTableK3 from '../GameTableK3';
// 修改
const GameBoard = resolve.plugin('GameBoard');
const GameCal = resolve.plugin('GameCal');
const GameCart = resolve.plugin('GameCart');

const {gamesMap, gameSettingsMap} = settingMap;
const {
  getRandomPicks,
  getBetString,
  getOpenOptionsString,
  getNumberOfUnits,
} = betService;

class BetCenterIndex extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalIsVisible: false,
    };
    this.awaitingResponse = props.awaitingResponse;
    this.dispatch = props.dispatch;
    this.getAmount = this.getAmount.bind(this);
    this.getAmountPerUnit = this.getAmountPerUnit.bind(this);
    this.getEntriesTotal = this.getEntriesTotal.bind(this);
    this.onAddEntry = this.onAddEntry.bind(this);
    this.onBetClick = this.onBetClick.bind(this);
    this.onControllerClick = this.onControllerClick.bind(this);
    this.onCountDownFinish = this.onCountDownFinish.bind(this);
    this.onEditBetClick = this.onEditBetClick.bind(this);
    this.onInitializeClick = this.onInitializeClick.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.onInputBlur = this.onInputBlur.bind(this);
    this.onModalCancel = this.onModalCancel.bind(this);
    this.onModalOk = this.onModalOk.bind(this);
    this.onPostEntryHandler = this.onPostEntryHandler.bind(this);
    this.onQuickBetClick = this.onQuickBetClick.bind(this);
    this.onRandomClick = this.onRandomClick.bind(this);
    this.onRefreshClick = this.onRefreshClick.bind(this);
    this.onRemoveAll = this.onRemoveAll.bind(this);
    this.onReturnRatioChange = this.onReturnRatioChange.bind(this);
    this.onShowMoreClick = this.onShowMoreClick.bind(this);
    this.onUnitToggle = this.onUnitToggle.bind(this);
    this.toggleGameStatus = this.toggleGameStatus.bind(this);
  }

  componentWillMount() {
    this.onLoadURLParam(this.props.match.params);
    this.dispatch({type: 'userModel/getUserTotalRecoverBalance'});
    this.setCurrentGameInfos(this.props);
    this.setCurrentGameResult(this.props);
    this.setThisGamePrize(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.thisGameId !== nextProps.thisGameId ||
      this.props.currentResults !== nextProps.currentResults
    ) {
      this.setCurrentGameResult(nextProps);
      const currentGame = this.props.gameInfos.find(
        game => game.gameUniqueId === nextProps.thisGameId,
      );
      if (
        edition === 'New' &&
        currentGame &&
        currentGame.displayType === 'CASINO'
      ) {
        this.dispatch({
          type: 'betCenter/updateState',
          payload: {displayTableLayout: true},
        });
      }
    }
    if (
      this.props.thisGameId !== nextProps.thisGameId ||
      this.props.gameInfos !== nextProps.gameInfos
    ) {
      this.setCurrentGameInfos(nextProps);
    }
    this.awaitingResponse = nextProps.awaitingResponse;
    if (this.props.match.params.betId !== nextProps.match.params.betId) {
      this.onLoadURLParam(nextProps.match.params);
    }
    if (this.props.userData !== nextProps.userData) {
      this.dispatch({
        type: 'betCenter/initializeState',
        payload: ['responseMessage', 'responseColor'],
      });
    }
    if (
      this.props.thisGameId !== nextProps.thisGameId ||
      this.props.allGamesPrizeSettings !== nextProps.allGamesPrizeSettings
    ) {
      this.setThisGamePrize(nextProps);
    }
    if (
      this.props.allGamesPrizeSettings !== nextProps.allGamesPrizeSettings ||
      this.props.thisGamePrizeSetting !== nextProps.thisGamePrizeSetting ||
      this.props.methodId !== nextProps.methodId ||
      this.props.gameMethod !== nextProps.gameMethod
    ) {
      this.setThisMethodSetting(nextProps);
    }
    if (this.props.thisMethodSetting !== nextProps.thisMethodSetting) {
      this.setInitialOption(nextProps);
      this.setCurrentBetInfos(nextProps);
    }
    if (
      this.props.allBetObj !== nextProps.allBetObj ||
      this.props.allOpenOptions !== nextProps.allOpenOptions
    ) {
      this.setCurrentBetInfos(nextProps);
    }
    if (
      this.props.thisMethodPrizeSetting !== nextProps.thisMethodPrizeSetting ||
      this.props.thisOpenOption !== nextProps.thisOpenOption ||
      this.props.thisBetObj !== nextProps.thisBetObj
    ) {
      this.setNumberOfUnits(nextProps);
    }
    if (!isEqual(this.props.betPlanIssueNumber, nextProps.betPlanIssueNumber)) {
      this.dispatch({
        type: 'betCenter/updateState',
        payload: {betPlanIssueNumber: nextProps.betPlanIssueNumber},
      });
    }
  }

  componentWillUnmount() {
    this.dispatch({
      type: 'betCenter/initializeState',
      payload: [
        'methodGroup',
        'gameMethod',
        'methodId',
        'allOpenOptions',
        'gameNav',
        'gameSubNav',
        'allBetObj',
        'betEntries',
        'current',
        'lastOpen',
        'thisGameId',
        'responseMessage',
        'responseColor',
        'resultLimit',
      ],
    });
  }

  onLoadURLParam(params) {
    const {betId, betCategory} = params;
    if (betId) {
      this.dispatch({
        type: 'betCenter/updateState',
        payload: {
          thisGameId: betId,
          expandedCategory:
            betCategory === 'OTHERS' ? TYPE.GAME_CATEGORY.NONE : betCategory,
        },
      });
    }
  }

  onInitializeClick() {
    const {allBetObj, methodId} = this.props;
    const newAllBetObj = {...allBetObj};
    newAllBetObj[methodId] = {};
    this.dispatch({
      type: 'betCenter/initializeState',
      payload: [
        'amount',
        'amountUnit',
        'initialAmount',
        'multiply',
        'numberOfUnits',
        'multipleNumberOfUnits',
        'returnMoneyRatio',
        'thisBetObj',
        'thisMultipleBet',
        'thisMultipleBetString',
        'baseAmount',
        'responseColor',
        'responseMessage',
      ],
    });
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {allBetObj: newAllBetObj},
    });
  }

  onUnitToggle(amountUnit) {
    this.dispatch({type: 'betCenter/updateState', payload: {amountUnit}});
  }

  onMultipleChange = number => {
    const multiply = round(number);
    if (multiply < 1) {
      this.dispatch({
        type: 'betCenter/updateState',
        payload: {multiply: 1},
      });
    } else if (multiply > 9999) {
      this.dispatch({
        type: 'betCenter/updateState',
        payload: {multiply: 9999},
      });
    } else {
      this.dispatch({type: 'betCenter/updateState', payload: {multiply}});
    }
  };

  onInputChange(event) {
    event.persist();
    const {target} = event;
    const {name, min, max} = target;
    let {value} = target;
    value = round(value);
    if (value < min) value = '';
    if (value > max) value = max;
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {[name]: value},
    });
  }

  onInputBlur(event) {
    event.persist();
    const {target} = event;
    const {name, value} = target;
    if (!value) {
      this.dispatch({
        type: 'betCenter/updateState',
        payload: {[name]: name === 'baseAmount' ? 2 : 1},
      });
    }
  }

  onNavSelect = ({methodGroup, gameSubNav}) => {
    this.dispatch({
      type: 'betCenter/initializeState',
      payload: ['methodId', 'gameMethod'],
    });
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {methodGroup, gameSubNav},
    });
    this.onMethodSelect(gameSubNav[0]);
  };

  onCountDownFinish() {
    const {
      dispatch,
      betEntries,
      nextUniqueIssueNumber,
      uniqueIssueNumber,
    } = this.props;
    dispatch({type: 'betCenter/initializeState', payload: ['lastOpenCode']});
    dispatch({
      type: 'betCenter/updateState',
      payload: {
        gameClosed: false,
        lastIssueNumber: uniqueIssueNumber,
        nextUniqueIssueNumber: nextUniqueIssueNumber + 1,
        uniqueIssueNumber: nextUniqueIssueNumber,
      },
    });
    const key = 'notificationBtn';
    const onBtnClick = () => {
      notification.close(key);
      dispatch({
        type: 'betCenter/initializeState',
        payload: [
          'betEntries',
          'betPlanData',
          'haltOnWin',
          'betPlanModalVisible',
        ],
      });
    };
    const btn = (
      <button onClick={onBtnClick} className={css.betCenter_notificationBtn}>
        <span>确定清除选项</span>
      </button>
    );
    if (betEntries && betEntries.length) {
      notification.open({
        message: '当期购彩已经截止',
        description: '是否要清除当前投注项目？',
        btn,
        key,
        duration: 7,
        onClose: notification.close(key),
      });
    }
  }

  onRefreshClick() {
    this.dispatch({type: 'gameInfosModel/getCurrentResults'});
    this.dispatch({type: 'gameInfosModel/getThisGameResults'});
  }

  onRemoveAll() {
    this.dispatch({
      type: 'betCenter/initializeState',
      payload: ['betEntries', 'responseMessage', 'responseColor'],
    });
  }

  onRemoveSingle(id) {
    const {betEntries} = this.props;
    const newBetEntries = reject(betEntries, ['id', id]);
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {betEntries: newBetEntries},
    });
  }

  onReturnRatioChange(returnMoneyRatio) {
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {returnMoneyRatio: toNumber(returnMoneyRatio)},
    });
  }

  onShowMoreClick() {
    const {resultLimit} = this.props;
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {resultLimit: resultLimit + 10},
    });
    this.dispatch({type: 'gameInfosModel/getThisGameResults'});
  }

  onEditBetClick(id) {
    const {
      betEntries,
      allBetObj,
      allOpenOptions,
      displayTableLayout,
    } = this.props;
    const newAllBetObj = {...allBetObj};
    const newAllOpenOptions = {...allOpenOptions};
    const thisBetEntry = find(betEntries, ['id', id]);
    this.onRemoveSingle(id);
    const {
      amountUnit,
      thisBetObj,
      gameMethod,
      gameplayMethod,
      methodGroup,
      multiply,
      thisOpenOption,
      returnMoneyRatio,
    } = thisBetEntry;

    if (!displayTableLayout) {
      newAllBetObj[gameplayMethod] = thisBetObj;
    }
    newAllOpenOptions[gameplayMethod] = thisOpenOption;

    this.dispatch({
      type: 'betCenter/updateState',
      payload: {
        methodId: gameplayMethod,
        allBetObj: newAllBetObj,
        allOpenOptions: newAllOpenOptions,
        methodGroup,
        gameMethod,
        multiply,
        amountUnit,
        returnMoneyRatio,
      },
    });
  }

  onBetClick({section, bet, methodID = null}) {
    const {methodId, allBetObj, thisMethodSetting, thisBetObj} = this.props;
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {
        allBetObj: updateBet(
          {section, bet},
          {
            allBetObj,
            methodId: methodID || methodId,
            thisBetObj,
            thisMethodSetting,
          },
        ),
      },
    });
  }

  onControllerClick({section, group}) {
    const {allBetObj, methodId, thisMethodSetting, thisBetObj} = this.props;

    this.dispatch({
      type: 'betCenter/updateState',
      payload: {
        allBetObj: updateBet(
          {section, group},
          {allBetObj, methodId, thisBetObj, thisMethodSetting},
        ),
      },
    });
  }

  onRandomClick() {
    const {methodId, allBetObj, thisMethodSetting} = this.props;
    const newAllBetObj = {...allBetObj};
    const randomPick = getRandomPicks(thisMethodSetting.gameRules);
    newAllBetObj[methodId] = randomPick;
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {allBetObj: newAllBetObj},
    });
  }

  onMethodSelect = ({gameMethod, methodId}) => {
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {
        gameMethod,
        methodId,
      },
    });
  };

  onQuickBetClick() {
    this.onAddEntry({shouldPostEntries: true});
  }

  onPostEntryClick(isBetPlan) {
    this.dispatch({
      type: 'betCenter/postBetEntries',
      payload: {
        isBetPlan,
      },
    });
  }

  onPostEntryHandler({newBetEntriesLength, isBetPlan}) {
    const {gameClosed, betEntries} = this.props;
    const lengthLimit = 1000;
    const overBetLimit =
      newBetEntriesLength > lengthLimit || betEntries.length > lengthLimit;
    if (overBetLimit) {
      this.dispatch({
        type: 'betCenter/updateState',
        payload: {
          responseColor: 'red',
          responseMessage: `此交易最多可下${lengthLimit}注`,
        },
      });
    } else if (gameClosed && !isBetPlan) {
      this.setState({modalIsVisible: true});
    } else {
      this.onPostEntryClick(isBetPlan);
    }
  }

  onModalOk() {
    this.onPostEntryClick();
    this.setState({modalIsVisible: false});
  }

  onModalCancel() {
    this.setState({modalIsVisible: false});
  }

  onAddEntry({shouldPostEntries}) {
    const {
      methodId,
      betEntries,
      gameMethod,
      isMultipleBet,
      methodGroup,
      numberOfUnits,
      multipleNumberOfUnits,
      multiply,
      amountUnit,
      returnMoneyRatio,
      thisBetObj,
      thisOpenOption,
      thisMethodSetting: {betMode, gameRules},
      thisMultipleBet,
      thisMultipleBetString,
      thisBetString,
      thisMethodPrizeSetting,
    } = this.props;
    const newBetEntries = [...betEntries];
    const entriesLength = newBetEntries.length;
    const currentBetObj = isMultipleBet ? thisMultipleBet : [thisBetObj];
    const separator = getSeparator(betMode);
    let currentBetString;
    if (isMultipleBet) {
      if (betMode === 'single') {
        currentBetString = getBetsString(
          thisMultipleBetString,
          separator,
          gameRules,
          true,
        );
      } else {
        currentBetString = thisMultipleBetString;
      }
    } else {
      currentBetString = [thisBetString];
    }
    const currentNumberOfUnits = isMultipleBet
      ? multipleNumberOfUnits
      : [numberOfUnits];

    currentBetObj.forEach((betObj, index) => {
      let betString = currentBetString[index];
      const sectionKeys = Object.keys(betObj).join('_');
      const id = `${entriesLength}__${methodId}__${sectionKeys}__${betString}`;
      const amount = this.getAmount(currentNumberOfUnits[index]);
      const returnMoneyRatioCart = [];
      const pricePerUnit = this.getAmountPerUnit();
      const cartItemRatio = (100 - returnMoneyRatio) / 100;
      let thisBetStringModified;
      if (methodId === 'LP') {
        thisBetStringModified = specialHandleLunpanBetString(thisBetString);
      } else thisBetStringModified = thisBetString;
      const cartItemPrizeOnly = betPrize.getBetPrize(
        methodId,
        thisBetStringModified,
        thisMethodPrizeSetting,
      );
      if (cartItemPrizeOnly instanceof Object) {
        for (let a = 0; a < Object.values(cartItemPrizeOnly).length; a++) {
          returnMoneyRatioCart.push(
            Object.values(cartItemPrizeOnly)[a] * cartItemRatio,
          );
        }
      } else {
        returnMoneyRatioCart.push(cartItemPrizeOnly * cartItemRatio);
      }

      // 快三 -> 跨 - remove "跨" wording from the betString
      if (methodId === 'KUA') {
        betString = betString.replace(/跨/g, '');
      }

      const entry = {
        amount,
        amountUnit,
        betString,
        thisBetObj: betObj,
        gameMethod,
        gameplayMethod: methodId,
        id,
        methodGroup,
        multiply,
        numberOfUnits: currentNumberOfUnits[index],
        thisOpenOption,
        pricePerUnit,
        returnMoneyRatio: (returnMoneyRatio / 100).toFixed(3),
        returnMoneyRatioCart,
      };
      newBetEntries.push(entry);
    });
    const newBetEntriesLength = newBetEntries.length;
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {betEntries: newBetEntries},
    });
    this.dispatch({
      type: 'betCenter/initializeState',
      payload: [
        'allBetObj',
        'thisBetObj',
        'thisBetString',
        'thisMultipleBet',
        'thisMultipleBetString',
      ],
    });
    if (shouldPostEntries) {
      this.onPostEntryHandler({newBetEntriesLength});
    }
  }

  getAmount(numberOfUnits) {
    const {multiply, amountUnit, baseAmount} = this.props;
    let amount = baseAmount * multiply * numberOfUnits * amountUnit;
    amount = amount.toFixed(2);
    amount = toNumber(amount);
    return amount;
  }

  getAmountPerUnit() {
    const {multiply, amountUnit, baseAmount} = this.props;
    let amount = baseAmount * multiply * amountUnit;
    amount = amount.toFixed(2);
    amount = toNumber(amount);
    return amount;
  }

  getEntriesTotal() {
    const {betEntries} = this.props;
    let totalAmount = 0;
    let totalUnits = 0;
    forEach(betEntries, entry => {
      const {amount, numberOfUnits} = entry;
      totalAmount += amount;
      totalUnits += numberOfUnits;
    });
    return {totalAmount, totalUnits};
  }

  setInitialOption({thisMethodSetting, methodId, allOpenOptions}) {
    const newAllOpenOptions = {...allOpenOptions};
    const thisOpenOption = allOpenOptions[methodId] || [];
    if (thisMethodSetting && thisMethodSetting.gameRules.openOptions) {
      const {gameRules} = thisMethodSetting;
      const {uniqueInt, openOptions} = gameRules;
      const defaultOption = slice(openOptions, 0, uniqueInt);
      if (openOptions && !thisOpenOption.length) {
        newAllOpenOptions[methodId] = defaultOption;
        this.dispatch({
          type: 'betCenter/updateState',
          payload: {allOpenOptions: newAllOpenOptions},
        });
      }
    }
  }

  setThisGameSetting({thisGameId, thisGamePrizeSetting, homePageMethod}) {
    const thisGameMap = find(gamesMap, ['gameUniqueId', thisGameId]);
    if (thisGameMap) {
      const mapKey = thisGameMap.gameSettingsMap;
      const thisGameSetting = gameSettingsMap[mapKey];
      this.dispatch({
        type: 'betCenter/updateState',
        payload: {thisGameSetting},
      });
      this.setNav({thisGameSetting, thisGamePrizeSetting, homePageMethod});
    } else {
      this.handleOfflineGame();
    }
  }

  setNav({thisGameSetting, thisGamePrizeSetting, homePageMethod}) {
    const gameNav = {};
    let selectedMethod = homePageMethod;
    forEach(thisGameSetting, method => {
      const {gameMethod, methodId} = method;
      const nameArray = split(gameMethod, '-');
      const methodGroup = nameArray[0];
      gameNav[methodGroup] = gameNav[methodGroup] || [];
      const thisMethodPrizeSetting = thisGamePrizeSetting[methodId];
      const methodAvailable =
        thisMethodPrizeSetting && thisMethodPrizeSetting.gameplayState === 'ON';

      if (methodAvailable) {
        gameNav[methodGroup].push(method);

        if (!selectedMethod) selectedMethod = method;
      }
    });
    forEach(gameNav, (subNav, navName) => {
      if (subNav.length < 1) {
        delete gameNav[navName];
      }
    });
    const gameNavKeys = keys(gameNav);

    if (gameNavKeys.length) {
      const {gameMethod} = selectedMethod;
      const nameArray = split(gameMethod, '-');
      const methodGroup = nameArray[0];
      this.onMethodSelect(selectedMethod);
      this.dispatch({
        type: 'betCenter/updateState',
        payload: {
          gameNav,
          gameSubNav: gameNav[methodGroup],
          methodGroup,
          expandedCategory: homePageMethod
            ? homePageMethod.expandedCategory
            : this.props.expandedCategory,
        },
      });
    }
  }

  setThisGamePrize({thisGameId, allGamesPrizeSettings, homePageMethod}) {
    if (allGamesPrizeSettings && allGamesPrizeSettings[thisGameId]) {
      const {singleGamePrizeSettings} = allGamesPrizeSettings[thisGameId];
      if (singleGamePrizeSettings) {
        this.dispatch({
          type: 'betCenter/updateState',
          payload: {
            thisGamePrizeSetting: singleGamePrizeSettings,
          },
        });
        this.setThisGameSetting({
          thisGameId,
          thisGamePrizeSetting: singleGamePrizeSettings,
          homePageMethod,
        });
      }
    }
  }

  setThisMethodSetting({
    gameMethod,
    methodId,
    thisGamePrizeSetting,
    thisGameSetting,
  }) {
    const target = {methodId, gameMethod};
    const thisMethodSetting = find(thisGameSetting, target);
    const thisMethodPrizeSetting = thisGamePrizeSetting[methodId];
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {
        thisMethodSetting,
        thisMethodPrizeSetting,
      },
    });
  }

  setCurrentBetInfos({methodId, allBetObj, allOpenOptions, thisMethodSetting}) {
    const thisBetObj = allBetObj[methodId] || {};
    const thisOpenOption = allOpenOptions[methodId] || [];

    if (
      thisMethodSetting &&
      thisMethodSetting.gameRules &&
      thisMethodSetting.methodId === methodId
    ) {
      const {gameRules} = thisMethodSetting;
      let thisBetString = getBetString({thisBetObj}, gameRules);
      if (thisOpenOption && thisOpenOption.length) {
        const openOptionString = getOpenOptionsString(thisOpenOption);
        thisBetString = `${openOptionString}:${thisBetString}`;
      }

      this.dispatch({
        type: 'betCenter/updateState',
        payload: {
          thisBetObj,
          thisOpenOption,
          thisBetString,
        },
      });
    }
  }

  setNumberOfUnits({
    isMultipleBet,
    thisMethodSetting,
    thisBetObj,
    thisMultipleBet,
    thisOpenOption,
  }) {
    if (thisMethodSetting) {
      const currentBetObj = isMultipleBet ? thisMultipleBet : [thisBetObj];
      const multipleNumberOfUnits = [];
      const numberOfUnits = currentBetObj.reduce((sumNumberOfUnits, betObj) => {
        const currentNumberOfUnits = getNumberOfUnits({
          thisMethodSetting,
          thisBetObj: betObj,
          thisOpenOption,
        })
          .validate()
          .calculate()
          .getTotal();

        multipleNumberOfUnits.push(currentNumberOfUnits);
        return sumNumberOfUnits + currentNumberOfUnits;
      }, 0);
      this.dispatch({
        type: 'betCenter/updateState',
        payload: {multipleNumberOfUnits, numberOfUnits},
      });
    }
  }

  setCurrentGameResult({currentResults, thisGameId}) {
    const thisGameResult = find(currentResults, ['gameUniqueId', thisGameId]);
    if (!isEqual(this.state.thisGameResult, thisGameResult)) {
      this.setState({thisGameResult});
    }
  }

  setCurrentGameInfos({gameInfos, thisGameId}) {
    const thisGameInfo = find(gameInfos, ['gameUniqueId', thisGameId]);
    this.setState({thisGameInfo});
  }

  handleOfflineGame = () => {
    this.dispatch(routerRedux.push('/betcenter'));
    this.dispatch({
      type: 'formModel/postWarnMessage',
      payload: {
        msg: '彩种关闭当中',
      },
    });
  };

  toggleGameStatus = gameClosed => {
    if (gameClosed !== this.props.gameClosed) {
      this.dispatch({type: 'betCenter/updateState', payload: {gameClosed}});
    }
  };

  shouldShowTableLayout = () => {
    const {thisGameId, displayTableLayout} = this.props;
    const {thisGameInfo} = this.state;
    if (!thisGameInfo) {
      return false;
    }
    const {category, displayType} = thisGameInfo;

    return (
      edition === 'New' &&
      category === 'KUAI3' &&
      thisGameId.endsWith('K3') &&
      displayType &&
      displayType !== 'SIMPLE' &&
      displayTableLayout
    );
  };

  render() {
    const disabledAddEntry =
      (isEmpty(this.props.thisBetObj) || !this.props.numberOfUnits) &&
      this.props.disabledByDefault;
    const gameHeaderProps = {
      currentResults: this.props.currentResults,
      thisGameResult: this.state.thisGameResult,
      dispatch: this.dispatch,
      lastIssueNumber: this.props.lastIssueNumber,
      lastOpenCode: this.props.lastOpenCode,
      toggleGameStatus: this.toggleGameStatus,
      onCountDownFinish: this.onCountDownFinish,
      thisGameId: this.props.thisGameId,
      thisGameInfo: this.state.thisGameInfo,
      uniqueIssueNumber: this.props.uniqueIssueNumber,
      currentServerTime: this.props.currentServerTime,
      displayTableLayout: this.props.displayTableLayout,
      onInitializeClick: this.onInitializeClick,
      onRemoveAll: this.onRemoveAll,
      gameNav: this.props.gameNav,
      onNavSelect: this.onNavSelect,
    };
    const gameNavProps = {
      gameNav: this.props.gameNav,
      methodGroup: this.props.methodGroup,
      onNavSelect: this.onNavSelect,
      displayTableLayout: this.props.displayTableLayout,
    };
    const gameSubNavProps = {
      gameMethod: this.props.gameMethod,
      gameSubNav: this.props.gameSubNav,
      methodGroup: this.props.methodGroup,
      methodId: this.props.methodId,
      onMethodSelect: this.onMethodSelect,
      thisGamePrizeSetting: this.props.thisGamePrizeSetting,
    };
    const gameTextBoardProps = {
      dispatch: this.dispatch,
      betEntries: this.props.betEntries,
      methodId: this.props.methodId,
      allBetObj: this.props.allBetObj,
      thisGameSetting: this.props.thisGameSetting,
      thisMethodSetting: this.props.thisMethodSetting,
      thisMultipleBet: this.props.thisMultipleBet,
      thisMultipleBetString: this.props.thisMultipleBetString,
    };
    const gameBoardProps = {
      thisGameId: this.props.thisGameId,
      methodId: this.props.methodId,
      onBetClick: this.onBetClick,
      onControllerClick: this.onControllerClick,
      thisBetObj: this.props.thisBetObj,
      thisBetString: this.props.thisBetString,
      thisMethodSetting: this.props.thisMethodSetting,
      thisMethodPrizeSetting: this.props.thisMethodPrizeSetting,
      currentServerTime: this.props.currentServerTime,
      thisGameResult: this.state.thisGameResult,
    };
    const gameOpenOptionProps = {
      allOpenOptions: this.props.allOpenOptions,
      dispatch: this.dispatch,
      methodId: this.props.methodId,
      thisMethodSetting: this.props.thisMethodSetting,
      thisOpenOption: this.props.thisOpenOption,
    };
    const gameCalProps = {
      amountUnit: this.props.amountUnit,
      awaitingResponse: this.awaitingResponse,
      baseAmount: this.props.baseAmount,
      dispatch: this.dispatch,
      disabledAddEntry,
      multiply: this.props.multiply,
      onAddEntry: this.onAddEntry,
      onInitializeClick: this.onInitializeClick,
      onInputChange: this.onInputChange,
      onInputBlur: this.onInputBlur,
      onMultipleChange: this.onMultipleChange,
      onRandomClick: this.onRandomClick,
      onUnitToggle: this.onUnitToggle,
      setTotalUnit: this.setTotalUnit,
      thisBetObj: this.props.thisBetObj,
      thisGameId: this.props.thisGameId,
      haltOnWin: this.props.haltOnWin,
      thisMethodSetting: this.props.thisMethodSetting,
      onPostEntryHandler: this.onPostEntryHandler,
      thisOpenOption: this.props.thisOpenOption,
      tabPlanValue: this.props.tabPlanValue,
      methodId: this.props.methodId,
      thisBetString: this.props.thisBetString,
      thisGameInfo: this.props.thisGameInfo,
      thisMethodPrizeSetting: this.props.thisMethodPrizeSetting,
      allBetObj: this.props.allBetObj,
      allGamesPrizeSettings: this.props.allGamesPrizeSettings,
      allOpenOptions: this.props.allOpenOptions,
      announcements: this.props.announcements,
      betEntries: this.props.betEntries,
      currentResults: this.props.currentResults,
      currentServerTime: this.props.currentServerTime,
      disabledByDefault: this.props.disabledByDefault,
      expandedCategory: this.props.expandedCategory,
      gameInfos: this.props.gameInfos,
      gameMethod: this.props.gameMethod,
      gameNav: this.props.gameNav,
      gameSubNav: this.props.gameSubNav,
      lastIssueNumber: this.props.lastIssueNumber,
      lastOpenCode: this.props.lastOpenCode,
      methodGroup: this.props.methodGroup,
      numberOfUnits: this.props.numberOfUnits,
      pcOtherInfo: this.props.pcOtherInfo,
      responseColor: this.props.responseColor,
      responseMessage: this.props.responseMessage,
      returnMoneyRatio: this.props.returnMoneyRatio,
      thisBetObj: this.props.thisBetObj,
      thisGameResults: this.props.thisGameResults,
      thisGamePrizeSetting: this.props.thisGamePrizeSetting,
      thisGameSetting: this.props.thisGameSetting,
      thisMultipleBet: this.props.thisMultipleBet,
      thisMultipleBetString: this.props.thisMultipleBetString,
      uniqueIssueNumber: this.props.uniqueIssueNumber,
      betPlanData: this.props.betPlanData,
      getAmount: this.getAmount,
      getEntriesTotal: this.getEntriesTotal,
      betPlanModalVisible: this.props.betPlanModalVisible,
      otherSettings: this.props.otherSettings,
      betPlanIssueNumber: this.props.betPlanIssueNumber,
      isTableLayout: this.props.displayTableLayout,
    };
    const gameCartProps = {
      awaitingResponse: this.awaitingResponse,
      dispatch: this.dispatch,
      betEntries: this.props.betEntries,
      onRemoveAll: this.onRemoveAll,
      onEditBetClick: this.onEditBetClick,
      responseColor: this.props.responseColor,
      responseMessage: this.props.responseMessage,
      methodId: this.props.methodId,
      thisGameId: this.props.thisGameId,
    };
    const returnRatioCtrlProps = {
      getAmount: this.getAmount,
      getAmountPerUnit: this.getAmountPerUnit,
      getEntriesTotal: this.getEntriesTotal,
      methodId: this.props.methodId,
      numberOfUnits: this.props.numberOfUnits,
      onRangeChange: this.onReturnRatioChange,
      returnMoneyRatio: this.props.returnMoneyRatio,
      thisGameId: this.props.thisGameId,
      thisMethodPrizeSetting: this.props.thisMethodPrizeSetting,
      thisBetString: this.props.thisBetString,
      betEntries: this.props.betEntries,
      displayTableLayout: this.props.displayTableLayout,
    };
    const gameHistoryProps = {
      dispatch: this.dispatch,
      onRefreshClick: this.onRefreshClick,
      onShowMoreClick: this.onShowMoreClick,
      thisGameResults: this.props.thisGameResults,
      thisGameId: this.props.thisGameId,
    };
    const modalProps = {
      visible: this.state.modalIsVisible,
      title: '当前已经封单',
      okText: '投注',
      cancelText: '取消',
      onOk: this.onModalOk,
      onCancel: this.onModalCancel,
      wrapClassName: css.popupModelFooter,
    };
    const gameTableK3Props = {
      gameNav: this.props.gameNav,
      onBetClick: this.onBetClick,
      onAddEntry: this.onAddEntry,
      onMethodSelect: this.onMethodSelect,
      allBetObj: this.props.allBetObj,
      dispatch: this.dispatch,
    };
    const noBetSelected =
      isEmpty(this.props.thisBetObj) || !this.props.numberOfUnits;
    const cartIsEmpty = !this.props.betEntries.length;
    const quickBetDisabled =
      noBetSelected ||
      this.awaitingResponse ||
      this.props.uniqueIssueNumber === '-' ||
      !this.props.uniqueIssueNumber;
    const postEntriesDisabled =
      cartIsEmpty ||
      this.awaitingResponse ||
      this.props.uniqueIssueNumber === '-' ||
      !this.props.uniqueIssueNumber;
    let Contents = null;

    if (this.props.gameInfos) {
      Contents = (
        <React.Fragment>
          <GameHeader {...gameHeaderProps} />
          <GameNav {...gameNavProps} />
          {!this.shouldShowTableLayout() && <GameSubNav {...gameSubNavProps} />}
          <div className={css.betCenter_boardBody}>
            <div className={css.betCenter_boardColumn}>
              <React.Fragment>
                {!this.shouldShowTableLayout() && (
                  <React.Fragment>
                    <GameOpenOption {...gameOpenOptionProps} />
                    <div className={css.gameboard}>
                      {this.props.thisMethodSetting &&
                      this.props.thisMethodSetting.inputMode &&
                      this.props.thisMethodSetting.inputMode === 'text' ? (
                        <>
                          <GameTextBoard {...gameTextBoardProps} />
                        </>
                      ) : (
                        <>
                          <GameBoard {...gameBoardProps} />
                        </>
                      )}
                    </div>
                  </React.Fragment>
                )}
                <GameCal {...gameCalProps} />
                {this.shouldShowTableLayout() && (
                  <GameTableK3 {...gameTableK3Props} />
                )}
                <GameCart {...gameCartProps} />
              </React.Fragment>
            </div>
            <div className={css.betCenter_widgetsColumn}>
              <GameHistory {...gameHistoryProps} />
              <ReturnRatioCtrl {...returnRatioCtrlProps} />
              <div className={css.betCenter_actionRow}>
                <div
                  className={css.betCenter_actionBtns}
                  data-color={this.props.responseColor}>
                  <button
                    type="button"
                    onClick={this.onQuickBetClick}
                    disabled={quickBetDisabled}
                    data-position="top"
                    className={css.betCenter_actionBtn}>
                    立即投注
                  </button>
                  <button
                    type="button"
                    disabled={postEntriesDisabled}
                    onClick={this.onPostEntryHandler}
                    data-position="bottom"
                    className={css.betCenter_actionBtn}>
                    {cartIsEmpty ? '无投注项' : '确认投注'}
                  </button>
                  <Modal {...modalProps}>
                    <p>是否投注到下一期?</p>
                  </Modal>
                </div>
              </div>
            </div>
          </div>
        </React.Fragment>
      );
    } else
      Contents = (
        <Spin
          size="large"
          tip="正在加载页面..."
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      );

    return (
      <div className={css.betCenter_boardWrapper}>
        <div className={css.betCenter_board}>{Contents}</div>
      </div>
    );
  }
}

function mapStateToProps({
  gameInfosModel,
  betCenter,
  userModel,
  orderModel,
  appModel,
}) {
  return {
    gameInfos: gameInfosModel.gameInfos,
    otherSettings: gameInfosModel.otherSettings,
    allGamesPrizeSettings: gameInfosModel.allGamesPrizeSettings,
    currentResults: gameInfosModel.currentResults,
    orderHistory: orderModel.orderHistory,
    thisGameResults: gameInfosModel.thisGameResults,
    userData: userModel.userData,
    currentServerTime: appModel.currentServerTime,
    ...betCenter,
  };
}

export default connect(mapStateToProps)(BetCenterIndex);
