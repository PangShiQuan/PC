import React, {Component} from 'react';
import {connect} from 'dva';
import {Row, message} from 'antd';
import {Redirect, routerRedux, withRouter} from 'dva/router';
import {isEqual} from 'lodash';
import ExternalPage from 'pages/External';
import {FrameContainer, Img} from 'components/General';
import {flattenPlatforms} from 'utils';
import {PLATFORM, PLATFORM_TYPE} from 'utils/type.config';
import {checkUrl} from 'utils/url';
import css from 'styles/sports/index.less';
import * as images from './images';

const PATH = '/sports';
const ON = 'ON';
const platformStatus = {
  IMONE: 'old',
  IMSPORT: 'new',
  SS: 'old',
  SSSPORT: 'new',
};
class SportsComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      platforms: [],
    };
    this.dispatch = props.dispatch;
  }

  componentWillMount() {
    this.onGetURLParam(this.props);
    this.updatePlatformList(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const {
      gamePlatforms,
      match: {params},
      MODE,
    } = nextProps;
    const gamePlatformsChanges = !isEqual(
      this.props.gamePlatforms,
      gamePlatforms,
    );
    if (
      (this.props.match.params.sportId !== params.sportId ||
        gamePlatformsChanges) &&
      MODE !== params.sportId
    ) {
      this.clear();

      if (gamePlatformsChanges || params.sportId) this.onGetURLParam(nextProps);
      if (gamePlatformsChanges) this.updatePlatformList(nextProps);
    }
  }

  componentWillUnmount() {
    this.clear();
  }

  onGetURLParam(props) {
    const {
      match: {
        params: {sportId},
      },
      gamePlatformList,
      MODE,
    } = props;

    let sportGame = {};
    if (
      gamePlatformList[sportId || MODE] &&
      gamePlatformList[sportId || MODE].platforms
    ) {
      const sportGames = flattenPlatforms(
        gamePlatformList[sportId || MODE].platforms,
      );
      sportGame = sportGames.find(
        x =>
          x.platform === PLATFORM.SPORT &&
          x.gamePlatformType !== PLATFORM_TYPE.HIDE,
      );
    }

    const {gameNameInChinese, gamePlatform, status} = sportGame;

    if (status) {
      if (status === ON) {
        this.dispatch({
          type: 'sportModel/updateState',
          payload: {MODE: gamePlatform},
        });
        this.dispatch({
          type: 'sportModel/postSportsUrlFrame',
        });
      } else {
        this.dispatch(routerRedux.push({pathname: PATH}));
        message.info(`你所选择的${gameNameInChinese}已关闭`, 3);
      }
    }
  }

  onGameSelect = ({currentTarget}) => {
    this.dispatch(
      routerRedux.push({pathname: `${PATH}/${currentTarget.value}`}),
    );
  };

  clear() {
    this.dispatch({
      type: 'sportModel/initializeAll',
    });
  }

  updatePlatformList(props) {
    const platforms = [];

    props.gamePlatforms.forEach(vendor => {
      if (vendor.platforms) {
        const sportGame = vendor.platforms.find(
          x =>
            x.platform === PLATFORM.SPORT &&
            x.gamePlatformType !== PLATFORM_TYPE.HIDE,
        );

        if (sportGame) platforms.push(sportGame);
      }
    });

    this.setState({platforms});
  }

  renderSportsFrame() {
    const {currentUrl, MODE} = this.props;
    if (!currentUrl) return null;
    const url = checkUrl(currentUrl);
    return (
      <FrameContainer title={MODE} url={url} className={css.sports_tabIframe} />
    );
  }

  render() {
    const {
      match: {
        params: {sportId},
      },
    } = this.props;
    const {platforms} = this.state;
    let content = null;
    if (!sportId) {
      const platformGames = platforms.map(({desc, gamePlatform, status}) => {
        let gameStatusInChinese;
        switch (platformStatus[gamePlatform]) {
          case 'new':
            gameStatusInChinese = '新';
            break;
          case 'old':
            gameStatusInChinese = '旧';
            break;
          default:
            gameStatusInChinese = '';
        }
        return (
          <button
            type="button"
            disabled={status !== ON}
            key={gamePlatform}
            onClick={this.onGameSelect}
            className={css.sportButton}
            data-status={platformStatus[gamePlatform]}
            value={gamePlatform}>
            <span className={css.statusText}>{gameStatusInChinese}</span>
            <Img className={css.navImg} src={images[gamePlatform]} />
          </button>
        );
      });
      content = (
        <React.Fragment>
          <div className={css.sports_item_up}>
            <div className={css.arrow_up} />
          </div>
          <div className={css.sports_rowFull_items}>{platformGames}</div>
          <div className={css.sports_item_down}>
            <div className={css.arrow_down} />
          </div>
        </React.Fragment>
      );
    } else if (
      platforms.length &&
      !platforms.find(
        ({gamePlatform, status}) => gamePlatform === sportId && status === ON,
      )
    ) {
      return (
        <Redirect
          to={{
            pathname: PATH,
          }}
        />
      );
    } else if (sportId) {
      content = (
        <div className={css.sports_body}>
          <Row className={css.sports_tabContainerIframe}>
            {this.renderSportsFrame()}
          </Row>
        </div>
      );
    }

    return (
      <div className={sportId ? css.sports : css.sports_fixHeight}>
        <div
          className={sportId ? css.sports_rowFull_inGame : css.sports_rowFull}>
          {content}
        </div>
      </div>
    );
  }
}

function mapStatesToProps({sportModel, playerModel}) {
  const {gamePlatformList} = playerModel;

  return {
    gamePlatformList,
    ...sportModel,
  };
}

const component = connect(mapStatesToProps)(SportsComponent);

function Sport(props) {
  return <ExternalPage component={component} componentProps={props} />;
}

export default withRouter(Sport);
