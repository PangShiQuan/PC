import React, {PureComponent} from 'react';
import {connect} from 'dva';
import classnames from 'classnames';
import {Checkbox} from 'antd';
import scrollIntoView from 'scroll-into-view';

import Chart from './Chart';
import Result from './Result';
import {LoadingBar} from 'components/General';
import css from 'styles/trends/chart.less';
import {gameResult, TREND_CHART_CONFIG} from 'utils';
import xPkSpade from 'assets/image/trendPK/spade.svg';
import xPkHeart from 'assets/image/trendPK/heart.svg';
import xPkClub from 'assets/image/trendPK/club.svg';
import xPkDiamond from 'assets/image/trendPK/diamond.svg';

const {DEFAULT_METHOD, DEFAULT_RESULT_CATEGORY} = TREND_CHART_CONFIG;

const DEFAULT_SELECTION = {
  method: DEFAULT_METHOD,
  resultData: [],
  resultDataSlice: [],
  resultSetting: DEFAULT_RESULT_CATEGORY,
  selectedMethod: '',
};
const OPTIONS = {
  subline: '辅助线',
  issueGap: '遗漏',
  issueGapBar: '遗漏条',
  trend: '走势',
};
const OPTION_LIST = Object.keys(OPTIONS);
const IS_WITHIN_RANGE = true;

class Index extends PureComponent {
  static defaultProps = {
    periods: [30, 50, 100],
    missingLines: ['出现总次数', '平均遗漏值', '最大遗漏值', '最大连出值'],
  };

  static getNumRange(state, props) {
    const {method, resultSetting, selectedMethod} = state;
    return method && method.slice
      ? Index.toggleFill(
          state.resultData[0],
          gameResult.getIndexRange(resultSetting.units, selectedMethod),
        )
      : Index.toggleFill(state.resultData[0]);
  }

  static sliceData(data, numRange) {
    const firstNumIndex = numRange.indexOf(IS_WITHIN_RANGE);
    const lastNumIndex = numRange.lastIndexOf(IS_WITHIN_RANGE) + 1;

    return data.map(({openCode}) =>
      openCode.slice(firstNumIndex, lastNumIndex),
    );
  }

  static toggleFill({openCode}, {end, start} = {}) {
    const count = openCode.length;
    const toggles = Array(count).fill(false);

    if (end) {
      return start === null
        ? toggles.fill(true, end)
        : toggles.fill(true, start, end + 1);
    }

    return Array(count).fill(true);
  }

  constructor(props) {
    super(props);
    this.state = {
      barShow: true,
      subline: true,
      issueGap: true,
      issueGapBar: true,
      trend: true,
      thisGameInfo: {},
      ...DEFAULT_SELECTION,
    };
    this.dispatch = props.dispatch;
    this.handleBarShowClick = this.handleBarShowClick.bind(this);
    this.handleButtonClick = this.handleButtonClick.bind(this);
    this.handleOptionClick = this.handleOptionClick.bind(this);
    this.handlePeriodClick = this.handlePeriodClick.bind(this);
  }

  componentWillMount() {
    const {
      match: {
        params: {gameUniqueId},
      },
    } = this.props;

    this.dispatch({
      type: 'gameInfosModel/getContents',
    });
    this.dispatch({
      type: 'trendModel/updateState',
      payload: {gameUniqueId},
    });
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.gameUniqueId !== nextProps.gameUniqueId) {
      this.selectGame(nextProps);
    }
    if (this.props.resultData !== nextProps.resultData) {
      this.updateMethod(this.state.selectedMethod, nextProps);
    }
    if (this.props.gameInfos !== nextProps.gameInfos && nextProps.gameInfos) {
      const thisGameInfo = nextProps.gameInfos.find(
        ({gameUniqueId}) => gameUniqueId === nextProps.gameUniqueId,
      );
      this.setState(
        {
          thisGameInfo,
        },
        this.setupGame,
      );
      document.title = thisGameInfo.gameNameInChinese;
    }
  }

  setupGame(props = this.props) {
    const {
      thisGameInfo: {category},
    } = this.state;

    if (category) {
      const resultSetting = gameResult.getGameResultConfig(
        props.gameUniqueId,
        category,
      );

      this.setState({...DEFAULT_SELECTION, resultSetting}, () => {
        this.updateMethod(resultSetting.names[0], props);
      });
    }
  }

  updateMethod(selectedMethod, props) {
    const {
      method: prevMethod,
      resultSetting: {openCode: openCodeFn = {}, units},
      selectedMethod: prevSelectedMethod,
      thisGameInfo: {category},
    } = this.state;

    if (category) {
      const method =
        prevSelectedMethod === selectedMethod
          ? prevMethod
          : gameResult.getGameMethods(
              props.gameUniqueId,
              selectedMethod,
              category,
            );
      const newState = {
        method,
        selectedMethod,
      };

      if (props.resultData.length) {
        const hasOpenCodeValue = typeof openCodeFn.value === 'function';
        const hasOpenCodeView = typeof openCodeFn.view === 'function';

        newState.resultData = props.resultData.map(
          ({openCode, ...dataProp}) => {
            const code = openCode.split(',').map(num => parseInt(num));
            const newData = dataProp;

            if (hasOpenCodeValue) newData.openCode = [openCodeFn.value(code)];
            else newData.openCode = code;
            if (hasOpenCodeView) newData.openCodeView = openCodeFn.view(code);

            return newData;
          },
        );

        method.numRange = Index.getNumRange(
          {...this.state, ...newState},
          props,
        );
        method.units = units.slice(
          method.numRange.indexOf(IS_WITHIN_RANGE),
          method.numRange.lastIndexOf(IS_WITHIN_RANGE) + 1,
        );

        if (method.slice) {
          newState.resultDataSlice = Index.sliceData(
            newState.resultData,
            method.numRange,
          );
        } else {
          newState.resultDataSlice = newState.resultData.map(
            ({openCode}) => openCode,
          );
        }
      }

      const prevLen = this.state.resultDataSlice.length;
      this.setState(newState, () => {
        // scroll to latest data
        if (prevLen !== this.state.resultDataSlice.length) {
          scrollIntoView(this.pageEnd, {
            time: 750,
            // easeInSine
            ease: easeValue =>
              1 + Math.sin((Math.PI / 2) * easeValue - Math.PI / 2),
            align: {
              bottom: 0.02,
            },
          });
        }
      });
    }
  }

  selectGame(props) {
    this.dispatch({
      type: 'trendModel/initializeState',
      payload: ['resultData'],
    });
    this.dispatch({type: 'trendModel/getHistoryList'});
    this.setupGame(props);
  }

  handleButtonClick(e) {
    const selectedMethod = e.target.getAttribute('data-method');

    this.updateMethod(selectedMethod, this.props);
  }

  // 隐藏功能区
  handleBarShowClick() {
    this.setState({barShow: !this.state.barShow});
  }

  handlePeriodClick(e) {
    const limit = parseInt(e.target.dataset.limit);
    this.dispatch({type: 'trendModel/updateState', payload: {limit}});
    this.dispatch({type: 'trendModel/getHistoryList'});
  }

  handleOptionClick({target}) {
    this.setState({[target.value]: target.checked});
  }

  // 左侧line
  renderPlanAndOpenCode() {
    const {missingLines} = this.props;
    const {
      method: {numRange},
      resultData,
      resultSetting: {nums,isXPK},
      subline,
    } = this.state;
    const elClass = subline
      ? classnames(css.regionStartLine, css.subline)
      : css.regionStartLine;
    const nodes = resultData.map((item, index) => {
      const {openCode, openCodeView, planNo} = item;
      const resultNums = (openCodeView || openCode).map((num, innerIndex) => (
        <span
          className={css.titles}
          style={{color: openCodeView || numRange[innerIndex] ? 'red' : ''}}
          key={innerIndex}>
          {isXPK ? this.showRenderPk(num):num}
        </span>
      ));
      return (
        <div className={elClass} key={index}>
          <span className={css.issue}>
            {planNo.toString().padStart(3, '0')}
          </span>
          <span className={css.openCode}>{resultNums}</span>
        </div>
      );
    });
    const lines = nums.length
      ? missingLines.map((text, index) => (
          <div className={css.regionStartLine} key={index}>
            <span className={css.issue}>{text}</span>
            <span className={css.blankitem} />
          </div>
        ))
      : null;
    return (
      <section>
        <div className={css.regionStartHeadline}>
          <span className={css.issue}>期号</span>
          <span className={css.openCode}>开奖号码</span>
        </div>
        <div>{nodes}</div>
        <div>{lines}</div>
        <div className={css.regionStartHeadline}>
          <span className={css.issue}>期号</span>
          <span className={css.openCode}>开奖号码</span>
        </div>
      </section>
    );
  }

  // 新幸运扑克render
  showRenderPk (num) {
   const value = num.toString();
   const imgNum = value.slice(0,1);
   const showValue = this.getPKnum(value);
   let imgRender;
   switch (imgNum) {
     case '1':
       imgRender =  <img src={xPkSpade} className={css.pkIcon}/>;
       break;
     case '2':
       imgRender =  <img src={xPkHeart} className={css.pkIcon}/>;
       break;
     case '3':
       imgRender =  <img src={xPkClub} className={css.pkIcon}/>;
       break;
     default:
       imgRender =  <img src={xPkDiamond} className={css.pkIcon}/>;
   }
  return <span>{imgRender}{showValue}</span>;
  }


  getPKnum (nums) {
    let PKnum;
    const showNum = nums.slice(1,3);
    const PkNumber = {
      "01": "A",
      "02": "2",
      "03": "3",
      "04": "4",
      "05": "5",
      "06": "6",
      "07": "7",
      "08": "8",
      "09": "9",
      "10": "10",
      "11": "J",
      "12": "Q",
      "13": "K"
    };
    PKnum = PkNumber[showNum];
    return PKnum;
  }

  // 按钮
  renderButtons() {
    const {
      resultSetting: {names},
      selectedMethod,
    } = this.state;
    const nodes = names.map(resultType => (
      <button
        type="button"
        className={css.button}
        key={resultType}
        data-selected={selectedMethod === resultType}
        data-method={resultType}
        onClick={this.handleButtonClick}>
        {resultType}
      </button>
    ));
    return <div className={css.methods}>{nodes}</div>;
  }

  renderOptions() {
    const nodes = OPTION_LIST.map((option, index) => (
      <Checkbox
        key={option}
        className={css.option}
        defaultChecked
        checked={this.state[option]}
        onChange={this.handleOptionClick}
        value={option}>
        {OPTIONS[option]}
      </Checkbox>
    ));
    return <div className={css.selection}>{nodes}</div>;
  }

  renderPeriods() {
    const {periods, limit} = this.props;
    const nodes = periods.map((num, index) => (
      <button
        type="button"
        className={css.period}
        key={num}
        data-limit={num}
        data-selected={limit === num}
        onClick={this.handlePeriodClick}>
        最近{num}期
      </button>
    ));
    return <div className={css.selection}>{nodes}</div>;
  }

  render() {
    const {awaitingResponse, gameUniqueId, missingLines} = this.props;
    const {
      barShow,
      method,
      selectedMethod,
      resultData,
      resultDataSlice,
      resultSetting,
      subline,
      ...props
    } = this.state;
    let colSpan = 1;

    if (!resultSetting.units.length) {
      if (method.trends.length) colSpan = 0.45;
      else colSpan = 0;
    } else if (method.resultsFn.length > 0) {
      colSpan = 0.675;
    }

    const statistics = resultSetting.nums.length ? missingLines : [];
    const chartProps = {
      ...props,
      colSpan,
      method,
      openCodes: resultDataSlice,
      resultData,
      resultSetting,
      statistics,
      subline,
    };
    const resultProps = {
      ...method,
      colSpan: 1 - colSpan,
      gameUniqueId,
      openCodes: resultDataSlice,
      resultData,
      statistics,
      subline,
    };

    return (
      <React.Fragment>
        <div className={css.title}>历史号码走势</div>
        <div className={css.bar}>
          {this.renderButtons()}
          <button
            type="button"
            className={css.button}
            onClick={this.handleBarShowClick}>
            {barShow ? '隐藏' : '显示'}功能区
          </button>
        </div>
        <div className={css.bar} data-display={barShow}>
          {this.renderOptions()}
          {this.renderPeriods()}
        </div>
        <LoadingBar isLoading={awaitingResponse} className={css.loading} />
        <div className={css.page}>
          <div className={css.trend}>
            {this.renderPlanAndOpenCode()}
            <Chart {...chartProps} />
            <Result {...resultProps} />
          </div>
          <div
            ref={ref => {
              this.pageEnd = ref;
            }}
          />
        </div>
      </React.Fragment>
    );
  }
}

function mapStatesToProps({gameInfosModel, trendModel}) {
  return {...trendModel, gameInfos: gameInfosModel.gameInfos};
}
export default connect(mapStatesToProps)(Index);
