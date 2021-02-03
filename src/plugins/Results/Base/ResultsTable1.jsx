import React, {Component} from 'react';
import {isEmpty, map} from 'lodash';
import {connect} from 'dva';
import {Link} from 'dva/router';
import moment from 'moment';
import {Spin} from 'antd';

import BetPage from 'pages/Bet';
import css from 'styles/results/resultsTable.less';
import lotteryCss from 'styles/general/Base/lotteryBalls1.less';
import {EllipsisLoader, MDIcon, LotteryBalls} from 'components/General';
import {getGameSetup, hasTrendChart, isDisabledGame} from 'utils';

class ResultsTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      gamesInfo: {},
    };
    this.dispatch = props.dispatch;
    this.timer = null;
  }

  componentWillMount() {
    if (this.props.gameInfos) this.refresh(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.gameInfos !== nextProps.gameInfos) {
      this.refresh(nextProps);
    }
  }

  shouldComponentUpdate(nextProps) {
    return !(this.props.gameInfos !== nextProps.gameInfos);
  }

  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  onBetClick = ({gameUniqueId, category}) => {
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {thisGameId: gameUniqueId, expandedCategory: category},
    });
  };

  getAllResults = () => {
    clearTimeout(this.timer);
    this.dispatch({type: 'gameInfosModel/getAllResults'});
    this.timer = setTimeout(() => {
      this.getAllResults();
    }, 20000);
  };

  refresh(props) {
    this.getAllResults();
    this.updateGamesInfo(props);
  }

  updateGamesInfo(props) {
    const gamesInfo = {};

    props.gameInfos.forEach(gameInfo => {
      gamesInfo[gameInfo.gameUniqueId] = gameInfo;
    });
    this.setState({
      gamesInfo,
    });
  }

  renderTableBody() {
    const {
      allGamesPrizeSettings,
      allResults,
      awaitingResponse,
      gameInfos,
    } = this.props;
    const {gamesInfo} = this.state;

    if (allResults && allResults.length && !isEmpty(gamesInfo)) {
      return map(allResults, item => {
        const {
          gameUniqueId,
          uniqueIssueNumber,
          openCode,
          openTime,
          gameNameInChinese,
          currentTimeEpoch,
        } = item;
        const selectedResult = getGameSetup({gameUniqueId});
        if (!selectedResult) return null;
        const {category} = selectedResult;
        const thisGameInfo = gamesInfo[gameUniqueId];
        const lotteryBallsProps = {
          currentTimeEpoch,
          diceSize: '1.5rem',
          gameId: gameUniqueId,
          numsClassName: lotteryCss.lottery,
          numsDividerClassName: css.lotteryBallDivider,
          openCode,
          pokerSize: 0.75,
        };
        const betBtn = !isDisabledGame(thisGameInfo, {
          allGamesPrizeSettings,
        }) ? (
          <Link
            onClick={() => this.onBetClick({gameUniqueId, category})}
            to="/betcenter"
            className={css.betBtn}>
            投注
          </Link>
        ) : null;
        return (
          <tr key={`${gameUniqueId}__${uniqueIssueNumber}`}>
            <td className={css.gameNameInChinese}>{gameNameInChinese}</td>
            <td className={css.uniqueIssueNumber}>第{uniqueIssueNumber}期</td>
            <td className={css.openTime}>{moment(openTime).format('YYYY-MM-DD HH:mm:ss')}</td>
            {(openCode && (
              <td>
                <LotteryBalls {...lotteryBallsProps} />
              </td>
            )) || (
              <td>
                正在开奖 <EllipsisLoader duration={3000} />
              </td>
            )}
            <td className={css.issueCountPerDay}>
              {selectedResult.issueCountPerDay === ''
                ? '-'
                : `${selectedResult.issueCountPerDay} 期`}
            </td>
            <td className={css.issueDuration}>
              {selectedResult.issueDuration === ''
                ? '-'
                : selectedResult.issueDuration}
            </td>
            <td>
              <Link className={css.infoBtn} to={`/result/${gameUniqueId}`}>
                <MDIcon iconName="file-document-box" />
              </Link>
            </td>
            <td>
              <Link
                target="trendPage"
                disabled={!hasTrendChart(gameUniqueId, [thisGameInfo])}
                to={`/trends/${gameUniqueId}`}
                className={css.predictBtn}>
                <MDIcon iconName="chart-areaspline" />
              </Link>
            </td>
            <td>{betBtn}</td>
          </tr>
        );
      });
    }
    return (
      <tr>
        <td colSpan="9">
          <div className={css.container}>
            {!gameInfos.length || awaitingResponse ? (
              <Spin size="large" tip="正在加载开奖公告..." />
            ) : (
              <p>暂无数据</p>
            )}
          </div>
        </td>
      </tr>
    );
  }

  render() {
    return (
      <table className={css.table}>
        <thead>
          <tr>
            <th style={{width: '10%'}}>彩种</th>
            <th style={{width: '10%'}}>期号</th>
            <th style={{width: '15%'}}>开奖时间</th>
            <th style={{width: '40%'}}>开奖号码</th>
            <th style={{width: '10%'}}>期数/每天</th>
            <th style={{width: '10%'}}>开奖频率</th>
            <th style={{width: '2%'}}>详情</th>
            <th style={{width: '2%'}}>走势</th>
            <th style={{width: '2%'}}>购彩</th>
          </tr>
        </thead>
        <tbody>{this.renderTableBody()}</tbody>
      </table>
    );
  }
}

function mapStatesToProp({gameInfosModel}) {
  const {awaitingResponse, allResults, gameInfos} = gameInfosModel;
  return {awaitingResponse, allResults, gameInfos};
}

const component = connect(mapStatesToProp)(ResultsTable);

export default function Index(props) {
  return <BetPage component={component} componentProps={props} />;
}
