import React, {Component} from 'react';
import {connect} from 'dva';
import {Link} from 'dva/router';
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
import {settingMap, type as TYPE, specialHandleLunpanBetString} from 'utils';
import getSeparator from 'utils/betCenter/textBetIdentifier';
import {getBetString as getBetsString} from 'utils/betCenter/getBetStringFromText';
import updateBet from 'utils/betCenter/updateBet';
import {betService} from 'services';
import BetPage from 'pages/Bet';
import {MDIcon} from 'components/General';
import GameNav from 'components/BetCenter/GameNav';
import GameHeader from 'components/BetCenter/GameHeader';
import GameHistory from 'components/BetCenter/GameHistory';
import GameOpenOption from 'components/BetCenter/GameOpenOption';
import GameSubNav from 'components/BetCenter/GameSubNav';
import GameTextBoard from 'components/BetCenter/GameTextBoard';
import ReturnRatioCtrl from 'components/BetCenter/ReturnRatioCtrl';
import css from 'styles/betCenter/Base/BetCenterIndex1.less';
import Logo from 'components/Header/ClientLogo';

const SideNavBetcenter = resolve.plugin('SideNavBetcenter');
const TopTray = resolve.plugin('TopTray');
const Login = resolve.plugin('Login');
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
    this.onMethodSelect = this.onMethodSelect.bind(this);
    this.onModalCancel = this.onModalCancel.bind(this);
    this.onModalOk = this.onModalOk.bind(this);
    this.onMultipleChange = this.onMultipleChange.bind(this);
    this.onNavSelect = this.onNavSelect.bind(this);
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
    // 获取左侧导航栏数据
    this.dispatch({type: 'gameInfosModel/getContents'});
    if (
      localStorage.getItem(TYPE.accessToken) !== null &&
      localStorage.getItem(TYPE.accessToken) !== ''
    ) {
      this.dispatch({type: 'userModel/getUserTotalRecoverBalance'});
    }
    this.setCurrentGameInfos(this.props);
    this.setCurrentGameResult(this.props);
    this.setThisGamePrize(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.awaitingResponse = nextProps.awaitingResponse;
    if (
      this.props.thisGameId !== nextProps.thisGameId ||
      this.props.currentResults !== nextProps.currentResults
    ) {
      this.setCurrentGameResult(nextProps);
    }
    if (
      this.props.thisGameId !== nextProps.thisGameId ||
      this.props.gameInfos !== nextProps.gameInfos
    ) {
      this.setCurrentGameInfos(nextProps);
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
    if (this.props.pcOtherInfo !== nextProps.pcOtherInfo) {
      const {siteName = ''} = nextProps.pcOtherInfo;
      document.title = siteName;
    }
    if (
      this.props.gameInfos.length !== nextProps.gameInfos.length &&
      nextProps.gameInfos.length
    ) {
      this.dispatch({type: 'gameInfosModel/getCurrentResults'});
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

  onMultipleChange(number) {
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
  }

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

  onNavSelect({methodGroup, gameSubNav}) {
    this.dispatch({
      type: 'betCenter/initializeState',
      payload: ['methodId', 'gameMethod'],
    });
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {methodGroup, gameSubNav},
    });
    this.onMethodSelect(gameSubNav[0]);
  }

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
      <button
        type="button"
        onClick={onBtnClick}
        className={css.betCenter_notificationBtn}>
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
    const {betEntries, allBetObj, allOpenOptions} = this.props;
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
    newAllBetObj[gameplayMethod] = thisBetObj;
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

  onBetClick({section, bet}) {
    const {methodId, allBetObj, thisMethodSetting, thisBetObj} = this.props;
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {
        allBetObj: updateBet(
          {section, bet},
          {allBetObj, methodId, thisBetObj, thisMethodSetting},
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

  onMethodSelect({gameMethod, methodId}) {
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {
        gameMethod,
        methodId,
      },
    });
  }

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
    const mapKey = thisGameMap.gameSettingsMap;
    const thisGameSetting = gameSettingsMap[mapKey];
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {thisGameSetting},
    });
    this.setNav({thisGameSetting, thisGamePrizeSetting, homePageMethod});
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
    if (allGamesPrizeSettings[thisGameId]) {
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

  toggleGameStatus = gameClosed => {
    if (gameClosed !== this.props.gameClosed) {
      this.dispatch({type: 'betCenter/updateState', payload: {gameClosed}});
    }
  };

  render() {
    const {
      allBetObj,
      allGamesPrizeSettings,
      allOpenOptions,
      amountUnit,
      announcements,
      baseAmount,
      betEntries,
      currentResults,
      disabledByDefault,
      expandedCategory,
      gameInfos,
      dispatch,
      gameMethod,
      gameNav,
      gameSubNav,
      lastIssueNumber,
      lastOpenCode,
      methodGroup,
      methodId,
      multiply,
      numberOfUnits,
      pcOtherInfo,
      responseColor,
      responseMessage,
      returnMoneyRatio,
      thisBetObj,
      thisBetString,
      thisGameResults,
      thisGameId,
      thisGamePrizeSetting,
      thisGameSetting,
      thisMethodPrizeSetting,
      thisMethodSetting,
      thisMultipleBet,
      thisMultipleBetString,
      thisOpenOption,
      uniqueIssueNumber,
      currentServerTime,
      awaitingResponse,
      tabPlanValue,
      betPlanData,
      haltOnWin,
      betPlanModalVisible,
      otherSettings,
      betPlanIssueNumber,
    } = this.props;
    const {modalIsVisible, thisGameInfo, thisGameResult} = this.state;
    const disabledAddEntry =
      (isEmpty(thisBetObj) || !numberOfUnits) && disabledByDefault;
    const sideNavProps = {
      gameInfos,
      betEntries,
      allGamesPrizeSettings,
      className: css.betCenter_sidenavBody,
      dispatch: this.dispatch,
      onInitializeClick: this.onInitializeClick,
      expandedCategory,
      thisGameId,
    };
    const gameHeaderProps = {
      currentResults,
      gameInfos,
      thisGameResult,
      dispatch: this.dispatch,
      lastIssueNumber,
      lastOpenCode,
      toggleGameStatus: this.toggleGameStatus,
      onCountDownFinish: this.onCountDownFinish,
      thisGameId,
      thisGameInfo,
      uniqueIssueNumber,
      currentServerTime,
    };
    const gameNavProps = {
      gameNav,
      methodGroup,
      onNavSelect: this.onNavSelect,
    };
    const gameSubNavProps = {
      gameMethod,
      thisGameId,
      gameSubNav,
      methodGroup,
      methodId,
      onMethodSelect: this.onMethodSelect,
      thisGamePrizeSetting,
    };
    const gameTextBoardProps = {
      dispatch: this.dispatch,
      betEntries,
      methodId,
      allBetObj,
      thisGameSetting,
      thisMethodSetting,
      thisMultipleBet,
      thisMultipleBetString,
    };
    const gameBoardProps = {
      thisGameId,
      methodId,
      onBetClick: this.onBetClick,
      onControllerClick: this.onControllerClick,
      thisBetObj,
      thisBetString,
      thisMethodSetting,
      thisMethodPrizeSetting,
      currentServerTime,
      thisGameResult,
    };
    const gameOpenOptionProps = {
      allOpenOptions,
      dispatch: this.dispatch,
      methodId,
      thisMethodSetting,
      thisOpenOption,
    };
    const gameCalProps = {
      amountUnit,
      awaitingResponse: this.awaitingResponse,
      baseAmount,
      disabledAddEntry,
      multiply,
      dispatch,
      onAddEntry: this.onAddEntry,
      onInitializeClick: this.onInitializeClick,
      onInputChange: this.onInputChange,
      onInputBlur: this.onInputBlur,
      onMultipleChange: this.onMultipleChange,
      onRandomClick: this.onRandomClick,
      onUnitToggle: this.onUnitToggle,
      setTotalUnit: this.setTotalUnit,
      onPostEntryHandler: this.onPostEntryHandler,
      thisBetObj,
      thisGameId,
      thisMethodSetting,
      thisOpenOption,
      methodId,
      thisBetString,
      thisGameInfo,
      thisMethodPrizeSetting,
      allBetObj,
      allGamesPrizeSettings,
      allOpenOptions,
      announcements,
      betEntries,
      currentResults,
      currentServerTime,
      disabledByDefault,
      expandedCategory,
      gameInfos,
      gameMethod,
      gameNav,
      gameSubNav,
      lastIssueNumber,
      lastOpenCode,
      methodGroup,
      numberOfUnits,
      pcOtherInfo,
      responseColor,
      responseMessage,
      returnMoneyRatio,
      thisBetObj,
      thisGameResults,
      thisGamePrizeSetting,
      thisGameSetting,
      tabPlanValue,
      thisMultipleBet,
      thisMultipleBetString,
      uniqueIssueNumber,
      getAmount: this.getAmount,
      getEntriesTotal: this.getEntriesTotal,
      betPlanData,
      haltOnWin,
      betPlanModalVisible,
      otherSettings,
      betPlanIssueNumber,
    };
    const gameCartProps = {
      awaitingResponse: this.awaitingResponse,
      dispatch: this.dispatch,
      betEntries,
      thisGameId,
      methodId,
      onRemoveAll: this.onRemoveAll,
      onEditBetClick: this.onEditBetClick,
      responseColor,
      responseMessage,
    };
    const returnRatioCtrlProps = {
      getAmount: this.getAmount,
      getAmountPerUnit: this.getAmountPerUnit,
      getEntriesTotal: this.getEntriesTotal,
      methodId,
      numberOfUnits,
      onRangeChange: this.onReturnRatioChange,
      returnMoneyRatio,
      thisGameId,
      thisMethodPrizeSetting,
      thisBetString,
    };
    const gameHistoryProps = {
      dispatch: this.dispatch,
      onRefreshClick: this.onRefreshClick,
      onShowMoreClick: this.onShowMoreClick,
      thisGameResults,
      thisGameId,
    };
    const modalProps = {
      visible: modalIsVisible,
      title: '当前已经封单',
      okText: '投注',
      cancelText: '取消',
      onOk: this.onModalOk,
      onCancel: this.onModalCancel,
      wrapClassName: css.popupModelFooter,
    };
    const noBetSelected = isEmpty(thisBetObj) || !numberOfUnits;
    const cartIsEmpty = !betEntries.length;
    const quickBetDisabled =
      noBetSelected ||
      this.awaitingResponse ||
      uniqueIssueNumber === '-' ||
      !uniqueIssueNumber;
    const postEntriesDisabled =
      cartIsEmpty ||
      this.awaitingResponse ||
      uniqueIssueNumber === '-' ||
      !uniqueIssueNumber;

    if (gameInfos) {
      return (
        <div className={css.betCenter}>
          <div className={css.betCenter_header}>
            <div className={css.betCenter_logoColumn}>
              <Logo
                siteName={pcOtherInfo.siteName}
                className={css.betCenter_logoImg}
              />
              <div className={css.betCenter_allGameLabel}>
                全部彩种
                <MDIcon iconName="view-grid" />
              </div>
            </div>
            <div className={css.betCenter_loginColumn}>
              <div className={css.betCenter_login}>
                <Link to="/" className={css.betCenter_backHomeBtn}>
                  <MDIcon iconName="home" />
                  <i>回到首页</i>
                </Link>
                <Login />
              </div>
              <div className={css.betCenter_toptray}>
                <TopTray announcements={announcements} />
              </div>
            </div>
          </div>
          <div className={css.betCenter_body}>
            <SideNavBetcenter {...sideNavProps} />
            <div className={css.betCenter_board}>
              <GameHeader {...gameHeaderProps} />
              <GameNav {...gameNavProps} />
              <div className={css.betCenter_boardBody}>
                <div className={css.betCenter_boardColumn}>
                  <GameSubNav {...gameSubNavProps} />
                  <GameOpenOption {...gameOpenOptionProps} />
                  {thisMethodSetting &&
                  thisMethodSetting.inputMode &&
                  thisMethodSetting.inputMode === 'text' ? (
                    <GameTextBoard {...gameTextBoardProps} />
                  ) : (
                    <GameBoard {...gameBoardProps} />
                  )}
                  <GameCal {...gameCalProps} />
                  <GameCart {...gameCartProps} />
                </div>
                <div className={css.betCenter_widgetsColumn}>
                  <GameHistory {...gameHistoryProps} />
                  <ReturnRatioCtrl {...returnRatioCtrlProps} />
                  <div className={css.betCenter_actionRow}>
                    <div
                      className={css.betCenter_actionBtns}
                      data-color={responseColor}>
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
            </div>
          </div>
        </div>
      );
    }
    return (
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
  }
}

function mapStateToProps({
  gameInfosModel,
  betCenter,
  userModel,
  orderModel,
  appModel,
}) {
  const {
    gameInfos,
    allGamesPrizeSettings,
    currentResults,
    thisGameResults,
    otherSettings,
    pcOtherInfo = {},
  } = gameInfosModel;
  const {orderHistory} = orderModel;
  const {thisGameId} = betCenter;
  const {userData} = userModel;
  return {
    gameInfos,
    allGamesPrizeSettings,
    currentResults,
    orderHistory,
    thisGameId,
    thisGameResults,
    pcOtherInfo,
    userData,
    otherSettings,
    currentServerTime: appModel.currentServerTime,
    ...betCenter,
  };
}

const component = connect(mapStateToProps)(BetCenterIndex);

export default function BetCenter(props) {
  return <BetPage component={component} componentProps={props} />;
}
