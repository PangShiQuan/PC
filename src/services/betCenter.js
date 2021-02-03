import _ from 'lodash';
import {
  settingMap,
  getSymbolicName,
  type,
  cleanEmptyObj,
  getRandomInt,
  getEachPicksLength,
} from 'utils';
import {gameCalculation as calculation} from './gameCalculation';

export const ifSymbolicAware = symbolic =>
  symbolic && type[`SYMBOLIC_${symbolic}`];

export const defineSymbolicPrize = ({gamePrize, gameSetCombination}) => {
  const symbolicGamePrize = {...gamePrize};
  const {prizeSettings} = symbolicGamePrize;
  const {set} = gameSetCombination;
  const newPrizeSetting = [];
  const symbolicName = getSymbolicName(symbolicGamePrize.symbolic);
  const symbolicPrizeIndex = _.findIndex(
    prizeSettings,
    setting =>
      setting.prizeNameForDisplay.indexOf(symbolicName) >= 0 ||
      setting.prizeNameForDisplay.indexOf(type.SYMBOLIC_CURRENT_YEAR) >= 0,
  );
  const symbolicPrizeSetting = prizeSettings[symbolicPrizeIndex];
  const nonSymbolicPrizeSetting = prizeSettings[1];

  _.forEach(set, eachOption => {
    let prizeSetting = {...nonSymbolicPrizeSetting};
    if (eachOption === symbolicName) {
      prizeSetting = {
        ...symbolicPrizeSetting,
        prizeNameForDisplay: eachOption,
      };
    }
    newPrizeSetting.push(prizeSetting);
  });
  symbolicGamePrize.prizeSettings = [...newPrizeSetting];
  return symbolicGamePrize;
};

export const extractGamePrize = (
  {singleGamePrizeSettings},
  {gameId, gameSetCombination},
) => {
  let gamePrize = {...singleGamePrizeSettings[gameId]};
  if (ifSymbolicAware(gamePrize)) {
    gamePrize = defineSymbolicPrize({gamePrize, gameSetCombination});
  }
  return gamePrize;
};

export const getRandomSections = ({minimumRowPick, sections}) => {
  const maxInt = sections.length;
  const randomSections = [];
  do {
    const randomSection = getRandomInt(0, maxInt);
    if (_.indexOf(randomSections, randomSection) < 0) {
      randomSections.push(randomSection);
    }
  } while (randomSections.length < minimumRowPick);
  return randomSections;
};

export const getRandomPicks = gameSetCombination => {
  const {
    pickRange,
    sections,
    set,
    isUnique,
    minimumRowPick,
    isGroupBtn,
    uniqueInt,
  } = gameSetCombination;
  const randomSections = getRandomSections({minimumRowPick, sections});
  const allSectionKeys = _.keys(sections);
  const randomPicks = {};
  const existingIndexes = [];
  const notAllowRepeat = isUnique || uniqueInt;
  _.forEach(randomSections, sectionIndex => {
    const bets = set[sectionIndex] || set[0];
    const sectionName = sections[allSectionKeys[sectionIndex]];
    const currentIndexes = [];
    randomPicks[sectionName] = [];
    const range = _.split(pickRange[sectionIndex], '-');
    const min = range[0];
    const max = isUnique ? bets.length : range[1];
    do {
      const randomIndex = getRandomInt(0, max);
      const pick = bets[randomIndex];
      if (notAllowRepeat && _.indexOf(existingIndexes, randomIndex) < 0) {
        existingIndexes.push(randomIndex);
        randomPicks[sectionName].push(isGroupBtn ? pick.displayText : pick);
      } else if (
        !notAllowRepeat &&
        _.indexOf(currentIndexes, randomIndex) < 0
      ) {
        currentIndexes.push(randomIndex);
        randomPicks[sectionName].push(isGroupBtn ? pick.displayText : pick);
      }
    } while (randomPicks[sectionName].length < min);
  });
  return randomPicks;
};

export const getNavOptions = ({gameSettings}) => {
  const newNavOptions = {};
  _.forEach(gameSettings, (id, name) => {
    const gameNamesGroups = name.split('-');
    const navName = gameNamesGroups[0];
    const subGroupName = gameNamesGroups[2] || type.NORMAL;
    const singleGameName = gameNamesGroups[1] || navName;
    newNavOptions[navName] = newNavOptions[navName] || {};
    newNavOptions[navName][subGroupName] =
      newNavOptions[navName][subGroupName] || [];
    newNavOptions[navName][subGroupName].push(singleGameName);
  });
  return newNavOptions;
};

export const isValueExist = ({gameName, sectionName, value, existingPicks}) =>
  existingPicks &&
  existingPicks[gameName] &&
  existingPicks[gameName][sectionName] &&
  existingPicks[gameName][sectionName].indexOf(value) >= 0;

export const onlyShowOneAmount = prizeSettingsInstance => {
  let condition = false;
  const firstPrizeSetting = _.find(prizeSettingsInstance, {
    prizeNameForDisplay: type.GRAND_PRIZE,
  });

  condition =
    (firstPrizeSetting !== null && firstPrizeSetting !== undefined) ||
    prizeSettingsInstance.length === 1;

  return condition;
};

export const getTheOnlyAmountOf = prizeSettingsInstance => {
  if (onlyShowOneAmount(prizeSettingsInstance)) {
    const firstPrizeSetting =
      _.find(prizeSettingsInstance, {
        prizeNameForDisplay: type.GRAND_PRIZE,
      }) || prizeSettingsInstance[0];
    return firstPrizeSetting.prizeAmount;
  }
};

export const getOpenOptions = existingOpenOptions => {
  return _.filter(
    type.UNITS_W_Q_B_S_G,
    option => existingOpenOptions.indexOf(option) > -1,
  );
};

export const storeOpenOptions = ({gameName, value, openOptions}) => {
  const newPicks = {...openOptions};
  newPicks[gameName] = newPicks[gameName] || [];
  if (newPicks[gameName].indexOf(value) >= 0) {
    const valueIndex = newPicks[gameName].indexOf(value);
    newPicks[gameName].splice(valueIndex, 1);
  } else if (newPicks[gameName].indexOf(value) < 0) {
    newPicks[gameName].push(value);
  }
  return newPicks;
};

export const getOpenOptionsString = currentOpenOptions => {
  let optionsString = '';
  _.forEach(currentOpenOptions, option => {
    optionsString = `${optionsString} ${type.OPEN_OPTION_STRINGS[option]}`;
  });
  optionsString = _.trim(optionsString);
  return optionsString;
};

export function getBetString(
  {thisBetObj},
  {sections, set, joinPickWith, joinSectionWith, isGroupBtn},
) {
  if (_.isEmpty(thisBetObj)) return '';

  let thisBetString = '';
  _.forEach(sections, (section, secIndex) => {
    const sectionJoiner =
      secIndex === sections.length - 1 ? '' : joinSectionWith || '|';
    if (thisBetObj[section]) {
      const bets = set[secIndex] || set[0];
      let sectionStr = '';
      _.forEach(bets, (bet, betIndex) => {
        const betStr = isGroupBtn ? bet.displayText : bet;
        const pickJoiner =
          betIndex === bets.length - 1 ? '' : joinPickWith || ' ';
        if (thisBetObj[section].indexOf(betStr) > -1) {
          sectionStr = `${sectionStr}${betStr}${pickJoiner}`;
        }
      });
      sectionStr = _.trim(sectionStr);
      thisBetString = `${thisBetString}${sectionStr}${sectionJoiner}`;
    } else {
      thisBetString = `${thisBetString}${sectionJoiner}`;
    }
  });
  thisBetString = _.trim(thisBetString);
  return thisBetString;
}

export const filterRepeat = ({
  currentGame,
  sectionName,
  set,
  alternateSet,
  currentSection,
}) => {
  const newCurrentGame = {...currentGame};
  _.forEach(newCurrentGame, (otherSection, otherSectionName) => {
    if (otherSectionName !== sectionName) {
      _.forEach(currentSection, currentPick => {
        const thisPickIndexInSet = _.indexOf(set, currentPick);
        const thisPickIndexInotherSet = _.indexOf(alternateSet, currentPick);

        let currentPickInSet = currentPick;
        let currentPickInOtherSet = currentPick;
        if (thisPickIndexInSet >= 0) {
          currentPickInSet = set[thisPickIndexInSet];
          currentPickInOtherSet = alternateSet[thisPickIndexInSet];
        } else if (thisPickIndexInotherSet >= 0) {
          currentPickInSet = alternateSet[thisPickIndexInotherSet];
          currentPickInOtherSet = set[thisPickIndexInotherSet];
        }
        if (
          _.indexOf(newCurrentGame[otherSectionName], currentPickInSet) >= 0
        ) {
          const valueIndex = _.indexOf(
            newCurrentGame[otherSectionName],
            currentPickInSet,
          );
          newCurrentGame[otherSectionName].splice(valueIndex, 1);
        } else if (
          _.indexOf(newCurrentGame[otherSectionName], currentPickInOtherSet) >=
          0
        ) {
          const valueIndex = _.indexOf(
            newCurrentGame[otherSectionName],
            currentPickInOtherSet,
          );
          newCurrentGame[otherSectionName].splice(valueIndex, 1);
        }
      });
    }
  });
  return newCurrentGame;
};

export const storeNewPicks = ({
  gameName,
  sectionName,
  value,
  existingPicks,
  gameSetCombination,
}) => {
  const {pickRange, isUnique, sections, set} = gameSetCombination;
  const alternateSet = gameSetCombination.alternateSet || [];
  let newPicks = {...existingPicks};
  let currentGame = newPicks[gameName] || {};
  const sectionIndex = _.indexOf(sections, sectionName);
  const range = _.split(pickRange[sectionIndex], '-');
  const maxPick = range[1];
  const valueIsArray = _.isArray(value);
  const valueNotArray = !_.isArray(value);

  _.forEach(sections, section => {
    currentGame[section] = currentGame[section] || [''];
  });

  let currentSection = currentGame[sectionName];
  const valueExist = currentSection.indexOf(value) >= 0;
  const valueNotExist = currentSection.indexOf(value) < 0;

  /* add value into section */
  if (valueExist) {
    const valueIndex = currentSection.indexOf(value);
    currentSection.splice(valueIndex, 1);
  } else if (valueNotArray && valueNotExist) {
    currentSection.push(value);
  } else if (valueIsArray) {
    currentSection = value;
  }

  /* remove extra value from section */
  if (currentSection.length > maxPick) {
    const sectionLength = currentSection.length;
    const dropLength = sectionLength - maxPick;
    currentSection = _.drop(currentSection, dropLength);
  }
  currentGame[sectionName] = currentSection;

  /* remove duplicate value from other array if Unique */
  if (isUnique) {
    /* this is fucking stupid I don't know why I have to do this */
    currentGame = filterRepeat({
      currentSection,
      currentGame,
      sectionName,
      alternateSet,
      set,
    });
  }

  /* cleaning empty object */
  const newCurrentGame = cleanEmptyObj(currentGame);

  if (_.isEmpty(newCurrentGame)) {
    currentGame = newCurrentGame;
  }
  newPicks[gameName] = newCurrentGame;
  newPicks = cleanEmptyObj(newPicks);
  return newPicks;
};

export const getBetDetails = cart => {
  let totalNumberOfUnits = 0;
  let totalAmount = 0;
  const betEntries = [];
  _.forEach(cart, item => {
    const {amount, numberOfUnits} = item.order;
    totalNumberOfUnits += numberOfUnits;
    totalAmount += amount;
    betEntries.push(item.order);
  });
  return {betEntries, totalNumberOfUnits, totalAmount};
};

export const getNumberOfUnits = ({
  thisMethodSetting,
  thisBetObj,
  thisOpenOption,
}) => {
  function getValueRef(methodId) {
    return type.VALUE_REF[methodId];
  }

  function init() {
    this.methodSetting = thisMethodSetting;
    this.gameRules = this.methodSetting.gameRules;
    this.gameSections = this.gameRules.sections;
    this.formula = this.gameRules.formula;
    this.uniqueInt = this.gameRules.uniqueInt;
    this.isUnique = this.gameRules.isUnique;
    this.minimumRowPick = this.gameRules.minimumRowPick;
    this.pickRange = this.gameRules.pickRange;
    this.openOptions = this.gameRules.openOptions;
    this.bypassValidate = this.gameRules.bypassValidate;
    this.valueRef = getValueRef(this.methodSetting.methodId);
    this.openOptionsOnGame = thisOpenOption;
    this.isNotOpenOptions =
      _.isEmpty(this.valueRef) && _.isEmpty(this.openOptionsOnGame);
    this.isOpenOptions = !_.isEmpty(this.openOptions);
    this.thisBetObj = thisBetObj;
    this.picksLength = getEachPicksLength({
      gameSections: this.gameSections,
      thisBetObj: this.thisBetObj,
    });
    this.setIsFullfilled = false;
    this.totalBet = 0;
    return this;
  }

  function validateSet() {
    init.call(this);

    let condition = 0;
    _.forEach(this.picksLength, (length, index) => {
      const range = _.split(this.pickRange[index], '-');
      const min = range[0];
      const max = range[1];
      const conditionPassed = length >= min && length <= max;
      if (conditionPassed) {
        condition++;
      }
    });

    this.setIsFullfilled =
      condition >= this.minimumRowPick || this.bypassValidate;
    return this;
  }

  function calculateBet() {
    if (calculation[`${this.formula}`] && this.setIsFullfilled) {
      this.totalBet = calculation[`${this.formula}`].calculate({
        minimumRowPick: this.minimumRowPick,
        openOptionsOnGame: this.openOptionsOnGame,
        pickRange: this.pickRange,
        picksLength: this.picksLength,
        thisBetObj: this.thisBetObj,
        setIsFulFilled: this.setIsFullfilled,
        valueRef: this.valueRef,
        uniqueInt: this.uniqueInt,
      });
      this.totalBet = this.isOpenOptions
        ? this.totalBet.getOpenOptionsTotal()
        : this.totalBet.getTotal();
    } else this.totalBet = 0;
    return this;
  }
  function getTotal() {
    return this.totalBet;
  }
  return {validate: validateSet, calculate: calculateBet, getTotal};
};

export const getBetQuantity = ({
  thisMethodSetting,
  thisBetObj,
  thisOpenOption,
}) => {
  const betQuantity = getNumberOfUnits({
    thisMethodSetting,
    thisBetObj,
    thisOpenOption,
  })
    .validate()
    .calculate()
    .getTotal();
  return betQuantity;
};

export const calculateBetAmount = existingBetAmount => {
  let newTotalAmount = 0;
  _.map(type.UNITS, (unitMultiplier, unitName) => {
    newTotalAmount += existingBetAmount[unitName] * unitMultiplier;
  });
  return newTotalAmount;
};

export const getCalculateDetails = ({
  existingBetAmount,
  existingMultiply,
  existingOpenOptions,
  existingPicks,
  existingReturnRatio,
  selectedGameName,
  selectedGameSetting,
  gamePrize,
}) => {
  const thisBetObj = existingPicks[selectedGameName] || {};
  const openOptionsOnGame = existingOpenOptions[selectedGameName];
  const numberOfUnits = getBetQuantity({
    selectedGameSetting,
    thisBetObj,
    openOptionsOnGame,
  });
  const multiply = existingMultiply[selectedGameName] || 1;
  const currentReturnRatio = existingReturnRatio[selectedGameName] || 0;
  let pricePerUnit = calculateBetAmount(existingBetAmount[selectedGameName]);
  pricePerUnit *= multiply;
  let amount = pricePerUnit * numberOfUnits;
  amount = parseFloat(amount.toFixed(3));
  const {prizeSettings} = gamePrize;
  const {prizeAmount} = prizeSettings[0];
  const firstPrizeName = prizeSettings[0].prizeNameForDisplay;
  const shouldShowPrize = firstPrizeName === type.GRAND_PRIZE && prizeAmount;
  let largestPrizeAmount =
    pricePerUnit * prizeAmount * (1 - currentReturnRatio);
  largestPrizeAmount = parseFloat(largestPrizeAmount.toFixed(3));
  largestPrizeAmount = shouldShowPrize ? largestPrizeAmount : '-';
  return {
    amount,
    largestPrizeAmount,
    numberOfUnits,
    pricePerUnit,
  };
};
