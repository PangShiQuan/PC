import React, {Component} from 'react';
import classnames from 'classnames';

import css from 'styles/trends/chart.less';
import {calculate, TREND_CHART_CONFIG} from 'utils';

const {NUM_DISTRIBUTION, SPAN_DISTRIBUTION} = TREND_CHART_CONFIG;

class Chart extends Component {
  static getLabel(labels, targetIndex) {
    const labelObj = labels[targetIndex] || labels;
    const label = labelObj.nums || labelObj;

    return {label, labelObj};
  }
  static getRef(ref, props) {
    const {
      resultSetting: {nums: base},
    } = props;
    let targets = [ref];
    let labels = [base];

    if (ref.group) {
      const {group} = ref;
      targets = Object.keys(group);
      labels = Object.values(group);
    }

    return {targets, labels};
  }
  constructor(props) {
    super(props);
    this.item = [];
  }
  componentDidMount() {
    window.onresize = () => {
      this.clear();
      this.restore();
    };
  }
  componentDidUpdate(prevProps, prevState) {
    const {trend, issueGap} = this.props;

    // maintain this order else canvas line incorrect
    this.renderAllMissing(!issueGap);
    if (trend) this.restore();
    else this.clear();
  }
  getCanvasWidth() {
    const container = this.canvasContainer;
    // all the child of the container except canvas itself will be used to calculate the width of canvas
    const childCount =
      container.childElementCount - 1 - this.props.method.trends.length;

    return (container.lastElementChild.clientWidth - 1) * childCount;
  }
  // canvas绘制
  draw(canvas, targetStr) {
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.strokeStyle = '#5891db';
    const {item} = this;
    for (let i = 0; ; i++) {
      let x = 0;
      let y = 0;
      const ele = item[`${targetStr}-${i}`];
      if (!ele) break;
      x = ele.offsetLeft + ele.clientWidth / 2;
      y = ele.offsetTop + ele.clientHeight / 2;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    ctx.closePath();
  }
  // 清除画线
  clear() {
    const {canvas} = this;
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  // 画线
  restore() {
    const {canvas, canvasContainer: container} = this;
    if ((canvas, container)) {
      const {
        method: {units},
      } = this.props;
      canvas.width = this.getCanvasWidth();
      canvas.height = container.offsetHeight;
      units.forEach(unit => {
        this.draw(canvas, unit);
      });
    }
  }

  // issueGapBar
  drawMissingBar(targetStr, key) {
    const {issueGapBar, openCodes} = this.props;

    // unset all
    for (let lineKey = 0; lineKey < openCodes.length; lineKey++) {
      const str = `${targetStr}-${key}-${lineKey}`;
      const ele = this.item[str];
      ele.style.backgroundColor = '';
      ele.style.zIndex = '';
    }

    for (let lineKey = openCodes.length - 1; lineKey >= 0; lineKey--) {
      const str = `${targetStr}-${key}-${lineKey}`;
      const ele = this.item[str];
      if (!ele || (ele.childNodes[0] && ele.childNodes[0].nodeName === 'SPAN'))
        break;
      else {
        const color = key % 2 === 0 ? '#6fe6fb' : '#fef8ac';
        ele.style.backgroundColor = issueGapBar ? color : null;
        ele.style.zIndex = '-1';
      }
    }
  }
  // 单列遗漏
  renderMissings(label, key, clear) {
    const {issueGap, openCodes} = this.props;
    let num = 1;
    let times = 0;
    let max = 0;
    let seq = 0;
    let maxSeq = 0;

    for (let lineKey = 0; lineKey < openCodes.length; lineKey++) {
      const str = `${label}-${key}-${lineKey}`;
      const ele = this.item[str];
      if (!ele) break;
      const child = ele.childNodes;

      if (child.length) {
        [...child].forEach(childNode => {
          if (childNode.nodeType === Node.TEXT_NODE) childNode.remove();
        });
      }

      if (issueGap && !child.length) {
        ele.textContent = num;
        max = max > num ? max : num;
        num++;
        seq = 0;
      } else {
        num = 1;
        times++;
        seq++;
        maxSeq = maxSeq > seq ? maxSeq : seq;
      }
      const average =
        times === 0 ? 0 : Math.floor((openCodes.length - times) / times);
      const dict = [times, average, max, maxSeq];
      dict.forEach((item, statKey) => {
        const eleMissing = this.item[`M${label}-${key}-${statKey}`];
        eleMissing.textContent = clear ? '' : item;
      });
    }
  }
  // table遗漏
  renderIssueGap(ref, clear) {
    const {targets, labels} = Chart.getRef(ref, this.props);

    for (let j = 0; j < targets.length; j++) {
      const {label} = Chart.getLabel(labels, j);

      for (let i = 0; i < label.length; i++) {
        this.renderMissings(targets[j], label[i], clear);
        this.drawMissingBar(targets[j], label[i], clear);
      }
    }
  }
  // 渲染遗漏
  renderAllMissing(clear) {
    const {
      method: {trends, units},
    } = this.props;

    units.forEach(unit => {
      this.renderIssueGap(unit, clear);
    });

    trends.forEach((trend, value) => {
      this.renderIssueGap(trend, clear);
    });
  }
  // 渲染一行
  renderTableRow(lineData, lineKey, target, label) {
    const {
      method: {units},
      subline,
      resultSetting:{isXPK}
    } = this.props;
    const targetStr = units[target] || target;
    const nums = label.nums || label;
    const childStyle = {backgroundColor: label.color || null};
    const className = subline
      ? classnames(css.chartLine, css.subline)
      : css.chartLine;
    let showNum = lineData[target];

    if (showNum === undefined) {
      if (target === SPAN_DISTRIBUTION) showNum = calculate.span(lineData);
      else if (target === NUM_DISTRIBUTION) {
        const openCount = {};
        lineData.forEach(val => {
          const showVal = isXPK ? this.getPKnum(val):val;
          openCount[showVal] = 1 + (openCount[showVal] || 0);
        });
        showNum = openCount;
      } else {
        // 单位组合配对
        showNum = lineData.filter(data => nums.includes(data));
      }
    }
    const nodes = nums.map(key => {
      const refStr = `${targetStr}-${lineKey}`;
      const itemRef = `${targetStr}-${key}-${lineKey}`;
      const nodeProp = {};
      const resultNum = isXPK ? key :parseInt(key);
      let match = false;
      if (target === NUM_DISTRIBUTION) {
        if (showNum[resultNum]) {
          nodeProp['data-count'] = showNum[resultNum];
          nodeProp.className = css.showNum__count;
          match = true;
        }
      } else if (
        resultNum === showNum || (Array.isArray(showNum) && showNum.includes(resultNum))
      ) {
        match = true;
      }

      let node = null;

      if (match) {
        node = (
          <span
            className={css.showNum}
            ref={ref => {
              this.item[refStr] = ref;
            }}
            style={childStyle}
            {...nodeProp}>
            {resultNum}
          </span>
        );
      }
      return (
        <span
          className={css.missingitem}
          ref={ref => {
            this.item[itemRef] = ref;
          }}
          key={key}>
          {node}
        </span>
      );
    });
    return (
      <div key={lineKey} className={className}>
        {nodes}
      </div>
    );
  }

  // 幸运扑克转变
  getPKnum (nums) {
    let PKnum;
    const showNum = nums.toString().slice(1,3);
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
  // 渲染遗漏行item
  renderMissingTableLineItems(target, label, lineKey) {
    const {
      method: {units},
    } = this.props;
    const targetStr = units[target] || target;
    const nodes = label.map(key => {
      const refStr = `M${targetStr}-${key}-${lineKey}`;
      return (
        <span
          className={css.missingheaditem}
          ref={ref => {
            this.item[refStr] = ref;
          }}
          key={key}
        />
      );
    });
    return nodes;
  }
  // 遗漏走势行
  renderMissingTableLine(target, label) {
    const {statistics} = this.props;
    const lines = statistics.map((text, index) => (
      <div className={css.statistics} key={index}>
        {this.renderMissingTableLineItems(target, label, index)}
      </div>
    ));
    return <div>{lines}</div>;
  }
  // 渲染走势头行
  renderTableHeadline(target, label, reverse) {
    const {
      method: {units},
    } = this.props;
    const title = typeof target === 'number' ? units[target] : target;
    const nodes = label.map((num, index) => (
      <span className={css.headitem} key={index}>
        {num}
      </span>
    ));
    return (
      <div className={reverse ? css.chartHeaderReverse : css.chartHeader}>
        <span className={css.digit}>{title}</span>
        <div className={css.unit}>{nodes}</div>
      </div>
    );
  }

  // 整个图表
  renderTableLines(ref) {
    const {openCodes} = this.props;
    const {targets, labels} = Chart.getRef(ref, this.props);

    return targets.map((target, targetIndex) => {
      const {label, labelObj} = Chart.getLabel(labels, targetIndex);
      const nodes = openCodes.map((item, lineKey) =>
        this.renderTableRow(item, lineKey, target, labelObj),
      );

      return (
        <div className={css.table} key={`table-${target}`}>
          {this.renderTableHeadline(target, label)}
          <div>{nodes}</div>
          {this.renderMissingTableLine(target, label)}
          {this.renderTableHeadline(target, label, true)}
        </div>
      );
    });
  }

  renderTrend() {
    const {
      method: {trends},
    } = this.props;

    return trends.map((trend, value) => this.renderTableLines(trend));
  }

  // 渲染每位图表
  renderTables() {
    const {
      method: {units},
    } = this.props;

    return units.map((_, index) => this.renderTableLines(index));
  }
  render() {
    return (
      /* 禁止增加任何新的 HTML Element 元素进 canvasContainer */
      <section
        className={css.dataCols}
        ref={ref => {
          this.canvasContainer = ref;
        }}
        style={{flex: this.props.colSpan}}>
        <canvas
          ref={ref => {
            this.canvas = ref;
          }}
          className={css.canvas}
        />
        {this.renderTables()}
        {this.renderTrend()}
      </section>
    );
  }
}

export default Chart;
