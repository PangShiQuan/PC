import React, {Component} from 'react';
import _ from 'lodash';
import classNames from 'classnames';
import icons from 'styles/iconfont.less';
import css from 'styles/general/pokerCard.less';

class PokerCard extends Component {
  constructor() {
    super();
    this.state = {
      size: 1,
    };
  }
  componentWillReceiveProps(nextProps) {
    this.setState({size: nextProps.size});
  }
  renderSymbol(symbolCode) {
    if (symbolCode) {
      return (
        <span
          className={classNames(
            css.pokerCard_symbol,
            icons[`POKER_NUM_${symbolCode}`],
          )}
        />
      );
    }
    return (
      <span className={css.pokerCard_symbols}>
        <span
          className={classNames(css.pokerCard_symbol, icons.POKER_NUM_100)}
        />
        <span
          className={classNames(css.pokerCard_symbol, icons.POKER_NUM_200)}
          data-color="red"
        />
        <span
          className={classNames(css.pokerCard_symbol, icons.POKER_NUM_300)}
        />
        <span
          className={classNames(css.pokerCard_symbol, icons.POKER_NUM_400)}
          data-color="red"
        />
      </span>
    );
  }
  renderNum(numCode) {
    if (numCode) {
      return (
        <span
          className={classNames(
            css.pokerCard_num,
            icons[`POKER_NUM_${numCode}`],
          )}
        />
      );
    }
    return null;
  }
  renderMethodText() {
    const {methodText} = this.props;
    if (methodText) {
      return <span className={css.pokerCard_method}>{methodText}</span>;
    }
    return null;
  }
  render() {
    const {pokerCode, color, backgroundColor, size} = this.props;
    const height = `${size * 3}rem`;
    const width = `${size * 2.25}rem`;
    if (pokerCode && pokerCode.length) {
      return (
        <span className={css.pokerCards} key={pokerCode}>
          {_.map(pokerCode, (code, index) => {
            const symbolCode = _.floor(code, -2);
            const numCode = code - symbolCode;
            return (
              <span
                key={`${code}__${index}`}
                style={{
                  color,
                  backgroundColor,
                  fontSize: `${size}rem`,
                  height,
                  width,
                }}
                className={css.pokerCard}
                data-symbol={`${symbolCode}`}>
                {this.renderMethodText()}
                {this.renderNum(numCode)}
                {this.renderSymbol(symbolCode)}
              </span>
            );
          })}
        </span>
      );
    }
    return null;
  }
}

export default PokerCard;
