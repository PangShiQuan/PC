import React, {PureComponent} from 'react';
import {connect} from 'dva';
import classnames from 'classnames';

import css from 'styles/homepage/Base/winnerList1.less';
import homeCss from 'styles/homepage/Base/homepageBody1.less';
import {addCommas} from 'utils';

function truncate(username = '用户') {
  let name = username;
  if (username.length > 3) {
    name = `${username.substr(0, 3)}***`;
    return name;
  }
  return name;
}

class WinnerList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isEven: false,
    };
    this.winnerListEnd = null;
    this.dispatch = props.dispatch;
  }
  componentWillMount() {
    this.dispatch({type: 'gameInfosModel/getTopWinners'});
  }
  componentWillReceiveProps(nextProps) {
    this.setEvenOdd(nextProps);
  }
  setEvenOdd({winnerList}) {
    let isEven = false;
    if (winnerList && winnerList.length % 2 === 0) {
      isEven = true;
    }
    this.setState({isEven});
  }
  static renderBody(list) {
    return list.map((listItem, index) => {
      const {username, winningAmount, gameNameInChinese} = listItem;
      return (
        <div className={css.winnerList_tbodyRow} key={`${username}${index}`}>
          <div className={css.winnerList_td}>{truncate(username)}</div>
          <div className={css.winnerList_td}>
            {`${addCommas(winningAmount)}元`}
          </div>
          <div className={css.winnerList_td}>{gameNameInChinese}</div>
        </div>
      );
    });
  }
  render() {
    const {winnerList} = this.props;
    const Winners = winnerList && WinnerList.renderBody(winnerList);
    return (
      <div className={classnames(homeCss.homePage_panel, css.winnerList)}>
        <h2
          className={classnames(
            homeCss.homePage_panelHeader,
            css.winnerList_header,
          )}>
          <i>中奖排行榜</i>
        </h2>
        <div className={css.winnerList_thead}>
          <div className={css.winnerList_theadRow}>
            <div className={css.winnerList_td}>用户名</div>
            <div className={css.winnerList_td}>奖金</div>
            <div className={css.winnerList_td}>彩种</div>
          </div>
        </div>
        <div className={css.winnderList_table}>
          <div className={css.winnerList_tbody}>
            <div className={css.winnerList_coverUpList}>{Winners}</div>
            <div
              className={css.winnerList_repeatedList}
              data-even={this.state.isEven}>
              {Winners}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
function mapStatesToProps({gameInfosModel}) {
  return {
    winnerList: gameInfosModel.winnerList,
  };
}

export default connect(mapStatesToProps)(WinnerList);
