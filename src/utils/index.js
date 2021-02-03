import * as API from './API';
import * as calculate from './calculation';
import * as codeResult from './codeResult';
import * as settingMap from './settingMap.config';
import * as type from './type.config';
import * as validate from './validation';

export * as TREND_CHART_CONFIG from './trend.config';

export {API, calculate, codeResult, settingMap, type, validate};

export {default as isGuestUser} from './isGuestUser';

// Utils for betCenter
export {getEachPicksLength} from './betCenter/getEachPicksLength';
export {getSymbolicName} from './betCenter/getSymbolicName';
export {arrayUtil} from './betCenter/arrayUtils';
export {mathUtil} from './betCenter/mathUtils';
export {
  default as specialHandleDisplayNewPokerRX,
} from './betCenter/specialHandleDisplayNewPokerRX';
export {
  default as specialHandleWinningAmount,
} from './betCenter/specialHandleWinningAmount';
export {
  default as specialHandleLunpanBetString,
} from './betCenter/specialHandleLunpanBetString';

export * as gameResult from './gameResult';

export * from './isPlatformExist';

export {default as betPrize} from './betPrize';
export {default as betPlan} from './betPlan';
export {default as betPlanDuration} from './betPlan/checkBetDuration';
export {default as betTableCalculation} from './betTableCalculation';
export {default as betTablePreCalculation} from './betTablePreCalculation';
export {
  default as betTableMultipleCalculation,
} from './betTableMultipleCalculation';
export {getDeviceInfo} from './getDeviceInfo';
export {getServerTimeGap} from './getServerTimeGap';
export {addCommas} from './addCommas';
export {cleanEmptyObj} from './cleanEmptyObj';
export {encodePassword, awaitHash} from './concealed.min';
export {entropyRandom} from './entropyRandom';
export {getConcatArray} from './getConcatArray';
export {getPrizePercentage} from './getPrizePercentage';
export {getRandomInt} from './getRandomInt';
export {getDateTimeRange} from './getDateTimeRange';
export {default as hasTrendChart} from './hasTrendChart';
export {default as isPrimeNumber} from './isPrimeNumber';
export {newStyle} from './newStyle';
export {newWindow} from './newWindow';
export {preflightRequest} from './preflightRequest';
export * as sort from './sort';
export {randomWord} from './randomWord';
export {request} from './request';
export {getGameSetup, isDisabledGame} from './retrieveGame';
export {strPropCheck} from './strPropCheck';
export * as url from './url';
export {logTranslate} from './logTranslate';
export {formatCurrency} from './formatCurrency';
export {isContain} from './isContain';
export {trimString} from './trimString';
export {getChargeAmount} from './getChargeAmount';
export {getTopupAmount} from './getTopupAmount';
export {setWordLimit} from './setWordLimit';
export {default as getHongbaoLink} from './getHongbaoLink';
export {basePath} from './url';
export {getHotGameList, getHotGameListsFilter} from './getHotGameList';
export {getCqSscName} from './getCqSscName';
export {sealPhoneNumberChar} from './sealPhoneNumberChar';
export {sealEmailChar} from './sealEmailChar';
export {default as flattenPlatforms} from './flattenPlatforms';
export * as ENVIRONMENT from './environment';
export {getChatDomain} from './chatbox/getChatDomain';
export * as rounding from './rounding';
