import React, {Component} from 'react';
import {map, split} from 'lodash';
import resolve from 'clientResolver';

const css =resolve.client('styles/betCenter/GameNav.less');

class GameSubNav extends Component {
  renderSubnav() {
    const {gameSubNav} = this.props;
    return map(gameSubNav, method => {
      const {methodId, gameMethod} = method;
      if (gameMethod) {
        const nameArray = split(method.gameMethod, '-');
        const displayName = nameArray[1] || nameArray[0];
        const buttonActive =
          gameMethod === this.props.gameMethod &&
          methodId === this.props.methodId;
        const onClick = () => this.props.onMethodSelect(method);
        return (
          <button
            key={gameMethod}
            className={css.gameSubnav_btn}
            onClick={onClick}
            data-active={buttonActive}>
            {displayName}
          </button>
        );
      }
      return null;
    });
  }
  render() {
    return <div className={css.gameSubnavs}>{this.renderSubnav()}</div>;
  }
}

export default GameSubNav;
