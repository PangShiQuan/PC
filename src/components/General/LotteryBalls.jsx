import React from 'react';
import {sum, toNumber, split, map, fill, floor, pickBy} from 'lodash';
import PropsType from 'prop-types';

import classnames from 'classnames';
import css from 'styles/general/Dsf/lotteryBalls1.less';
import GAME_RESULT, {
  getElement,
  getZodiacName,
  getLunpanColor,
  getLunpanNumber,
} from 'utils/codeResult';
import {
  GAME_CATEGORY,
  CUSTOM_GAME_CATEGORY,
  T_NAME,
  ELEMENT,
} from 'utils/type.config';
import Dice from './Dice';
import PokerCard from './PokerCard';

const {SHISHICAI, PCDANDAN} = GAME_CATEGORY;
const {SIX} = CUSTOM_GAME_CATEGORY;

const fontColor = {
  red: css.drawNo_red,
  orange: css.drawNo_orange,
  green: css.drawNo_green,
};

const renderResult = (output, fontClass, index) => {
  return (
    <span className={fontClass} key={`key__${index}`}>
      {output}
    </span>
  );
};

const calcMarkSix = (displayType, drawNo) => {
  let output = null;
  let textColor = null;
  const drawNumber = Number(drawNo);
  if (drawNumber === 49) {
    output = '和';
    textColor = css.drawNo_greenBg;
  }

  if (output === null && displayType === 1) {
    if (drawNumber > 24) {
      output = '大';
      textColor = css.drawNo_redBg;
    } else {
      output = '小';
      textColor = css.drawNo_orangeBg;
    }
  } else if (output === null && displayType === 2) {
    if (drawNumber % 2 !== 0) {
      output = '单';
      textColor = css.drawNo_redBg;
    } else {
      output = '双';
      textColor = css.drawNo_orangeBg;
    }
  }
  return {textColor, output};
};

const calcHFCQSSC = (displayType, drawNo) => {
  let textColor = null;
  let output = null;
  if (displayType === 1) {
    textColor = Number(drawNo) > 4 ? fontColor.red : fontColor.orange;
    output = textColor === fontColor.red ? '大' : '小';
  } else if (displayType === 2) {
    textColor = Number(drawNo) % 2 !== 0 ? fontColor.red : fontColor.orange;
    output = textColor === fontColor.red ? '单' : '双';
  }
  return {textColor, output};
};

const calcK3 = (displayType, drawNo) => {
  let textColor = null;
  let output = null;
  if (displayType === 1) {
    textColor = Number(drawNo) > 3 ? fontColor.red : fontColor.orange;
    output = textColor === fontColor.red ? '大' : '小';
  } else if (displayType === 2) {
    textColor = Number(drawNo) % 2 !== 0 ? fontColor.red : fontColor.orange;
    output = textColor === fontColor.red ? '单' : '双';
  }
  return {textColor, output};
};

const calcPCdandan = (displayType, drawNo) => {
  let textColor = null;
  let output = null;
  if (displayType === 1) {
    textColor = Number(drawNo) > 13 ? fontColor.red : fontColor.orange;
    output = textColor === fontColor.red ? '大' : '小';
  } else if (displayType === 2) {
    textColor = Number(drawNo) % 2 !== 0 ? fontColor.red : fontColor.orange;
    output = textColor === fontColor.red ? '单' : '双';
  }
  return {textColor, output};
};

const calcPoker = (displayType, drawNo) => {
  let textColor = null;
  let output = null;
  if (displayType === 1) {
    if (Number(drawNo) === 13) {
      textColor = fontColor.green;
      output = '和';
    } else {
      textColor = Number(drawNo) > 6 ? fontColor.red : fontColor.orange;
      output = textColor === fontColor.red ? '大' : '小';
    }
  } else if (displayType === 2) {
    textColor = Number(drawNo) % 2 !== 0 ? fontColor.red : fontColor.orange;
    output = textColor === fontColor.red ? '单' : '双';
  }
  return {textColor, output};
};

const calcPK = (displayType, drawNo) => {
  let textColor = null;
  let output = null;
  if (displayType === 1) {
    textColor = Number(drawNo) > 5 ? fontColor.red : fontColor.orange;
    output = textColor === fontColor.red ? '大' : '小';
  } else if (displayType === 2) {
    textColor = Number(drawNo) % 2 !== 0 ? fontColor.red : fontColor.orange;
    output = textColor === fontColor.red ? '单' : '双';
  }
  return {textColor, output};
};

function LotteryBalls(props) {
  const {
    diceSize,
    gameId,
    numsClassName,
    numsContainerClassName,
    numsDividerClassName,
    openCode,
    pokerSize,
    showPkTenIndex,
    indexShow,
    inBetCenter,
    forCQSSCFontStyle,
    splitStringWith,
    hideSymbolic,
    hideElement,
    currentTimeEpoch,
    displayCodeType,
  } = props;
  if (!openCode) {
    return null;
  }
  const strArray = split(openCode, splitStringWith);
  const numsArray = map(strArray, num => toNumber(num));
  const totals = sum(numsArray);
  const lastNum = strArray[strArray.length - 1];
  const sliceLunPanNumber = Number(getLunpanNumber(numsArray).slice(2, 4));
  const sliceLunPanWord = getLunpanNumber(numsArray).slice(0, 2);
  const sliceLunPanNumberColor = getLunpanColor(sliceLunPanNumber);
  let Nodes = [];

  if (gameId.endsWith('MARK_SIX') || gameId === 'HF_JSMS') {
    Nodes = map(strArray, (drawNo, index) => {
      if (displayCodeType === 1 || displayCodeType === 2) {
        const {textColor, output} = calcMarkSix(displayCodeType, drawNo);
        return renderResult(output, textColor, index);
      }
      return (
        <span
          data-color={GAME_RESULT.getNumColor({methodMapId: SIX}, drawNo)}
          className={numsClassName}
          key={`${drawNo}__${index}`}
          style={{
            position: 'relative',
            marginBottom: hideSymbolic ? '' : '1rem',
          }}>
          {drawNo}
          {hideSymbolic ? null : (
            <span className={css.lotterys_symbolicName}>
              {getZodiacName({openCode: drawNo, currentTimeEpoch})}
            </span>
          )}
        </span>
      );
    });

    fill(
      Nodes,
      <span className={numsDividerClassName} key="divider_+">
        +
      </span>,
      Nodes.length - 1,
      Nodes.length,
    );
    if (displayCodeType === 1 || displayCodeType === 2) {
      const {textColor, output} = calcMarkSix(displayCodeType, lastNum);
      Nodes.push(renderResult(output, textColor, 'last'));
    } else {
      let resultChineseElement, resultEnglishElement;
      if (!hideSymbolic) {
        resultChineseElement = getElement({
          openCode: lastNum,
          currentTimeEpoch,
        });

        resultEnglishElement = Object.keys(
          pickBy(ELEMENT, x => x === resultChineseElement),
        )[0];
      }

      Nodes.push(
        <span
          data-color={GAME_RESULT.getNumColor({methodMapId: SIX}, lastNum)}
          className={numsClassName}
          key={`${lastNum}__lastNum`}
          style={{
            position: 'relative',
            marginBottom: hideSymbolic ? '' : '1rem',
          }}>
          {lastNum}
          {hideSymbolic ? null : (
            <React.Fragment>
              <span className={css.lotterys_symbolicName}>
                {getZodiacName({openCode: lastNum, currentTimeEpoch})}
              </span>
              <span
                className={css.lotterys_elementName}
                data-result={resultEnglishElement}>
                ({getElement({openCode: lastNum, currentTimeEpoch})})
              </span>
            </React.Fragment>
          )}
        </span>,
      );
    }
  } else if (gameId.indexOf('K3') > -1) {
    Nodes = map(numsArray, (drawNo, index) => {
      if (displayCodeType === 1 || displayCodeType === 2) {
        const {textColor, output} = calcK3(displayCodeType, drawNo);
        return renderResult(output, textColor, index);
      }
      return (
        <Dice key={`${drawNo}__${index}`} diceNum={drawNo} size={diceSize} />
      );
    });
  } else if (gameId.indexOf('28') > -1) {
    if (displayCodeType === 1 || displayCodeType === 2) {
      const {textColor, output} = calcPCdandan(displayCodeType, totals);
      Nodes.push(renderResult(output, textColor, 'sum'));
    } else {
      Nodes = [
        <span className={numsClassName} key="num1">
          {strArray[0]}
        </span>,
        <span className={numsDividerClassName} key="divider_+1">
          +
        </span>,
        <span className={numsClassName} key="num2">
          {strArray[1]}
        </span>,
        <span className={numsDividerClassName} key="divider_+2">
          +
        </span>,
        <span className={numsClassName} key="num3">
          {strArray[2]}
        </span>,
        <span className={numsDividerClassName} key="divider_=">
          =
        </span>,
        <span
          className={numsClassName}
          key="sum"
          data-color={GAME_RESULT.getNumColor(
            {methodMapId: PCDANDAN},
            totals,
            false,
          )}>
          {totals}
        </span>,
      ];
    }
    if (!hideElement) {
      Nodes.push(
        <span className={numsDividerClassName} key="divider_Sum">
          {GAME_RESULT.getBigSmallOddEven(
            {methodMapId: PCDANDAN},
            totals,
            true,
          )}
          &nbsp;|&nbsp;
          {`${sliceLunPanWord} `}
          <span style={{color: sliceLunPanNumberColor}}>
            {sliceLunPanNumber}
          </span>
        </span>,
      );
    }
  } else if (gameId.indexOf('KLPK') > -1 || gameId.indexOf('XYPK') > -1) {
    Nodes = map(numsArray, (drawNo, index) => {
      if (displayCodeType === 1 || displayCodeType === 2) {
        const cardNo = map([drawNo], code => {
          const symbolCode = floor(code, -2);
          return code - symbolCode;
        });
        return map(cardNo, (nestedDrawNo, nestedIndex) => {
          const {textColor, output} = calcPoker(displayCodeType, nestedDrawNo);
          return renderResult(output, textColor, nestedIndex);
        });
      }
      return <PokerCard pokerCode={[drawNo]} size={pokerSize} key={index} />;
    });
  } else {
    if (
      gameId === 'HF_XYSM' ||
      /PK10$/.test(gameId) ||
      /XY10$/.test(gameId) ||
      /FT$/.test(gameId)
    ) {
      Nodes = map(strArray, (drawNo, index) => {
        if (displayCodeType === 1 || displayCodeType === 2) {
          const {textColor, output} = calcPK(displayCodeType, drawNo);
          return renderResult(output, textColor, index);
        }
        return (
          <span
            className={numsClassName}
            style={
              inBetCenter && {
                background: showPkTenIndex === 0 ? '#e4393c' : '#e4393c',
              }
            }
            key={`${drawNo}__${index}`}>
            {drawNo}
          </span>
        );
      });
    } else {
      Nodes = map(strArray, (drawNo, index) => {
        if (displayCodeType === 1 || displayCodeType === 2) {
          const {textColor, output} = calcHFCQSSC(displayCodeType, drawNo);
          return renderResult(output, textColor, index);
        }
        return (
          <span className={numsClassName} key={`${drawNo}__${index}`}>
            {drawNo}
          </span>
        );
      });
    }

    if (
      (/SSC$/.test(gameId) ||
        gameId === 'FLCKL8' ||
        gameId === 'PL5' ||
        gameId === 'HF_TXFFC' ||
        gameId === 'HF_AZXY5') &&
      !hideElement
    ) {
      const lastTwoNumStr = (
        <span className={numsDividerClassName} key="divider_sscLast2Num">
          {GAME_RESULT.getTotalBigSmallOddEven(
            {methodMapId: SHISHICAI},
            numsArray,
          )}
          &nbsp;|&nbsp;
          {GAME_RESULT.getCowName({methodMapId: SHISHICAI}, numsArray)}
          &nbsp;|&nbsp;
          {`${sliceLunPanWord} `}
          <span style={{color: sliceLunPanNumberColor}}>
            {sliceLunPanNumber}
          </span>
        </span>
      );
      Nodes.push(lastTwoNumStr);
    }
  }

  if (gameId.indexOf('K3') > -1 && !hideElement) {
    const bigSmall = GAME_RESULT.getBigSmall({gameId}, totals);
    const oddEven = GAME_RESULT.getOddEven({gameId}, totals);
    Nodes.push(
      <React.Fragment key="divider_Sum">
        <span className={numsDividerClassName}>和值 = {totals} |&nbsp;</span>
        <span
          className={classnames(
            numsDividerClassName,
            bigSmall === T_NAME.BIG
              ? css.gameHistory_drawNo_red
              : css.gameHistory_drawNo_orange,
          )}>
          {bigSmall}
        </span>
        <span
          className={classnames(
            numsDividerClassName,
            oddEven === T_NAME.ODD
              ? css.gameHistory_drawNo_red
              : css.gameHistory_drawNo_orange,
          )}>
          {oddEven}
        </span>
      </React.Fragment>,
    );
  } else if (
    ['HF_SHSSL', 'PL3', 'HF_JS3D', 'X3D'].includes(gameId) &&
    !hideElement
  ) {
    Nodes.push(
      <span className={numsDividerClassName} key="divider_Sum">
        和值 = {totals} |&nbsp;
        {GAME_RESULT.getBigSmallOddEven({gameId}, totals)}&nbsp;|&nbsp;
        {`${sliceLunPanWord} `}
        <span style={{color: sliceLunPanNumberColor}}>{sliceLunPanNumber}</span>
      </span>,
    );
  }

  return <div className={numsContainerClassName}>{Nodes}</div>;
}

LotteryBalls.defaultProps = {
  splitStringWith: ',',
};

LotteryBalls.propTypes = {
  diceSize: PropsType.string,
  gameId: PropsType.string.isRequired,
  numsClassName: PropsType.string,
  numsContainerClassName: PropsType.string,
  numsDividerClassName: PropsType.string,
  openCode: PropsType.string,
  pokerSize: PropsType.number,
  forCQSSCFontStyle: PropsType.string,
  splitStringWith: PropsType.string,
};

export default LotteryBalls;
