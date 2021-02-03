import React, {Component} from 'react';
import {keys, map} from 'lodash';
import {LoadingBar} from 'components/General';
import resolve from 'clientResolver';

const css = resolve.client('styles/betCenter/GameNav.less');

class GameNav extends Component {
  constructor(props) {
    super(props);
    this.isLoading = false;
  }

  componentWillReceiveProps(nextProps) {
    const {gameNav} = nextProps;
    const gameNavKeys = keys(gameNav);
    this.isLoading = gameNavKeys.length < 1;
  }

  renderNav = () => {
    const {displayTableLayout} = this.props;

    if (displayTableLayout) {
      return this.renderCasinoNav();
    }

    return this.renderClassicNav();
  };

  renderCasinoNav = () => {
    return (
      <button
        type="button"
        className={css.gameNav_btn}
        data-active="true"
        disabled>
        综合
      </button>
    );
  };

  renderClassicNav = () => {
    const {methodGroup, gameNav} = this.props;
    return map(gameNav, (gameSubNav, methodGroupName) => {
      const btnActive = methodGroupName === methodGroup;
      const noMethods = gameSubNav.length < 1;
      const onClick = () =>
        this.props.onNavSelect({gameSubNav, methodGroup: methodGroupName});
      return (
        <button
          type="button"
          onClick={onClick}
          key={methodGroupName}
          className={css.gameNav_btn}
          data-active={btnActive}
          disabled={btnActive || noMethods}>
          {methodGroupName}
        </button>
      );
    });
  };

  render() {
    return (
      <div className={css.gameNav}>
        <LoadingBar isLoading={this.isLoading} />
        <div className={css.gameNav_btns}>{this.renderNav()}</div>
      </div>
    );
  }
}

export default GameNav;
