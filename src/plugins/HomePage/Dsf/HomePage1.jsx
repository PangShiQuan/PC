import React, {PureComponent} from 'react';
import {map} from 'lodash';
import resolve from 'clientResolver';
import Card from 'components/General/Card';
import * as images from 'components/HomePage/images';
import {isPlatformGameExist} from 'utils/isPlatformExist';
import css from 'styles/homepage/Dsf/homepageBody1.less';

const CarouselBag = resolve.plugin('CarouselBag');
const Marquee = resolve.plugin('Marquee');

class HomeDefault extends PureComponent {
  render() {
    const {
      activities,
      directories,
      onClickGames,
      onClickManagement,
      userData,
    } = this.props;
    return (
      <div className={css.homePage_body}>
        <CarouselBag />
        <Marquee />
        <div className={css.homePage_row}>
          {map(activities, (activity, key) => {
            const {title, desc, MATCH, dispatchItem, pathname} = activity;
            const activityOpened = !MATCH || isPlatformGameExist(this.props, MATCH);
          if (key === 'realis') {
              return null;
           }
           else
            return (
              <Card
                disabled={!activityOpened}
                key={key}
                onClick={() => onClickGames({dispatchItem, pathname})}
                image={images[key]}
                overlayStyle={{backgroundImage: `url('${images[key]}')`}}
                title={title}
                desc={desc}
                disableContent="暂未开放，敬请期待"
              />
            );
          })}
        </div>
        <div className={css.homePage_row}>
          {map(directories, (activity, key) => {
            const {
              title,
              subtitle,
              desc,
              fallbackDispatch,
              dispatchItem,
              pathname,
            } = activity;
            return (
              <Card
                size="small"
                key={key}
                onClick={() =>
                  onClickManagement({
                    userData,
                    fallbackDispatch,
                    dispatchItem,
                    pathname,
                  })
                }
                image={images[key]}
                overlayStyle={{backgroundImage: `url('${images[key]}')`}}
                title={title}
                subtitle={subtitle}
                desc={desc}
                disableContent="暂未开放，敬请期待"
              />
            );
          })}
        </div>
      </div>
    );
  }
}

export default HomeDefault;
