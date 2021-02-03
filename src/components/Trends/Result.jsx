import React, {PureComponent} from 'react';
import classnames from 'classnames';
import {isMap} from 'lodash';

import css from 'styles/trends/chart.less';
import {is} from 'utils/calculation';
import produce from 'utils/gameResult';

class Result extends PureComponent {
  static genChild(resultFn, item, innerIndex) {
    if (Array.isArray(resultFn.group) && isMap(item)) {
      const categoryKey = resultFn.group.map(({key}) => key);
      return categoryKey.map((key, index) => (
        <span
          key={index}
          className={css.group_item}
          {...Result.genProp(resultFn, item)}>
          {item.get(key).join(' ')}
        </span>
      ));
    }
    return (
      <span key={innerIndex} {...Result.genProp(resultFn, item)}>
        {item}
      </span>
    );
  }
  static genHeader(fnName, resultFn, reverseHeader) {
    if (Array.isArray(resultFn.group)) {
      const groupNodes = resultFn.group.map(({key, label}) => (
        <span key={key} className={css.group_item}>
          {label}
        </span>
      ));
      const parentNode = (
        <span className={css.group_parent} key={1}>
          {fnName}
        </span>
      );
      const childNode = (
        <div className={css.group_child} key={2}>
          {groupNodes}
        </div>
      );
      const nodes = reverseHeader
        ? [childNode, parentNode]
        : [parentNode, childNode];

      return (
        <div
          className={classnames(
            css.regionStartHeadline,
            css.openCode,
            css.group,
          )}>
          {nodes}
        </div>
      );
    }
    return (
      <span className={classnames(css.regionStartHeadline, css.openCode)}>
        {fnName}
      </span>
    );
  }
  static genProp(resultFn, item) {
    const {colorCodeFn} = resultFn;
    const prop = {};

    if (colorCodeFn) {
      prop.className = css.splitCode;
      prop['data-color'] = colorCodeFn(item);
    }

    return prop;
  }
  renderResultView([fnName, resultFn]) {
    if (!resultFn.fn) return null;
    const {post, statistics, openCodes, resultData, subline} = this.props;
    const renderPostView = post.includes(fnName);
    const color = renderPostView ? '#aaa' : '';
    const processedData = produce(
      {resultData, openCodes},
      resultFn.fn,
      renderPostView,
    );
    const elClass = classnames(
      css.results,
      css.regionStartLine,
      subline ? css.subline : null,
    );
    const nodes = processedData.map((data, index) => {
      const dat = Array.isArray(data) ? data : [data];
      const textNodes = dat.map((item, innerIndex) =>
        Result.genChild(resultFn, item, innerIndex),
      );

      return (
        <div
          className={classnames(elClass, css.openCode)}
          style={{color: (data === is.MATCH_SYMBOL && color) || ''}}
          key={index}>
          {textNodes}
        </div>
      );
    });
    const lines = statistics.map((text, index) => (
      <span
        className={classnames(css.regionStartLine, css.blankitem)}
        key={index}
      />
    ));

    return (
      <div className={css.regionAddItem} key={fnName}>
        {Result.genHeader(fnName, resultFn)}
        <div>{nodes}</div>
        <div>{lines}</div>
        {Result.genHeader(fnName, resultFn, true)}
      </div>
    );
  }
  render() {
    const {colSpan, resultsFn} = this.props;

    if (!resultsFn.length) return null;

    return (
      <section className={css.gameResult} style={{flex: colSpan}}>
        {resultsFn.map(resultFn => this.renderResultView(resultFn))}
      </section>
    );
  }
}

export default Result;
