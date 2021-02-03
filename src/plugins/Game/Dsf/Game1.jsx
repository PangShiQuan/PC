import React, {Component} from 'react';
import {connect} from 'dva';
import {Modal, Row, Col, message} from 'antd';
import {Link, routerRedux, withRouter} from 'dva/router';
import ExternalPage from 'pages/External';
import css from 'styles/Game/index1.less';
import {flattenPlatforms} from 'utils';
import {PLATFORM, PLATFORM_TYPE} from 'utils/type.config';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import classnames from 'classnames';
import SVG from 'react-inlinesvg';
import leftArrowIcn from 'assets/image/cardGameListing/gameTabArrow/icn_left_arrow.svg';
import rightArrowIcn from 'assets/image/cardGameListing/gameTabArrow/icn_right_arrow.svg';
import GameCatalogue from './GameCatalogue1';

const ON = 'ON';

class GameIndex extends Component {
  static isEnabledGame(vendor) {
    if (vendor.platforms) {
      return vendor.platforms.some(
        x =>
          x.platform === PLATFORM.GAME &&
          x.gamePlatformType === PLATFORM_TYPE.THIRD_PARTY &&
          x.status === ON,
      );
    }
    const {gamePlatformType, platform, status} = vendor;
    return (
      platform === PLATFORM.GAME &&
      gamePlatformType === PLATFORM_TYPE.THIRD_PARTY &&
      status === ON
    );
  }

  constructor(props) {
    super(props);
    this.slider = React.createRef();
    this.state = {
      numOfGameVendor: null,
    };
    this.dispatch = props.dispatch;
  }

  componentWillMount() {
    const platforms = GameIndex.getAvailablePlatforms(this.props);
    this.setState({numOfGameVendor: platforms.length});

    if (platforms.length) {
      this.onPathnameChange(this.props, platforms);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      match: {
        params: {gameId},
      },
    } = nextProps;

    const {numOfGameVendor} = this.state;
    const nextAvailablePlatforms = GameIndex.getAvailablePlatforms(nextProps);

    if (
      gameId !== this.props.match.params.gameId ||
      numOfGameVendor !== nextAvailablePlatforms.length
    ) {
      this.onPathnameChange(nextProps, nextAvailablePlatforms);
      this.setState({numOfGameVendor: nextAvailablePlatforms.length});
    }
  }

  componentWillUnmount() {
    this.clear();
  }

  onPathnameChange(props, availablePlatforms) {
    const {
      gamePlatformList,
      match: {params},
    } = props;
    let displacePrevSelection = false;
    const {gameId} = params;

    if (availablePlatforms.length) {
      if (gameId && !GameIndex.isEnabledGame(gamePlatformList[gameId] || {})) {
        displacePrevSelection = true;
      }
    }

    if (displacePrevSelection) {
      const {gameNameInChinese} = gamePlatformList[params.gameId] || {};
      const msg = gameNameInChinese
        ? `${gameNameInChinese}已关闭`
        : `${params.gameId}不存在`;

      message.info(`你所选择的${msg}, 将自动跳转至默认游戏`, 3);
    }

    if (!availablePlatforms.length) {
      this.dispatch(routerRedux.replace({pathname: '/games'}));
    } else {
      this.selectGame(gameId || '');
    }
  }

  onGameClick = ({isDemo, gameId, name, gamePlatform}) => {
    const {gamePlatformList} = this.props;
    const gameBalance = gamePlatformList[gamePlatform].balance;
    const {itransEnabled} = gamePlatformList[gamePlatform];
    this.dispatch({
      type: 'gameModel/updateState',
      payload: {
        isDemo,
        gameId,
        gameName: name,
        MODE: gamePlatform,
      },
    });

    if (gameBalance > 0 || isDemo) {
      this.dispatch({type: 'gameModel/postGameLoginUrl'});
    } else if (itransEnabled === 'ON') {
      this.dispatch({type: 'gameModel/postGameLoginUrl'});
    } else {
      Modal.info({
        title: '余额不足',
        content: <span>尊敬的用户，进入游戏前必须确保账号内存有余额。</span>,
        onOk: () => {
          this.dispatch({
            type: 'layoutModel/updateState',
            payload: {
              profileSelectedNav: 'transferCtrl',
            },
          });
          this.dispatch(
            routerRedux.push({
              pathname: `/user`,
            }),
          );
        },
      });
    }
  };

  onGameCategorySelect(gameId) {
    this.clear();
    this.dispatch({
      type: 'gameModel/updateState',
      payload: {
        MODE: gameId,
      },
    });
    this.dispatch({
      type: gameId
        ? 'gameModel/getFullGameListAndCategory'
        : 'gameModel/getAllGameListByCategory',
    });
    if (gameId) {
      this.dispatch({
        type: 'playerModel/getBalanceOfGamePlatform',
        payload: {
          gamePlatform: gameId,
        },
      });
    }
  }

  static getAvailablePlatforms({gamePlatforms}) {
    return flattenPlatforms(gamePlatforms).filter(GameIndex.isEnabledGame);
  }

  clear() {
    this.dispatch({
      type: 'gameModel/initializeAll',
    });
  }

  selectGame(gameId, autoSet) {
    this.dispatch({
      type: 'gameModel/updateState',
      payload: {
        MODE: gameId,
      },
    });
    this.onGameCategorySelect(gameId);

    if (autoSet)
      this.dispatch(routerRedux.replace({pathname: `/games/${gameId}`}));
  }

  renderGameTabContent() {
    const {
      currentPage,
      gameCategoryId,
      gameList,
      gameListandCategoryFull,
      gameListCount,
      listIsLoading,
      pageSize,
      searchTerm,
    } = this.props;
    const catalogueProps = {
      currentPage,
      dispatch: this.dispatch,
      gameCategoryId,
      gameList,
      gameListandCategoryFull,
      gameListCount,
      isLoading: listIsLoading,
      searchTerm,
      onGameClick: this.onGameClick,
      pageSize,
    };

    return <GameCatalogue {...catalogueProps} />;
  }

  renderGameTab() {
    const {
      dispatchUpdate,
      gamePlatforms,
      match: {
        params: {gameId},
      },
      MODE,
    } = this.props;

    let countGameTabs = 0;
    let activeTabIndex = 0;

    const gameTabItem = flattenPlatforms(gamePlatforms).map(
      ({gamePlatform, gamePlatformType, platform, status}) => {
        if (
          platform === PLATFORM.GAME &&
          gamePlatformType === PLATFORM_TYPE.THIRD_PARTY
        ) {
          const disabled = status !== ON;
          countGameTabs++;

          if (gamePlatform === gameId) activeTabIndex = countGameTabs;

          return (
            <Col
              key={`${gamePlatform}top`}
              className={css.game_buttonTabOuter}
              data-active={gamePlatform === MODE}
              disabled={disabled}
              data-content="暂未开放，敬请期待">
              <Link
                key={`${gamePlatform}top`}
                value={gamePlatform}
                className={css.game_buttonTab}
                data-game={gamePlatform}
                onClick={dispatchUpdate}
                to={`/games/${gamePlatform}`}
                disabled={disabled}
              />
            </Col>
          );
        }

        return null;
      },
    );

    countGameTabs++;
    gameTabItem.unshift(
      <Col
        key="ALL"
        className={css.game_buttonTabOuter}
        data-active={!MODE}
        data-content="暂未开放，敬请期待">
        <Link
          value="ALL"
          className={css.game_buttonTab}
          data-active={!MODE}
          data-game="ALL"
          onClick={dispatchUpdate}
          to="/games/"
        />
      </Col>,
    );

    const NextArrow = props => {
      const {className, style, onClick} = props;
      return (
        <button
          type="button"
          className={classnames(
            className,
            css.gameTabNextButton,
            className.includes('slick-disabled') ? css.disableButton : '',
          )}
          style={{...style}}
          onClick={onClick}>
          <SVG
            src={rightArrowIcn}
            className={classnames(css.rightArrowIcn, css.icon__svg)}
          />
        </button>
      );
    };

    const PrevArrow = props => {
      const {className, style, onClick} = props;
      return (
        <button
          type="button"
          className={classnames(
            className,
            css.gameTabPrevButton,
            className.includes('slick-disabled') ? css.disableButton : '',
          )}
          style={{...style}}
          onClick={onClick}>
          <SVG
            src={leftArrowIcn}
            className={classnames(css.leftArrowIcn, css.icon__svg)}
          />
        </button>
      );
    };

    if (countGameTabs > 5) {
      const gameTabSliderSetting = {
        className: css.gameTabSliderSetting,
        draggable: false,
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 5,
        slidesToScroll: 1,
        nextArrow: <NextArrow />,
        prevArrow: <PrevArrow />,
        initialSlide:
          activeTabIndex > countGameTabs - 5
            ? countGameTabs - 5
            : activeTabIndex,
      };

      if (this.slider.current) {
        this.slider.current.slickGoTo(
          activeTabIndex > countGameTabs - 5
            ? countGameTabs - 5
            : activeTabIndex,
        );
      }

      return (
        <Row className={classnames(css.game_buttonTabGroup, css.sliderWrapper)}>
          <Slider ref={this.slider} {...gameTabSliderSetting}>
            {gameTabItem}
          </Slider>
        </Row>
      );
    }

    return <Row className={css.game_buttonTabGroup}>{gameTabItem}</Row>;
  }

  render() {
    return (
      <div className={css.game}>
        <div className={css.game_outer}>
          <div className={css.game_topWord} />
          {this.renderGameTab()}
          <Row className={css.game_body}>{this.renderGameTabContent()}</Row>
        </div>
      </div>
    );
  }
}

function mapStatesToProps({gameModel, playerModel}) {
  const {gamePlatformList} = playerModel;
  return {
    gamePlatformList,
    ...gameModel,
  };
}

const component = connect(mapStatesToProps)(GameIndex);

function Game(props) {
  return <ExternalPage component={component} componentProps={props} />;
}

export default withRouter(Game);
