import React, {Component} from 'react';
import {forEach, map} from 'lodash';
import {Row, Col} from 'antd';

import {Img} from 'components/General';
import resolve from 'clientResolver';
import * as images from 'components/HomePage/images';
import PlumFalling from 'components/CNYEffect/PlumFalling';
import Fireworks from 'components/CNYEffect/Fireworks';
import {isPlatformGameExist} from 'utils/isPlatformExist';
import css from 'styles/homepage/Dsf/homepageBody2.less';

const Marquee = resolve.plugin('Marquee');
const CarouselBag = resolve.plugin('CarouselBag');

class Home1 extends Component {
  renderManagementCol(colType) {
    const {directories, onClickManagement, userData} = this.props;
    const colReturn = [];
    let count = 0;
    forEach(directories, (dir, key) => {
      const {
        fallbackDispatch,
        dispatchItem,
        pathname,
        type,
        subtitle,
        desc,
        title,
      } = dir;
      if (type === colType) {
        count++;
        colReturn.push(
          <Col span={12} key={`col${key}`}>
            <h1 className={css.category_title}>{title}</h1>
            <button
              type="button"
              className={css.homePage_image_btn}
              onClick={() =>
                onClickManagement({
                  userData,
                  fallbackDispatch,
                  dispatchItem,
                  pathname,
                })
              }
              key={`btn${key}`}>
              <Img
                src={images[key]}
                alt={key}
                className={css.homePage_image}
                data-right={count > 1}
                key={`img${key}`}
              />
              <figure
                className={css.homePage_image_btn_desc}
                data-right={count > 1}>
                <figcaption>{subtitle}</figcaption>
                <p className={css.image_btn_desc_text}>{desc}</p>
              </figure>
            </button>
          </Col>,
        );
      }
    });

    return (
      <Col span={11} className={css.homePage_featured_item}>
        {colReturn}
      </Col>
    );
  }

  renderManagement() {
    return (
      <Row className={css.homePage_featured}>
        {this.renderManagementCol('featured-left')}
        {this.renderManagementCol('featured-right')}
      </Row>
    );
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
        <Row className={css.homePage_row}>
          <Col span={18} className={css.homePage_col__left}>
            <CarouselBag showDeco={showFestivalTheme} />
            {this.renderManagement()}
          </Col>
          <Col span={6}>
            {map(activities, (activity, key) => {
              const {MATCH, dispatchItem, pathname} = activity;
              const activityOpened =
                !MATCH || isPlatformGameExist(this.props, MATCH);
              if (key === 'realis') {
                return null;
              }
              return (
                <button
                  type="button"
                  key={`gameDiv${key}`}
                  className={css.homePage_sideRow_img_btn}
                  onClick={() => onClickGames({dispatchItem, pathname})}
                  disabled={!activityOpened}>
                  <Img
                    src={images[activityOpened ? key : `${key}Disabled`]}
                    alt={key}
                    className={css.homePage_sideRow_img}
                    data-first={key === 'caipiao'}
                  />
                </button>
              );
            })}
          </Col>
        </Row>
        {showFestivalTheme && <PlumFalling />}
      </div>
    );
  }
}

export default Home1;
