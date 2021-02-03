import React, {PureComponent} from 'react';
import css from 'styles/betCenter/BetEntrance.less';

class CardItem extends PureComponent {
  render() {
    const {
      gameIconUrl,
      gameNameInChinese,
      gameDescription,
      gameUniqueId,
    } = this.props.item;

    return (
      <li key={gameUniqueId} className={css.betEntrace_listItem}>
        <span
          className={css.betEntrace_listItemAvatar}
          style={{backgroundImage: `url('${gameIconUrl}')`}}
        />
        <div className={css.betEntrace_listItemContent}>
          <strong className={css.betEntrace_listItemDesc}>
            {gameNameInChinese}
          </strong>
          <small className={css.betEntrace_listItemDesc}>
            {gameDescription}
          </small>
          {this.props.children}
        </div>
      </li>
    );
  }
}
export default CardItem;
