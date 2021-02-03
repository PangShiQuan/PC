import React, {Component} from 'react';
import {connect} from 'dva';
import {Row, message} from 'antd';
import {Redirect, routerRedux, withRouter} from 'dva/router';
import {isEqual, isEmpty} from 'lodash';
import classnames from 'classnames';
import ExternalPage from 'pages/External';
import {Card, FrameContainer} from 'components/General';
import {PLATFORM, PLATFORM_TYPE} from 'utils/type.config';
import css from 'styles/realis/index.less';
import {checkUrl} from 'utils/url';
import {flattenPlatforms} from 'utils';

const PATH = '/realis';
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
    const {
      gamePlatforms,
      match: {params},
    } = this.props;
    if (gamePlatforms.length > 1 && params.realisId) {
      this.onGetURLParam(this.props);
    }

    this.updatePlatformList(this.props);
  }

  componentWillReceiveProps(nextProps) {
    const {
      gamePlatforms,
      match: {params},
      MODE,
      currentUrl,
      shouldOpenNewTab,
    } = nextProps;
    const gamePlatformsChanges = !isEqual(
      this.props.gamePlatforms,
      gamePlatforms,
    );

    if (
      (this.props.match.params.realisId !== params.realisId ||
        gamePlatformsChanges) &&
      MODE !== params.realisId
    ) {
      this.clear();

      // gamePlatforms length > 1, means gamePlatforms have more than bet platform
      if (gamePlatforms.length > 1 && params.realisId) {
        this.onGetURLParam(nextProps);
      }

      if (gamePlatformsChanges) this.updatePlatformList(nextProps);
    }

    if (shouldOpenNewTab && currentUrl) {
      this.dispatch(routerRedux.push({pathname: PATH}));
    }
  }

  clear = () => {
    this.dispatch({
      type: 'realiModel/initializeAll',
    });
  };

  updatePlatformList(props) {
    const realiGames = flattenPlatforms(props.gamePlatforms).filter(
      x =>
        x.platform === PLATFORM.REALI &&
        x.gamePlatformType !== PLATFORM_TYPE.HIDE,
    );
    this.setState({platforms: realiGames});
  }

  renderSportsFrame(props) {
    const {currentUrl, MODE} = this.props;
    if (!currentUrl) return null;
    const url = checkUrl(currentUrl);
    return (
      <FrameContainer title={MODE} url={url} className={css.realis_tabIframe} />
    );
  }

  goAgGame() {
    const urlPATH = '/realis/AG';
    this.dispatch(routerRedux.push({pathname: urlPATH}));
  }

  goBGGame() {
    const urlPATH = '/realis/BG';
    this.dispatch(routerRedux.push({pathname: urlPATH}));
  }

  goBBINGame() {
    const urlPATH = '/realis/BBIN';
    this.dispatch(routerRedux.push({pathname: urlPATH}));
  }

  onGetURLParam(props) {
    const {
      match: {
        params: {realisId},
      },
      gamePlatformList,
      gamePlatforms,
      MODE,
    } = props;

    const selectedGame =
      gamePlatformList[realisId && realisId.toUpperCase()] ||
      gamePlatformList[MODE] ||
      {};

    const {gameNameInChinese, gamePlatform, status} = selectedGame;

    if (selectedGame && status) {
      if (status === ON) {
        this.dispatch({
          type: 'realiModel/updateState',
          payload: {MODE: gamePlatform},
        });
        this.dispatch({
          type: 'realiModel/postSportsUrlFrame',
        });
      } else {
        this.dispatch(routerRedux.push({pathname: PATH}));
        message.info(`你所选择的${gameNameInChinese}已关闭`, 3);
      }
    } else if (isEmpty(selectedGame) && gamePlatforms.length > 1 && realisId) {
      this.dispatch(routerRedux.push({pathname: PATH}));
    }
  }

  render() {
    const {
      match: {
        params: {realisId},
      },
      shouldOpenNewTab,
    } = this.props;
    const {platforms} = this.state;

    let content = null;

    if (realisId && !shouldOpenNewTab) {
      content = (
        <div className={css.realis_body}>
          <Row className={css.realis_tabContainerIframe}>
            {this.renderSportsFrame()}
          </Row>
        </div>
      );
    } else {
      content = (
        <div className={css.realGameButtonWrapper}>
          {platforms.some(x => x.gamePlatform === 'AG') && (
            <button
              type="button"
              className={classnames(css.realGameButton, css.ag_wording)}
              onClick={this.goAgGame.bind(this)}
            />
          )}

          {platforms.some(x => x.gamePlatform === 'BG') && (
            <button
              type="button"
              className={classnames(css.realGameButton, css.bg_wording)}
              onClick={this.goBGGame.bind(this)}
            />
          )}

          {platforms.some(x => x.gamePlatform === 'BBIN') && (
            <button
              type="button"
              className={classnames(css.realGameButton, css.bbin_wording)}
              onClick={this.goBBINGame.bind(this)}
            />
          )}
        </div>
      );
    }
    return (
      <div className={css.realis}>
        <div className={css.realis_row}>{content}</div>
      </div>
    );
  }
}

function mapStatesToProps({realiModel, playerModel}) {
  const {gamePlatformList} = playerModel;

  return {
    gamePlatformList,
    ...realiModel,
  };
}

const component = connect(mapStatesToProps)(SportsComponent);

function Sport(props) {
  return <ExternalPage component={component} componentProps={props} />;
}

export default withRouter(Sport);
