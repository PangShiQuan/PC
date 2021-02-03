import React, {Component} from 'react';
import {forEach, map} from 'lodash';
import {Img} from 'components/General';
import Fireworks from 'components/CNYEffect/Fireworks';
import PlumFalling from 'components/CNYEffect/PlumFalling';
import resolve from 'clientResolver';
import * as images from 'components/HomePage/images';
import {isPlatformGameExist} from 'utils/isPlatformExist';
import css from 'styles/homepage/Dsf/homepageBody3.less';

const Marquee = resolve.plugin('Marquee');
const CarouselBag = resolve.plugin('CarouselBag');

class Home3 extends Component {
  renderManagement() {
    const {directories, onClickManagement, userData} = this.props;
    const colReturn = [];
    forEach(directories, (dir, key) => {
      const {
        fallbackDispatch,
        dispatchItem,
        pathname,
        type,
        subtitle,
        desc,
        title,
        url,
      } = dir;
      colReturn.push(
        <button
          type="button"
          className={css.homePage_sideRow_img_btn}
          onClick={() =>
            onClickManagement({
              userData,
              fallbackDispatch,
              dispatchItem,
              pathname,
              url,
            })
          }
          key={`btn${key}`}>
          <Img
            src={images[key]}
            alt={key}
            className={css.homePage_sideRow_img}
            key={`img${key}`}
          />
          <img alt={`${key}Border`} className={css.homePage_sideRow_border} />
          <div className={css.shinyHoverEffect} />
        </button>,
      );
    });
    return colReturn;
  }

  render() {
    const {activities, onClickGames, festivalTheme} = this.props;
    let showFestivalTheme = false;

    if (
      festivalTheme &&
      festivalTheme.status &&
      Date.now() >= new Date(festivalTheme.startTime) &&
      Date.now() <= new Date(festivalTheme.expiryTime)
    ) {
      showFestivalTheme = true;
    }

    return (
      <div className={css.homePage_body}>
        {showFestivalTheme && <Fireworks />}
        <Marquee />
        <div className={css.homePage_row}>
          <div className={css.topHomePageContent}>
            <div className={css.topHomePageCarousel}>
              <CarouselBag showDeco={showFestivalTheme} />
              <img alt="bannerBorder" className={css.homePage_banner_border} />
            </div>
            <div className={css.topHomePageButton}>
              {this.renderManagement()}
            </div>
          </div>
          <div className={css.bottomHomePageContent}>
            {map(activities, (activity, key) => {
              const {MATCH, dispatchItem, pathname} = activity;
              const activityOpened =
                !MATCH || isPlatformGameExist(this.props, MATCH);
              return (
                <div key={`gameDiv${key}`}>
                  <button
                    type="button"
                    className={`${css.homePage_image_btn}${key}Btn`}
                    onClick={() => onClickGames({dispatchItem, pathname})}
                    disabled={!activityOpened}>
                    <img
                      src={
                        images[activityOpened ? `${key}Bg` : `${key}BgDisabled`]
                      }
                      alt={`${key}Bg`}
                      className={css.homePage_image}
                    />
                    <img
                      src={
                        images[
                          activityOpened
                            ? `${key}Content`
                            : `${key}ContentDisabled`
                        ]
                      }
                      alt={`${key}Content`}
                      className={`${css.homePage_imageContent}${key}Img`}
                    />
                    <img
                      src={
                        images[
                          activityOpened ? `${key}Title` : `${key}TitleDisabled`
                        ]
                      }
                      alt={`${key}Title`}
                      className={css.homePage_imageTitle}
                    />
                    <img
                      alt={`${key}Border`}
                      className={css.homePage_imageBorder}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        {showFestivalTheme && <PlumFalling />}
      </div>
    );
  }
}

export default Home3;
