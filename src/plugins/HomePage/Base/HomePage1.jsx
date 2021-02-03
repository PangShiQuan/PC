import React, {Component} from 'react';
import {connect} from 'dva';

import BetPage from 'pages/Bet';
import resolve from 'clientResolver';
import css from 'styles/homepage/Base/homepageBody1.less';

const CarouselBag = resolve.plugin('CarouselBag');
const QuickBet = resolve.plugin('QuickBet');
const PredictMap = resolve.plugin('PredictMap');
const WinnerList = resolve.plugin('WinnerList');
const SideNav = resolve.plugin('SideNav');
const Results = resolve.plugin('Results');
const TutorialList = resolve.plugin('TutorialList');

class HomePageContent extends Component {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
  }
  render() {
    const {allGamesPrizeSettings, helpListData} = this.props;
    const TutorialListProps = {
      dispatch: this.dispatch,
      helpListData,
    };
    const componentProps = {allGamesPrizeSettings};

    return (
      <div className={css.homePage_body}>
        <CarouselBag />
        <div className={css.homePage_bodyContent}>
          <div className={css.homePage_panel__side}>
            <div className={css.homePage_pabelBody}>
              <SideNav {...componentProps} />
              <Results />
            </div>
          </div>
          <div className={css.homePage_panel__center}>
            <QuickBet {...componentProps} />
            <TutorialList {...TutorialListProps} />
          </div>
          <div className={css.homePage_panel__side} style={{right: 0}}>
            <div className={css.homePage_pabelBody}>
              <PredictMap />
              <WinnerList />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function mapStatesToProps({gameInfosModel, helpCenterModel}) {
  const {helpListData} = helpCenterModel;
  const {allGamesPrizeSettings, currentResults} = gameInfosModel;

  return {allGamesPrizeSettings, helpListData};
}

const component = connect(mapStatesToProps)(HomePageContent);

export default function HomePage(props) {
  return <BetPage component={component} componentProps={props} />;
}
