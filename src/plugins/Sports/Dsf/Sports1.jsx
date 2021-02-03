import React, {Component} from 'react';
import {connect} from 'dva';
import {Row, message} from 'antd';
import {Redirect, routerRedux, withRouter} from 'dva/router';
import {isEqual} from 'lodash';
import ExternalPage from 'pages/External';
import {Card, FrameContainer} from 'components/General';
import {flattenPlatforms} from 'utils';
import {PLATFORM, PLATFORM_TYPE} from 'utils/type.config';
import {checkUrl} from 'utils/url';
import css from 'styles/sports/index.less';
import * as images from './images';

const PATH = '/sports';
const ON = 'ON';

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
      const platformGames = platforms.map(
        ({desc, gameNameInChinese, gamePlatform, status}) => (
          <Card
            disabled={status !== ON}
            key={gamePlatform}
            onClick={this.onGameSelect}
            image={images[gamePlatform]}
            imageIcon={images.ImageIcon[gamePlatform]}
            overlayStyle={{
              backgroundImage: `url('${images[gamePlatform]}')`,
            }}
            title={gameNameInChinese}
            desc={desc}
            disableContent="暂未开放，敬请期待"
            value={gamePlatform}
          />
        ),
      );
      content = (
        <React.Fragment>
          <div className={css.sports_wording} />
          <div className={css.sports_items}>{platformGames}</div>
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
      <div className={css.sports}>
        <div className={sportId ? css.sports_row_inGame : css.sports_row}>
          {content}
        </div>
        {!sportId && (
          <React.Fragment>
            <div className={css.sports_banner} data-x="left" />
            <div className={css.sports_banner} data-x="right" />
          </React.Fragment>
        )}
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
