import React, {Component} from 'react';
import {connect} from 'dva';
import {BackTop} from 'antd';
import css from 'styles/instruction/instruction.less';
import {LoadingBar, MDIcon} from 'components/General/';
import {
  ACTIVE_STATUS,
  categoriesRefs as CATEGORY_REFS,
} from 'utils/type.config';

const failMsg = '正在完善中...';
const loadingMsg = '正在加载页面...';

class InstructionBody extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // iframe 高度
      height: '100%',
      expandCategory: null,
    };
    this.dispatch = props.dispatch;
  }

  componentDidMount() {
    this.dispatch({type: 'instructionsModel/getInstruction'});
    // 监听iframe内容高度
    window.addEventListener('message', this.setContentHeight, false);
  }

  componentWillReceiveProps({gameInfos, selectedGame}) {
    const {gameInfos: prevGameInfos} = this.props;
    if (gameInfos.length > 0 && prevGameInfos !== gameInfos) {
      this.dispatch({type: 'instructionsModel/getInstruction'});
    }

    const selectedGameInfo = gameInfos.find(
      game => game.gameUniqueId === selectedGame,
    );

    const {expandCategory} = this.state;
    if (selectedGameInfo && expandCategory !== selectedGameInfo.category) {
      this.setState({
        expandCategory: selectedGameInfo.category,
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.setContentHeight);
  }

  onGameClick = ({currentTarget}) => {
    const {selectedGame} = this.props;
    const current = currentTarget;
    const gameid =
      (current.dataset && current.dataset.gameid) ||
      current.getAttribute('data-gameid');

    if (selectedGame !== gameid) {
      this.dispatch({
        type: 'instructionsModel/updateState',
        payload: {selectedGame: gameid},
      });
      this.dispatch({type: 'instructionsModel/getInstruction'});
      this.setContentHeight();
    }
  };

  setContentHeight = (event = {data: {height: '100%'}}) => {
    const {
      data: {height},
    } = event;
    if (height) this.setState({height});
  };

  onContentLoad = () => {
    this.dispatch({
      type: 'instructionsModel/initializeState',
      payload: ['isLoading'],
    });
  };

  renderSideNav() {
    const {gameInfos} = this.props;
    const {expandCategory} = this.state;
    const categories = new Set(gameInfos.map(game => game.category));
    const categoryNodes = [];

    categories.forEach((category, index) => {
      const node = (
        <li key={category} key={index}>
          <button
            type="button"
            className={css.sideNavBtn}
            onClick={() =>
              this.setState(prevState => ({
                expandCategory:
                  prevState.expandCategory === category ? null : category,
              }))
            }>
            <span>{CATEGORY_REFS[category]}</span>
            <MDIcon
              iconName="chevron-down"
              className={
                expandCategory === category ? css.faceDown : css.faceRight
              }
              data-active={expandCategory === category}
            />
          </button>
          <div
            className={css.sideNavSub}
            data-active={expandCategory === category}>
            {this.renderSideSubNav(category)}
          </div>
        </li>
      );

      categoryNodes.push(node);
    });

    return (
      <aside className={css.sideNav}>
        <div className={css.sideNavHeader}>
          <div>全部彩票</div>
          <MDIcon iconName="view-grid" />
        </div>
        <ul>{categoryNodes}</ul>
      </aside>
    );
  }

  renderSideSubNav(category) {
    const {gameInfos, selectedGame} = this.props;
    const games = gameInfos.filter(
      game =>
        game.category === category && game.gameUniqueId !== 'UNRECOGNIZED',
    );
    const gameNodes = [];

    games.forEach(item => {
      const {gameNameInChinese, gameUniqueId} = item;

      const node = (
        <button
          key={gameUniqueId}
          type="button"
          className={css.sideNavSubBtn}
          onClick={this.onGameClick}
          data-gameid={gameUniqueId}
          data-active={gameUniqueId === selectedGame}
          disabled={item.status === ACTIVE_STATUS ? null : true}>
          {gameNameInChinese}
        </button>
      );

      gameNodes.push(node);
    });

    return <React.Fragment>{gameNodes}</React.Fragment>;
  }

  renderInstruction() {
    const {isLoading, selectedGame, src} = this.props;
    const {height} = this.state;
    const placeholder =
      src && isLoading ? <dd className={css.fail}>{loadingMsg}</dd> : null;
    if (!selectedGame) {
      return <dl className={css.content}>{placeholder}</dl>;
    }

    return (
      <dl className={css.content}>
        {src && !isLoading ? (
          <dd className={css.embed} id="top" style={{height}}>
            <iframe
              title="玩法说明"
              src={src}
              scrolling="no"
              allowFullScreen
              referrerPolicy="origin-when-cross-origin"
              sandbox="allow-scripts"
              onLoad={this.onContentLoad}
            />
          </dd>
        ) : (
          <span className={css.fail}>{isLoading ? loadingMsg : failMsg}</span>
        )}
      </dl>
    );
  }

  render() {
    const {isLoading} = this.props;

    return (
      <div className={css.instructions}>
        <div className={css.container}>
          <LoadingBar isLoading={isLoading} className={css.loading} />
          <div className={css.body}>
            {this.renderSideNav()}
            {this.renderInstruction()}
            <BackTop className={css.backToTop}>
              <div className={css.inner}>
                <MDIcon iconName="arrow-up-drop-circle-outline" size="18px" />
                <span className="highlight">回到顶部</span>
              </div>
            </BackTop>
          </div>
        </div>
      </div>
    );
  }
}

const mapStatesToProps = ({gameInfosModel, instructionsModel}) => ({
  gameInfos: gameInfosModel.gameInfos || [],
  ...instructionsModel,
});

export default connect(mapStatesToProps)(InstructionBody);
