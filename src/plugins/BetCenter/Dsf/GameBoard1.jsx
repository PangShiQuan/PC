import React, {Component} from 'react';
import _ from 'lodash';
import {PokerCard} from 'components/General';
import {codeResult, type as TYPE, rounding} from 'utils';
import resolve from 'clientResolver';
import MarkSixShortCuts from 'components/BetCenter/MarkSixShortCuts';

const css = resolve.client('styles/betCenter/GameBoard.less');

const GAME_RESULT = codeResult.default;

const SymbolicControllerBtns = function SymbolicControllerBtns({
  section,
  onSelect,
  currentTimeEpoch,
  selectedNums,
  disabled,
}) {
  function onClick(nums) {
    let fullGroup = selectedNums || [];
    if (nums) {
      const notExistNums = nums.filter(num => fullGroup.indexOf(num) < 0);
      fullGroup = fullGroup.concat(notExistNums);
    }
    onSelect({section, group: fullGroup});
  }
  return (
    <MarkSixShortCuts
      btnClassName={css.gameboard_ctrlBtn}
      onSelect={onClick}
      currentTimeEpoch={currentTimeEpoch}
      selectedNums={selectedNums}
      disabled={disabled}
    />
  );
};

class Gameboard extends Component {
  static isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  static shouldDisabledBulkSelect(sectionIndex, {set, pickRange}) {
    const currentSet = set[sectionIndex] || set[0];
    let range = pickRange[sectionIndex] || pickRange[0];
    range = _.split(range, '-');
    const maxRange = +range[1];
    return currentSet.length !== maxRange;
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      全: {},
      大: {},
      小: {},
      奇: {},
      偶: {},
      清: {},
      noneBingoLength: 0,
      groupBingoLength: 0,
      labelPrizeAmount: 0,
    };
  }

  componentWillMount() {
    this.splitGroupSet(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.splitGroupSet(nextProps);
    this.getLabelPrizeAmount(nextProps);
  }

  getLabelPrizeAmount({
    thisMethodPrizeSetting,
    methodId,
    thisGameId,
    thisBetString,
  }) {
    if (thisMethodPrizeSetting) {
      const {prizeSettings} = thisMethodPrizeSetting;
      const isMultiplePrize = new RegExp(
        /(MARK_SIX)|(HF_JSMS)|(HF_\w[aA-zZ]\d[28])/g,
      );
      const idHasMultiplePrize = isMultiplePrize.test(thisGameId);
      const hasDynamicPrizeAmount = ['NB', 'GRPX'].indexOf(methodId) > -1;
      const isConnectNumberMethod =
        ['LM3Z2', 'LM3QZ', 'LM2QZ', 'LM2ZT', 'LMTC', 'LM4QZ'].indexOf(
          methodId,
        ) > -1;
      const shouldShowPrizeAmount =
        (idHasMultiplePrize &&
          (prizeSettings.length === 1 || hasDynamicPrizeAmount)) ||
        isConnectNumberMethod;
      let labelPrizeAmount = prizeSettings[0].prizeAmount;

      if (methodId === 'SA') {
        labelPrizeAmount *= 0.9;
      } else if (hasDynamicPrizeAmount) {
        const betArray = _.split(thisBetString, ' ');
        const {length} = betArray;
        const prize =
          _.find(prizeSettings, [
            'prizeType',
            `MARKSIX_NONE_BINGO_${length}`,
          ]) ||
          _.find(prizeSettings, ['prizeType', `MARKSIX_GROUP_XIAO_${length}`]);
        if (prize) {
          labelPrizeAmount = rounding.roundDown(prize.prizeAmount);
        } else {
          labelPrizeAmount = '---';
        }
      } else if (isConnectNumberMethod) {
        labelPrizeAmount = _.map(prizeSettings, prize => {
          const {prizeAmount, prizeNameForDisplay} = prize;
          return (
            <span key={prizeNameForDisplay}>
              {prizeNameForDisplay} {rounding.roundDown(prizeAmount)}
            </span>
          );
        });
      } else if (_.isNumber(labelPrizeAmount)) {
        labelPrizeAmount = <span>{rounding.roundDown(labelPrizeAmount)}</span>;
      }

      if (shouldShowPrizeAmount) {
        this.setState({labelPrizeAmount});
      } else {
        this.setState({labelPrizeAmount: 0});
      }
    }
  }

  splitGroupSet({thisMethodSetting}) {
    if (thisMethodSetting) {
      const {gameRules} = thisMethodSetting;
      const {sections, set, isGroupBtn} = gameRules;
      const all = {};
      const largeGroup = {};
      const smallGroup = {};
      const oddGroup = {};
      const evenGroup = {};
      const emptyGroup = {};
      _.forEach(sections, (section, sectionIndex) => {
        all[section] = [];
        largeGroup[section] = [];
        smallGroup[section] = [];
        oddGroup[section] = [];
        evenGroup[section] = [];
        emptyGroup[section] = [];
        if (Gameboard.shouldDisabledBulkSelect(sectionIndex, gameRules)) return;
        const bets = set[sectionIndex] || set[0];
        let setHalfIndex = Math.round(bets.length / 2);
        const startFromOne = bets.length === 49;
        if (startFromOne) setHalfIndex -= 1;
        _.forEach(bets, (number, index) => {
          let bet = number;
          if (isGroupBtn) {
            bet = number.displayText;
          }
          all[section].push(bet);
          const int = parseInt(bet);
          const isNumber = Gameboard.isNumeric(bet);
          const isSymbolic =
            _.indexOf(TYPE.SYMBOLICS, number) > -1 &&
            bets.length === TYPE.SYMBOLICS.length;
          const isOdd =
            int % 2 === 1 ||
            /单/i.test(bet) ||
            (isSymbolic && (index + 1) % 2 === 1);
          const isEven =
            int % 2 === 0 ||
            /双/i.test(bet) ||
            (isSymbolic && (index + 1) % 2 === 0);
          const isBig =
            /大/i.test(bet) ||
            (isNumber && index >= setHalfIndex) ||
            (isSymbolic && index >= setHalfIndex);
          const isSmall =
            /小/i.test(bet) ||
            (isNumber && index < setHalfIndex) ||
            (isSymbolic && index < setHalfIndex);
          if (isOdd) {
            oddGroup[section].push(bet);
          }
          if (isEven) {
            evenGroup[section].push(bet);
          }
          if (isBig) {
            largeGroup[section].push(bet);
          }
          if (isSmall) {
            smallGroup[section].push(bet);
          }
        });
      });

      this.setState({
        全: {...all},
        大: {...largeGroup},
        小: {...smallGroup},
        奇: {...oddGroup},
        偶: {...evenGroup},
        清: {...emptyGroup},
      });
    }
  }

  renderControllerBtns({section, sectionIndex}) {
    const {
      thisBetObj,
      onControllerClick,
      thisMethodSetting,
      thisGameResult,
    } = this.props;
    const thisSection = thisBetObj[section];
    const {gameRules} = thisMethodSetting;
    const {set} = gameRules;
    const bets = set[sectionIndex] || set[0];
    const hideSymbolic = bets.length !== 49;
    const neededState = _.pick(this.state, [
      '全',
      '大',
      '小',
      '奇',
      '偶',
      '清',
    ]);

    return (
      <div>
        {hideSymbolic || !thisGameResult ? null : (
          <SymbolicControllerBtns
            section={section}
            onSelect={onControllerClick}
            currentTimeEpoch={thisGameResult.officialOpenTimeEpoch}
            selectedNums={thisBetObj[section]}
            disabled={Gameboard.shouldDisabledBulkSelect(
              sectionIndex,
              gameRules,
            )}
          />
        )}
        {_.map(neededState, (group, groupName) => {
          const thisGroup = group[section];
          const btnProps = {
            className: css.gameboard_ctrlBtn,
            onClick: onControllerClick.bind(this, {section, group: thisGroup}),
            key: groupName,
            disabled:
              thisGroup !== undefined &&
              !thisGroup.length &&
              groupName !== '清',
            'data-active':
              thisGroup &&
              thisSection &&
              _.isEqual(thisSection.sort(), thisGroup.sort()) &&
              groupName !== '清',
          };
          return (
            <button type="button" {...btnProps}>
              {groupName}
            </button>
          );
        })}
      </div>
    );
  }

  renderArrayBtn(section, set) {
    const {thisBetObj, onBetClick, thisMethodPrizeSetting} = this.props;
    const {prizeSettings} = thisMethodPrizeSetting;

    return _.map(set, item => {
      let betPrize = '';
      const {displayText, color, numberArrays} = item;
      if (prizeSettings && prizeSettings.length > 1) {
        betPrize = _.find(prizeSettings, ['prizeNameForDisplay', displayText]);
      }
      const btnIsActive =
        thisBetObj[section] && thisBetObj[section].indexOf(displayText) > -1;
      const btnProps = {
        className: css.gameboard_groupBtn,
        onClick: onBetClick.bind(this, {section, bet: displayText}),
        key: displayText,
        'data-color': color,
        'data-active': btnIsActive,
        style: {marginBottom: betPrize ? '1.5rem' : ''},
      };
      const btnTextProps = {
        className: css.gameboard_btnDisplayText,
      };
      return (
        <button type="button" {...btnProps}>
          <span {...btnTextProps}>{displayText}</span>
          <span className={css.gameboard_btnNums} data-color={color}>
            {_.map(numberArrays, number => {
              const btnSpanProps = {
                'data-color': color,
                key: number,
                className: css.gameboard_btnNum,
              };
              return <span {...btnSpanProps}>{number}</span>;
            })}
          </span>
          {betPrize ? (
            <span className={css.gameboard_btnPrize}>
              {rounding.roundDown(betPrize.prizeAmount)}
            </span>
          ) : null}
        </button>
      );
    });
  }

  renderSection({section, sectionIndex}) {
    const {
      thisMethodSetting,
      thisBetObj,
      onBetClick,
      thisMethodPrizeSetting,
      methodId,
      thisGameId,
    } = this.props;
    const k3Regex = new RegExp(/(HF_\w[aA-zZ]K3)/g);
    const isK3 = k3Regex.test(thisGameId);
    const {prizeSettings} = thisMethodPrizeSetting;
    const {gameRules, displayOverwrite} = thisMethodSetting;
    const {isGroupBtn, set, displaySet} = gameRules;
    const bets = set[sectionIndex] || set[0];
    if (isGroupBtn) {
      return this.renderArrayBtn(section, bets);
    }
    return _.map(bets, (bet, index) => {
      let displayText = bet;
      if (displayOverwrite) {
        displayText = displaySet[sectionIndex][index] || displaySet[0][index];
      }
      let betPrize = '';
      if (prizeSettings && prizeSettings.length > 1) {
        const {symbolic} = thisMethodPrizeSetting;
        const symbolicName = TYPE[`SYMBOLIC_${symbolic}`];
        const tailName = TYPE[`${symbolic}`];
        if (symbolicName) {
          if (bet === symbolicName) {
            betPrize = _.find(
              prizeSettings,
              p => p.prizeType.indexOf('_CUR') > -1,
            );
          } else {
            betPrize = _.find(
              prizeSettings,
              p => p.prizeType.indexOf('_NOR') > -1,
            );
          }
        } else if (tailName) {
          if (bet === tailName) {
            betPrize = _.find(
              prizeSettings,
              p => p.prizeType.indexOf('_CUR') > -1,
            );
          } else {
            betPrize = _.find(
              prizeSettings,
              p => p.prizeType.indexOf('_NOR') > -1,
            );
          }
        } else if (isK3 && methodId === 'HZ') {
          betPrize = _.find(prizeSettings, [
            'prizeNameForDisplay',
            `${section}${bet}`,
          ]);
        } else {
          betPrize = _.find(prizeSettings, ['prizeNameForDisplay', `${bet}`]);
        }
      }

      const btnProps = {
        style: betPrize ? {marginBottom: '1.5rem'} : {},
        className: css.gameboard_btn,
        onClick: onBetClick.bind(this, {section, bet}),
        key: `${section}__${bet}`,
        'data-active':
          thisBetObj[section] && thisBetObj[section].indexOf(bet) > -1,
      };

      if (bets.length === 49)
        btnProps['data-color'] = GAME_RESULT.getNumColor(
          {gameId: thisGameId},
          displayText,
        );

      return (
        <div key={bet}>
          <button type="button" {...btnProps}>
            {displayText}
            {betPrize ? (
              <span className={css.gameboard_btnPrize}>
                {methodId === 'SA'
                  ? rounding.roundDown(betPrize.prizeAmount * 0.9)
                  : rounding.roundDown(betPrize.prizeAmount)}
              </span>
            ) : null}
          </button>
        </div>
      );
    });
  }

  rendersetLunpanNum(number, classname, top, left, leftDataActive, {section}) {
    const {thisBetObj, onBetClick} = this.props;
    return (
      <div>
        {_.map(number, (bet, index) => {
          const leftActive =
            thisBetObj[section] && thisBetObj[section].indexOf(bet) > -1
              ? leftDataActive
              : left;
          const btnProps = {
            onClick: onBetClick.bind(this, {section, bet}),
            style: {top: `${top}rem`, left: `${leftActive + index * 3.26}rem`},
            className: classname,
            key: bet,
            'data-active':
              thisBetObj[section] && thisBetObj[section].indexOf(bet) > -1,
          };
          return <button type="button" {...btnProps} />;
        })}
      </div>
    );
  }

  renderLunpanNum(number, rowNum, classname, top, left, {section}) {
    const {thisBetObj, onBetClick} = this.props;
    return (
      <div>
        {_.map(number[rowNum], (bet, index) => {
          let leftIndex;
          if (rowNum === 'SECOND_ROW') {
            if (index == 1 || index == 0) {
              leftIndex = 3.76 * index;
            } else leftIndex = 3.26 * index + 0.5;
          } else leftIndex = 3.26 * index;
          const btnProps = {
            onClick: onBetClick.bind(this, {section, bet}),
            style: {top: `${top}rem`, left: `${left + leftIndex}rem`},
            className: classname,
            key: bet,
            'data-active':
              thisBetObj[section] && thisBetObj[section].indexOf(bet) > -1,
            'data-color': codeResult.getLunpanColor(bet),
          };
          return (
            <button type="button" {...btnProps}>
              {bet}
            </button>
          );
        })}
      </div>
    );
  }

  renderSpecialBtn(
    number,
    classname,
    top,
    left,
    adjustleft,
    adjusttop,
    {section},
  ) {
    const {thisBetObj, onBetClick} = this.props;
    return (
      <div>
        {_.map(number, (bet, index) => {
          let adjustLeftValue, displayValue, adjustLeftSpan;
          switch (bet) {
            case '小':
              displayValue = '1 to 18';
              adjustLeftSpan = 6.6;
              break;
            case '大':
              displayValue = '19 to 36';
              adjustLeftSpan = 12.4;
              break;
            case '黑':
              displayValue = 'Black';
              adjustLeftSpan = 20.1;
              break;
            case '红':
              displayValue = 'Red';
              adjustLeftSpan = 26.4;
              break;
            case '单':
              displayValue = 'Odd';
              adjustLeftSpan = 33.4;
              break;
            case '双':
              displayValue = 'Even';
              adjustLeftSpan = 39.3;
              break;
          }
          if (index > 1 && number.length > 3) {
            if (index == 4 || index == 5) {
              adjustLeftValue = index * adjustleft + 2;
            } else adjustLeftValue = index * adjustleft + 1;
          } else adjustLeftValue = index * adjustleft;
          const btnProps = {
            onClick: onBetClick.bind(this, {section, bet}),
            style: {
              top: `${top + index * adjusttop}rem`,
              left: `${left + adjustLeftValue}rem`,
            },
            className: classname,
            key: bet,
            'data-active':
              thisBetObj[section] && thisBetObj[section].indexOf(bet) > -1,
            'data-color': codeResult.getLunpanColor(bet),
          };
          const spanProps = {
            className: css.gameboard_lunpanNumSpan,
            style: {
              top: `${top + 2.5 + index * adjusttop}rem`,
              left: `${adjustLeftSpan}rem`,
            },
            'data-active':
              thisBetObj[section] && thisBetObj[section].indexOf(bet) > -1,
            'data-color': codeResult.getLunpanColor(bet),
          };
          return (
            <div key={bet}>
              <button type="button" {...btnProps}>
                {bet}
              </button>
              <span {...spanProps}>{displayValue}</span>
            </div>
          );
        })}
      </div>
    );
  }

  renderLunpan({section, sectionIndex}) {
    const {
      thisMethodSetting,
      thisBetObj,
      onBetClick,
      thisMethodPrizeSetting,
    } = this.props;
    const {gameRules, methodId} = thisMethodSetting;
    const {
      set,
      setLunpanIndicator,
      setLunpanSpecialIndicator,
      setLunpanSpecialDivideIndicator,
      setLunpanNum,
      setLunpanNumPickSix,
      setLunpanNumPickFourFirst,
      setLunpanNumPickFourSecond,
    } = gameRules;
    return (
      <div className={css.gameboard_lunpan_section} key={sectionIndex}>
        {this.rendersetLunpanNum(
          ...setLunpanNumPickSix,
          css.gameboard_lunpanTwoArrayNumBtn,
          -0.2,
          4.17,
          4.22,
          {section},
        )}
        {this.rendersetLunpanNum(
          ...setLunpanNumPickFourFirst,
          css.gameboard_lunpanFourArrayNumBtn,
          2.8,
          7.5,
          7.5,
          {section},
        )}
        {this.rendersetLunpanNum(
          ...setLunpanNumPickFourSecond,
          css.gameboard_lunpanFourArrayNumBtn,
          6,
          7.5,
          7.5,
          {section},
        )}
        {this.renderLunpanNum(
          ...setLunpanNum,
          'FIRST_ROW',
          css.gameboard_lunpanNumBtn,
          0.5,
          5.2,
          {section},
        )}
        {this.renderLunpanNum(
          ...setLunpanNum,
          'SECOND_ROW',
          css.gameboard_lunpanNumBtn,
          3.7,
          1.5,
          {section},
        )}
        {this.renderLunpanNum(
          ...setLunpanNum,
          'THIRD_ROW',
          css.gameboard_lunpanNumBtn,
          6.9,
          5.2,
          {section},
        )}
        {this.renderSpecialBtn(
          ...setLunpanIndicator,
          css.gameboard_lunpanNumBtn,
          12.2,
          7.2,
          6,
          0,
          {section},
        )}
        {this.renderSpecialBtn(
          ...setLunpanSpecialIndicator,
          css.gameboard_lunpanSpecialIndicator,
          9.8,
          5.3,
          13,
          0,
          {section},
        )}
        {this.renderSpecialBtn(
          ...setLunpanSpecialDivideIndicator,
          css.gameboard_lunpanSpecialDivideIndicator,
          0.5,
          44.1,
          0,
          3.2,
          {section},
        )}
      </div>
    );
  }

  renderPoker({section, sectionIndex}) {
    const {
      thisMethodSetting,
      thisBetObj,
      onBetClick,
      thisMethodPrizeSetting,
    } = this.props;
    const {prizeSettings} = thisMethodPrizeSetting;
    const {gameRules, methodId} = thisMethodSetting;
    const {set, displaySet, showMethod, isNum} = gameRules;
    const pokersArray = set[sectionIndex];
    const isBX = methodId === 'BX';
    return (
      <div className={css.gameboard_section} key={sectionIndex}>
        {_.map(pokersArray, (bet, index) => {
          const btnProps = {
            onClick: onBetClick.bind(this, {section, bet}),
            className: isNum ? css.gameboard_numBtn : css.gameboard_pokerBtn,
            key: bet,
            'data-active':
              thisBetObj[section] && thisBetObj[section].indexOf(bet) > -1,
          };
          const betPrize = _.find(prizeSettings, [
            'prizeNameForDisplay',
            `${bet}`,
          ]);
          return (
            <button type="button" {...btnProps}>
              {showMethod ? (
                <p
                  className={
                    isNum
                      ? css.gameboard_numMethodText
                      : css.gameboard_pokerMethodText
                  }>
                  {pokersArray[index]}
                </p>
              ) : null}
              {isBX ? '如' : ''}
              {isNum ? null : (
                <PokerCard pokerCode={displaySet[index]} size={1.2} key={bet} />
              )}
              {(isBX || isNum) && betPrize ? (
                <span className={css.gameboard_btnPrize}>
                  {rounding.roundDown(betPrize.prizeAmount)}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    );
  }

  render() {
    const {thisMethodSetting, thisMethodPrizeSetting} = this.props;
    const {labelPrizeAmount} = this.state;
    if (thisMethodPrizeSetting && thisMethodSetting) {
      const {gameRules, isPoker, isLunpan} = thisMethodSetting;
      const {sections} = gameRules;
      return _.map(sections, (section, sectionIndex) => {
        if (isPoker) {
          return this.renderPoker({section, sectionIndex});
        }

        if (isLunpan) {
          return this.renderLunpan({section, sectionIndex});
        }

        return (
          <div className={css.gameboard_section} key={section}>
            <span className={css.gameboard_sectionLabel}>{section}</span>
            <div className={css.gameboard_btns}>
              {this.renderSection({section, sectionIndex})}

              {labelPrizeAmount ? (
                <p className={css.gameboard_labelPrizeAmount}>
                  赔率: {labelPrizeAmount}
                </p>
              ) : null}
            </div>
            <div className={css.gameboard_ctrlBtns}>
              {this.renderControllerBtns({section, sectionIndex})}
            </div>
          </div>
        );
      });
    }

    return null;
  }
}

export default Gameboard;
