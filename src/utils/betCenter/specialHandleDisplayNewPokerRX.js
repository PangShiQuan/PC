import { settingMap } from 'utils';
import { find } from 'lodash';

const { gamesMap, gameSettingsMap } = settingMap;

export default function specialHandleDisplayNewPokerRX(thisGameId, methodId, betString) {
  const thisGameMap = find(gamesMap, ['gameUniqueId', thisGameId]);
  const mapKey = thisGameMap.gameSettingsMap;
  const thisGameSetting = gameSettingsMap[mapKey];
  const thisPokerSpecialRules = find(thisGameSetting, ['methodId', methodId]);
  let thisPokerSpecialGameRules;
  let modifiedPokerString = [];
  if (thisPokerSpecialRules && thisPokerSpecialRules.gameRules && thisPokerSpecialRules.gameRules.mixBetString) {
    thisPokerSpecialGameRules = thisPokerSpecialRules.gameRules.mixBetString;
  }
  if (methodId.includes('NR')) {
    const splitBetString = betString.split(' ');
    const splitBetStringPerBetUnits = betString.split('|');
    if (Array.isArray(splitBetString)) {
      splitBetString.forEach(item=>{
        if (thisPokerSpecialGameRules[item]) {
          modifiedPokerString.push(thisPokerSpecialGameRules[item]);
        }
      });
    }
    if (Array.isArray(splitBetStringPerBetUnits)) {
      splitBetStringPerBetUnits.forEach(item=>{
        if (thisPokerSpecialGameRules[item]) {
          modifiedPokerString.push(thisPokerSpecialGameRules[item]);
        }
      });
    }
  }
  return modifiedPokerString.join(' ');
};