import React, {PureComponent} from 'react';
import _ from 'lodash';
import classnames from 'classnames';
import css from '../../styles/betCenter/GameTableK3.less';

const gameDetailsEnum = {
  HZ: {
    methodId: 'HZ',
    methodGroup: '和值',
    gameMethod: '和值',
    section: '和值',
    values: {
      three: 3,
      four: 4,
      five: 5,
      six: 6,
      seven: 7,
      eight: 8,
      nine: 9,
      ten: 10,
      eleven: 11,
      twelve: 12,
      thirteen: 13,
      fourteen: 14,
      fifteen: 15,
      sixteen: 16,
      seventeen: 17,
      eighteen: 18,
    },
  },
  SUM: {
    methodId: 'SUM',
    methodGroup: '和值',
    gameMethod: '和值-和值大小单双',
    section: '和值',
    values: {
      big: '大',
      small: '小',
      single: '单',
      double: '双',
      bigSingle: '大单',
      bigDouble: '大双',
      smallSingle: '小单',
      smallDouble: '小双',
    },
  },
  STHTX: {
    methodId: 'STHTX',
    methodGroup: '三同号',
    gameMethod: '三同号-三同号通选',
    section: '通选',
    values: {
      all: '*|*|*',
    },
  },
  STHDX: {
    methodId: 'STHDX',
    methodGroup: '三同号',
    gameMethod: '三同号-三同号单选',
    section: '选码',
    values: {
      tripleOne: 1,
      tripleTwo: 2,
      tripleThree: 3,
      tripleFour: 4,
      tripleFive: 5,
      tripleSix: 6,
    },
  },
  SBTH: {
    methodId: 'SBTH',
    methodGroup: '三不同号',
    gameMethod: '三不同号',
    section: '选码',
    values: {
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
    },
  },
  SLHTX: {
    methodId: 'SLHTX',
    methodGroup: '三连号通选',
    gameMethod: '三连号通选',
    section: '通选',
    values: {
      all: '*|*|*',
    },
  },
  ETHFX: {
    methodId: 'ETHFX',
    methodGroup: '二同号',
    gameMethod: '二同号-二同号复选',
    section: '选码',
    values: {
      one: '1|1|*',
      two: '2|2|*',
      three: '3|3|*',
      four: '4|4|*',
      five: '5|5|*',
      six: '6|6|*',
    },
  },
  ETHDX: {
    methodId: 'ETHDX',
    methodGroup: '二同号',
    gameMethod: '二同号-二同号单选',
    section1: '同号',
    values1: {
      one: '11',
      two: '22',
      three: '33',
      four: '44',
      five: '55',
      six: '66',
    },
    section2: '不同号',
    values2: {
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
    },
  },
  EBTH: {
    methodId: 'EBTH',
    methodGroup: '二不同号',
    gameMethod: '二不同号',
    section: '选码',
    values: {
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
    },
  },
  EBTHDT: {
    methodId: 'EBTHDT', // 二不同号-二不同号胆拖
    methodGroup: '二不同号',
    gameMethod: '二不同号-二不同号胆拖',
    section1: '胆码',
    values1: {
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
    },
    section2: '拖码',
    values2: {
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
    },
  },
  NCYG: {
    methodId: 'NCYG',
    methodGroup: '猜一个号',
    gameMethod: '猜一个号',
    section: '选码',
    values: {
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
    },
  },
  KUA: {
    methodId: 'KUA',
    methodGroup: '跨',
    gameMethod: '跨',
    section: '号码',
    values: {
      one: '1跨',
      two: '2跨',
      three: '3跨',
      four: '4跨',
      five: '5跨',
    },
  },
};

class GameTableK3 extends PureComponent {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
    this.state = {
      availableGameMethods: [],
    };
  }

  componentDidMount() {
    this.updateAvailableGameMethods();
  }

  componentDidUpdate(prevProps) {
    const {gameNav} = this.props;
    if (prevProps.gameNav !== gameNav) {
      this.updateAvailableGameMethods();
    }
  }

  updateAvailableGameMethods = () => {
    const {gameNav} = this.props;

    const availableGameMethods = [];
    _.map(gameNav, subNav => {
      if (subNav) {
        _.map(subNav, game => {
          availableGameMethods.push(game.gameMethod);
        });
      }
    });
    // eslint-disable-next-line react/no-did-update-set-state
    this.setState({
      availableGameMethods,
    });
  };

  onBetHandle = ({methodId, gameMethod, section, value}) => {
    const {onMethodSelect, onBetClick, onAddEntry} = this.props;

    onMethodSelect({gameMethod, methodId});
    setTimeout(() => {
      onBetClick({section, bet: value, methodID: methodId});
      onAddEntry({});
    }, 50);
  };

  onETHDXBetHandle = ({
    methodId,
    gameMethod,
    section1,
    section2,
    value1,
    value2,
  }) => {
    const {onMethodSelect, onBetClick, onAddEntry} = this.props;
    onMethodSelect({gameMethod, methodId});
    setTimeout(() => {
      onBetClick({section: section1, bet: value1, methodID: methodId});
      onBetClick({section: section2, bet: value2, methodID: methodId});
      onAddEntry({});
    }, 50);
  };

  onSelectHandle = ({methodId, gameMethod, section, value}) => {
    const {onMethodSelect, onBetClick, allBetObj} = this.props;

    const allBetObjHasValue = _.values(allBetObj).some(
      x => x !== undefined && !_.isEmpty(x),
    );

    if (allBetObjHasValue) {
      this.dispatch({
        type: 'betCenter/updateState',
        payload: {allBetObj: {[methodId]: allBetObj[methodId]}},
      });
    }

    onMethodSelect({gameMethod, methodId});
    setTimeout(() => {
      onBetClick({section, bet: value, methodID: methodId});
    }, 50);
  };

  onSubmitSelectedBet = methodId => {
    const {onMethodSelect, onAddEntry} = this.props;
    const {gameMethod} = gameDetailsEnum[methodId];
    onMethodSelect({gameMethod, methodId});
    setTimeout(() => {
      onAddEntry({});
    }, 50);
  };

  isSubmitButtonDisabled = methodId => {
    const {allBetObj} = this.props;
    const {SBTH, EBTH, NCYG, EBTHDT} = gameDetailsEnum;

    let shouldButtonDisabled = true;

    switch (methodId) {
      case EBTHDT.methodId:
        shouldButtonDisabled =
          !allBetObj[EBTHDT.methodId] ||
          !allBetObj[EBTHDT.methodId][EBTHDT.section1] ||
          !allBetObj[EBTHDT.methodId][EBTHDT.section2] ||
          allBetObj[EBTHDT.methodId][EBTHDT.section1].length < 1 ||
          allBetObj[EBTHDT.methodId][EBTHDT.section2].length < 1;
        break;
      case NCYG.methodId:
        shouldButtonDisabled =
          !allBetObj[NCYG.methodId] ||
          !allBetObj[NCYG.methodId][NCYG.section] ||
          allBetObj[NCYG.methodId][NCYG.section].length < 1;
        break;
      case EBTH.methodId:
        shouldButtonDisabled =
          !allBetObj[EBTH.methodId] ||
          !allBetObj[EBTH.methodId][EBTH.section] ||
          allBetObj[EBTH.methodId][EBTH.section].length < 2;
        break;
      case SBTH.methodId:
        shouldButtonDisabled =
          !allBetObj[SBTH.methodId] ||
          !allBetObj[SBTH.methodId][SBTH.section] ||
          allBetObj[SBTH.methodId][SBTH.section].length < 3;
        break;

      default:
        break;
    }

    return shouldButtonDisabled;
  };

  renderFirstTableLayout = () => {
    const {availableGameMethods} = this.state;
    const {SUM, STHTX, STHDX, ETHFX, ETHDX, SLHTX, KUA} = gameDetailsEnum;
    const {values: STHDXvalues} = STHDX;
    const {values: ETHFXvalues} = ETHFX;
    const {values1: ETHDXvalues} = ETHDX;
    const {values: KUAvalues} = KUA;

    return (
      <div className={css.k3Table_container}>
        <table className={css.table}>
          <tbody>
            <tr>
              <td
                rowSpan="3"
                colSpan="2"
                className={classnames(
                  css.blueBorder,
                  css.bigFont,
                  css.leftBorder,
                  css.rightBorder,
                  css.topBorder,
                  css.bottomBorder,
                  css.topLeftRadius,
                )}>
                <button
                  type="button"
                  disabled={!availableGameMethods.includes(SUM.gameMethod)}
                  onClick={() =>
                    this.onBetHandle({...SUM, value: SUM.values.small})
                  }>
                  小
                </button>
              </td>
              {_.map(Object.keys(STHDXvalues), (item, index) => {
                const classNames = classnames(
                  css.redBorder,
                  css.topBorder,
                  css.bottomBorder,
                  {
                    [css.rightBorder]:
                      index !== Object.keys(STHDXvalues).length - 1,
                  },
                );

                return (
                  <td key={item} className={classNames}>
                    <button
                      type="button"
                      disabled={
                        !availableGameMethods.includes(STHDX.gameMethod)
                      }
                      onClick={() =>
                        this.onBetHandle({
                          ...STHDX,
                          value: STHDXvalues[item],
                        })
                      }>
                      三个{index + 1}
                    </button>
                  </td>
                );
              })}
              <td
                rowSpan="3"
                colSpan="2"
                className={classnames(
                  css.blueBorder,
                  css.bigFont,
                  css.leftBorder,
                  css.rightBorder,
                  css.topBorder,
                  css.bottomBorder,
                  css.topRightRadius,
                )}>
                <button
                  type="button"
                  disabled={!availableGameMethods.includes(SUM.gameMethod)}
                  onClick={() =>
                    this.onBetHandle({...SUM, value: SUM.values.big})
                  }>
                  大
                </button>
              </td>
            </tr>

            <tr>
              <td
                colSpan="6"
                className={classnames(css.redBorder, css.bottomBorder)}>
                <button
                  type="button"
                  disabled={!availableGameMethods.includes(STHTX.gameMethod)}
                  onClick={() =>
                    this.onBetHandle({...STHTX, value: STHTX.values.all})
                  }>
                  三同号通选
                </button>
              </td>
            </tr>

            <tr>
              {_.map(Object.keys(ETHFXvalues), (item, index) => {
                const classNames = classnames(
                  css.greenBorder,
                  css.bottomBorder,
                  {
                    [css.rightBorder]:
                      index !== Object.keys(STHDXvalues).length - 1,
                  },
                );

                return (
                  <td key={item} className={classNames}>
                    <button
                      type="button"
                      disabled={
                        !availableGameMethods.includes(ETHFX.gameMethod)
                      }
                      onClick={() =>
                        this.onBetHandle({...ETHFX, value: ETHFXvalues[item]})
                      }>
                      两对{index + 1}
                    </button>
                  </td>
                );
              })}
            </tr>

            <tr>
              <td
                rowSpan="3"
                colSpan="2"
                className={classnames(
                  css.blueBorder,
                  css.bigFont,
                  css.leftBorder,
                  css.rightBorder,
                  css.bottomBorder,
                )}>
                <button
                  type="button"
                  disabled={!availableGameMethods.includes(SUM.gameMethod)}
                  onClick={() =>
                    this.onBetHandle({
                      ...SUM,
                      value: SUM.values.single,
                    })
                  }>
                  单
                </button>
              </td>
              {_.map(Object.keys(ETHDXvalues), (item, index) => {
                const classNames = classnames(
                  css.greenBorder,
                  css.bottomBorder,
                  {
                    [css.rightBorder]:
                      index !== Object.keys(ETHDXvalues).length - 1,
                  },
                );
                const value2 =
                  index === 0 ? ETHDX.values2.two : ETHDX.values2.one;

                return (
                  <td key={item} className={classNames}>
                    <button
                      type="button"
                      disabled={
                        !availableGameMethods.includes(ETHDX.gameMethod)
                      }
                      onClick={() =>
                        this.onETHDXBetHandle({
                          ...ETHDX,
                          value1: ETHDXvalues[item],
                          value2,
                        })
                      }>
                      {ETHDXvalues[item]}
                      {value2}
                    </button>
                  </td>
                );
              })}
              <td
                rowSpan="3"
                colSpan="2"
                className={classnames(
                  css.blueBorder,
                  css.bigFont,
                  css.leftBorder,
                  css.rightBorder,
                  css.bottomBorder,
                )}>
                <button
                  type="button"
                  disabled={!availableGameMethods.includes(SUM.gameMethod)}
                  onClick={() =>
                    this.onBetHandle({
                      ...SUM,
                      value: SUM.values.double,
                    })
                  }>
                  双
                </button>
              </td>
            </tr>

            <tr>
              {_.map(Object.keys(ETHDXvalues), (item, index) => {
                const classNames = classnames(
                  css.greenBorder,
                  css.bottomBorder,
                  {
                    [css.rightBorder]:
                      index !== Object.keys(ETHDXvalues).length - 1,
                  },
                );
                const value2 =
                  index < 2 ? ETHDX.values2.three : ETHDX.values2.two;

                return (
                  <td key={item} className={classNames}>
                    <button
                      type="button"
                      disabled={
                        !availableGameMethods.includes(ETHDX.gameMethod)
                      }
                      onClick={() =>
                        this.onETHDXBetHandle({
                          ...ETHDX,
                          value1: ETHDXvalues[item],
                          value2,
                        })
                      }>
                      {ETHDXvalues[item]}
                      {value2}
                    </button>
                  </td>
                );
              })}
            </tr>

            <tr>
              {_.map(Object.keys(ETHDXvalues), (item, index) => {
                const classNames = classnames(
                  css.greenBorder,
                  css.bottomBorder,
                  {
                    [css.rightBorder]:
                      index !== Object.keys(ETHDXvalues).length - 1,
                  },
                );
                const value2 =
                  index < 3 ? ETHDX.values2.four : ETHDX.values2.three;

                return (
                  <td key={item} className={classNames}>
                    <button
                      type="button"
                      disabled={
                        !availableGameMethods.includes(ETHDX.gameMethod)
                      }
                      onClick={() =>
                        this.onETHDXBetHandle({
                          ...ETHDX,
                          value1: ETHDXvalues[item],
                          value2,
                        })
                      }>
                      {ETHDXvalues[item]}
                      {value2}
                    </button>
                  </td>
                );
              })}
            </tr>

            <tr>
              <td
                rowSpan="4"
                className={classnames(
                  css.blueBorder,
                  css.mediumFont,
                  css.leftBorder,
                  css.rightBorder,
                  css.bottomBorder,
                )}>
                <button
                  type="button"
                  disabled={!availableGameMethods.includes(SUM.gameMethod)}
                  onClick={() =>
                    this.onBetHandle({
                      ...SUM,
                      value: SUM.values.bigSingle,
                    })
                  }>
                  大单
                </button>
              </td>
              <td
                rowSpan="4"
                className={classnames(
                  css.blueBorder,
                  css.mediumFont,
                  css.rightBorder,
                  css.bottomBorder,
                )}>
                <button
                  type="button"
                  disabled={!availableGameMethods.includes(SUM.gameMethod)}
                  onClick={() =>
                    this.onBetHandle({
                      ...SUM,
                      value: SUM.values.smallSingle,
                    })
                  }>
                  小单
                </button>
              </td>
              {_.map(Object.keys(ETHDXvalues), (item, index) => {
                const classNames = classnames(
                  css.greenBorder,
                  css.bottomBorder,
                  {
                    [css.rightBorder]:
                      index !== Object.keys(ETHDXvalues).length - 1,
                  },
                );
                const value2 =
                  index < 4 ? ETHDX.values2.five : ETHDX.values2.four;

                return (
                  <td key={item} className={classNames}>
                    <button
                      type="button"
                      disabled={
                        !availableGameMethods.includes(ETHDX.gameMethod)
                      }
                      onClick={() =>
                        this.onETHDXBetHandle({
                          ...ETHDX,
                          value1: ETHDXvalues[item],
                          value2,
                        })
                      }>
                      {ETHDXvalues[item]}
                      {value2}
                    </button>
                  </td>
                );
              })}
              <td
                rowSpan="4"
                className={classnames(
                  css.blueBorder,
                  css.mediumFont,
                  css.leftBorder,
                  css.rightBorder,
                  css.bottomBorder,
                )}>
                <button
                  type="button"
                  disabled={!availableGameMethods.includes(SUM.gameMethod)}
                  onClick={() =>
                    this.onBetHandle({
                      ...SUM,
                      value: SUM.values.bigDouble,
                    })
                  }>
                  大双
                </button>
              </td>
              <td
                rowSpan="4"
                className={classnames(
                  css.blueBorder,
                  css.mediumFont,
                  css.rightBorder,
                  css.bottomBorder,
                )}>
                <button
                  type="button"
                  disabled={!availableGameMethods.includes(SUM.gameMethod)}
                  onClick={() =>
                    this.onBetHandle({
                      ...SUM,
                      value: SUM.values.smallDouble,
                    })
                  }>
                  小双
                </button>
              </td>
            </tr>

            <tr>
              {_.map(Object.keys(ETHDXvalues), (item, index) => {
                const classNames = classnames(css.greenBorder, {
                  [css.rightBorder]:
                    index !== Object.keys(ETHDXvalues).length - 1,
                });
                const value2 =
                  index < 5 ? ETHDX.values2.six : ETHDX.values2.five;

                return (
                  <td key={item} className={classNames}>
                    <button
                      type="button"
                      disabled={
                        !availableGameMethods.includes(ETHDX.gameMethod)
                      }
                      onClick={() =>
                        this.onETHDXBetHandle({
                          ...ETHDX,
                          value1: ETHDXvalues[item],
                          value2,
                        })
                      }>
                      {ETHDXvalues[item]}
                      {value2}
                    </button>
                  </td>
                );
              })}
            </tr>

            <tr>
              <td
                colSpan="6"
                className={classnames(
                  css.redBorder,
                  css.topBorder,
                  css.bottomBorder,
                )}>
                <button
                  type="button"
                  disabled={!availableGameMethods.includes(SLHTX.gameMethod)}
                  onClick={() =>
                    this.onBetHandle({...SLHTX, value: SLHTX.values.all})
                  }>
                  三连号通选
                </button>
              </td>
            </tr>

            <tr>
              <td colSpan={6}>
                <div className={css.kua}>
                  {_.map(Object.keys(KUAvalues), (item, index) => {
                    const classNames = classnames(
                      css.redBorder,
                      css.bottomBorder,
                      {
                        [css.rightBorder]:
                          index !== Object.keys(KUAvalues).length - 1,
                      },
                    );

                    return (
                      <div key={item} className={classNames}>
                        <button
                          type="button"
                          disabled={
                            !availableGameMethods.includes(KUA.gameMethod)
                          }
                          onClick={() =>
                            this.onBetHandle({
                              ...KUA,
                              value: KUAvalues[item],
                            })
                          }>
                          {KUAvalues[item]}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  renderSecondTableLayout = () => {
    const {availableGameMethods} = this.state;
    const {HZ} = gameDetailsEnum;
    const {values} = HZ;
    return (
      <div className={css.k3Table_container}>
        <table className={css.table}>
          <tbody>
            <tr>
              {_.map(Object.keys(values), (item, index) => {
                const classNames = classnames(
                  css.redBorder,
                  css.topBorder,
                  css.bottomBorder,
                  css.rightBorder,
                  css.redTable,
                  {
                    [css.leftBorder]: index === 0,
                  },
                );
                if (index < Object.keys(values).length / 2) {
                  return (
                    <td
                      key={item}
                      disabled={!availableGameMethods.includes(HZ.gameMethod)}
                      className={classNames}>
                      <button
                        type="button"
                        disabled={!availableGameMethods.includes(HZ.gameMethod)}
                        onClick={() =>
                          this.onBetHandle({...HZ, value: values[item]})
                        }>
                        {values[item]}
                      </button>
                    </td>
                  );
                }
              })}
            </tr>
            <tr>
              {_.map(Object.keys(values), (item, index) => {
                const classNames = classnames(
                  css.redBorder,
                  css.bottomBorder,
                  css.rightBorder,
                  css.redTable,
                  {
                    [css.leftBorder]: index === Object.keys(values).length / 2,
                  },
                );
                if (index >= Object.keys(values).length / 2) {
                  return (
                    <td key={item} className={classNames}>
                      <button
                        type="button"
                        disabled={!availableGameMethods.includes(HZ.gameMethod)}
                        onClick={() =>
                          this.onBetHandle({...HZ, value: values[item]})
                        }>
                        {values[item]}
                      </button>
                    </td>
                  );
                }
              })}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  renderThirdTableLayout = () => {
    const {availableGameMethods} = this.state;
    const {SBTH, EBTH, NCYG, EBTHDT} = gameDetailsEnum;
    const {values: EBTHvalues} = EBTH;
    const {values: SBTHvalues} = SBTH;
    const {values: NCYGvalues} = NCYG;
    const {values1: EBTHDTvalues1, values2: EBTHDTvalues2} = EBTHDT;
    const {allBetObj} = this.props;

    return (
      <div className={css.k3Table_container}>
        <table className={css.table}>
          <tbody>
            <tr>
              <td
                colSpan="2"
                className={classnames(css.whiteBorder, css.bottomBorder)}>
                三不同号
              </td>
              {_.map(Object.keys(SBTHvalues), (item, index) => {
                const classNames = classnames(
                  css.yellowBorder,
                  css.topBorder,
                  css.bottomBorder,
                  css.rightBorder,
                );

                return (
                  <td
                    key={item}
                    className={classNames}
                    data-active={
                      allBetObj[SBTH.methodId] &&
                      allBetObj[SBTH.methodId][SBTH.section] &&
                      allBetObj[SBTH.methodId][SBTH.section].includes(
                        SBTHvalues[item],
                      )
                    }>
                    <button
                      type="button"
                      disabled={!availableGameMethods.includes(SBTH.gameMethod)}
                      onClick={() =>
                        this.onSelectHandle({...SBTH, value: SBTHvalues[item]})
                      }>
                      {SBTHvalues[item]}
                    </button>
                  </td>
                );
              })}
              <td
                className={classnames(
                  css.yellowBorder,
                  css.topBorder,
                  css.bottomBorder,
                  css.rightBorder,
                )}
                style={{width: '82px'}}
                data-disabled={this.isSubmitButtonDisabled(SBTH.methodId)}>
                <button
                  type="button"
                  disabled={
                    !availableGameMethods.includes(SBTH.gameMethod) ||
                    this.isSubmitButtonDisabled(SBTH.methodId)
                  }
                  onClick={() => this.onSubmitSelectedBet(SBTH.methodId)}>
                  投注
                </button>
              </td>
            </tr>

            <tr>
              <td
                colSpan="2"
                className={classnames(css.whiteBorder, css.bottomBorder)}>
                二不同号
              </td>
              {_.map(Object.keys(EBTHvalues), item => {
                const classNames = classnames(
                  css.yellowBorder,
                  css.bottomBorder,
                  css.rightBorder,
                );

                return (
                  <td
                    key={item}
                    className={classNames}
                    data-active={
                      allBetObj[EBTH.methodId] &&
                      allBetObj[EBTH.methodId][EBTH.section] &&
                      allBetObj[EBTH.methodId][EBTH.section].includes(
                        EBTHvalues[item],
                      )
                    }>
                    <button
                      type="button"
                      disabled={!availableGameMethods.includes(EBTH.gameMethod)}
                      onClick={() =>
                        this.onSelectHandle({...EBTH, value: EBTHvalues[item]})
                      }>
                      {EBTHvalues[item]}
                    </button>
                  </td>
                );
              })}
              <td
                className={classnames(
                  css.yellowBorder,
                  css.bottomBorder,
                  css.rightBorder,
                )}
                data-disabled={this.isSubmitButtonDisabled(EBTH.methodId)}>
                <button
                  type="button"
                  disabled={
                    !availableGameMethods.includes(EBTH.gameMethod) ||
                    this.isSubmitButtonDisabled(EBTH.methodId)
                  }
                  onClick={() => this.onSubmitSelectedBet(EBTH.methodId)}>
                  投注
                </button>
              </td>
            </tr>

            <tr>
              <td
                colSpan="2"
                className={classnames(css.whiteBorder, css.bottomBorder)}>
                猜一个号
              </td>
              {_.map(Object.keys(NCYGvalues), item => {
                const classNames = classnames(
                  css.yellowBorder,
                  css.bottomBorder,
                  css.rightBorder,
                );

                return (
                  <td
                    key={item}
                    className={classNames}
                    data-active={
                      allBetObj[NCYG.methodId] &&
                      allBetObj[NCYG.methodId][NCYG.section] &&
                      allBetObj[NCYG.methodId][NCYG.section].includes(
                        NCYGvalues[item],
                      )
                    }>
                    <button
                      type="button"
                      disabled={!availableGameMethods.includes(NCYG.gameMethod)}
                      onClick={() =>
                        this.onSelectHandle({
                          ...NCYG,
                          value: NCYGvalues[item],
                        })
                      }>
                      {NCYGvalues[item]}
                    </button>
                  </td>
                );
              })}
              <td
                className={classnames(
                  css.yellowBorder,
                  css.bottomBorder,
                  css.rightBorder,
                )}
                data-disabled={this.isSubmitButtonDisabled(NCYG.methodId)}>
                <button
                  type="button"
                  disabled={
                    !availableGameMethods.includes(NCYG.gameMethod) ||
                    this.isSubmitButtonDisabled(NCYG.methodId)
                  }
                  onClick={() => this.onSubmitSelectedBet(NCYG.methodId)}>
                  投注
                </button>
              </td>
            </tr>

            <tr>
              <td
                rowSpan="2"
                className={classnames(
                  css.whiteBorder,
                  css.rightBorder,
                  css.bottomLeftRadius,
                )}
                style={{width: '150px'}}>
                二不同号胆拖
              </td>
              <td
                className={classnames(css.whiteBorder, css.bottomBorder)}
                style={{width: '93px'}}>
                胆码
              </td>
              {_.map(Object.keys(EBTHDTvalues1), item => {
                const classNames = classnames(
                  css.yellowBorder,
                  css.bottomBorder,
                  css.rightBorder,
                );

                return (
                  <td
                    key={item}
                    className={classNames}
                    data-active={
                      allBetObj[EBTHDT.methodId] &&
                      allBetObj[EBTHDT.methodId][EBTHDT.section1] &&
                      allBetObj[EBTHDT.methodId][EBTHDT.section1].includes(
                        EBTHDTvalues1[item],
                      )
                    }>
                    <button
                      type="button"
                      disabled={
                        !availableGameMethods.includes(EBTHDT.gameMethod)
                      }
                      onClick={() =>
                        this.onSelectHandle({
                          ...EBTHDT,
                          section: EBTHDT.section1,
                          value: EBTHDTvalues1[item],
                        })
                      }>
                      {EBTHDTvalues1[item]}
                    </button>
                  </td>
                );
              })}
              <td
                rowSpan={2}
                className={classnames(
                  css.yellowBorder,
                  css.bottomBorder,
                  css.rightBorder,
                  css.bottomRightRadius,
                  css.EBTHDT_submitColumn,
                )}
                data-disabled={this.isSubmitButtonDisabled(EBTHDT.methodId)}>
                <button
                  type="button"
                  style={{borderBottomRightRadius: '12px'}}
                  disabled={
                    !availableGameMethods.includes(EBTHDT.gameMethod) ||
                    this.isSubmitButtonDisabled(EBTHDT.methodId)
                  }
                  onClick={() => this.onSubmitSelectedBet(EBTHDT.methodId)}>
                  投注
                </button>
              </td>
            </tr>

            <tr>
              <td className={css.whiteBorder}>拖码</td>
              {_.map(Object.keys(EBTHDTvalues2), item => {
                const classNames = classnames(
                  css.yellowBorder,
                  css.bottomBorder,
                  css.rightBorder,
                );

                return (
                  <td
                    key={item}
                    className={classNames}
                    data-active={
                      allBetObj[EBTHDT.methodId] &&
                      allBetObj[EBTHDT.methodId][EBTHDT.section2] &&
                      allBetObj[EBTHDT.methodId][EBTHDT.section2].includes(
                        EBTHDTvalues2[item],
                      )
                    }>
                    <button
                      type="button"
                      disabled={
                        !availableGameMethods.includes(EBTHDT.gameMethod)
                      }
                      onClick={() =>
                        this.onSelectHandle({
                          ...EBTHDT,
                          section: EBTHDT.section2,
                          value: EBTHDTvalues2[item],
                        })
                      }>
                      {EBTHDTvalues2[item]}
                    </button>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  render() {
    return (
      <div>
        {this.renderFirstTableLayout()}
        {this.renderSecondTableLayout()}
        {this.renderThirdTableLayout()}
      </div>
    );
  }
}

export default GameTableK3;
