import React from 'react';
import {Carousel} from 'antd';
import {Link} from 'dva/router';
import {connect} from 'dva';
import css from 'styles/homepage/Base/carousel1.less';

function CarouselBag({promotionBanners}) {
  function renderScene() {
    if (promotionBanners) {
      return promotionBanners.map((banner, index) => {
        const {bannerImageUrl, activityId, sequenceId} = banner;
        if (activityId && activityId >= 0) {
          return (
            <Link
              key={`${activityId}__${sequenceId}__${bannerImageUrl}`}
              target="_blank"
              to={`/promotions#${activityId}`}>
              <img
                className={css.carousel_img}
                src={bannerImageUrl}
                alt={activityId}
              />
            </Link>
          );
        }

        return (
          <img
            key={`${activityId}__${sequenceId}__${bannerImageUrl}`}
            className={css.carousel_img}
            src={bannerImageUrl}
            alt={activityId}
          />
        );
      });
    }
    return <div />;
  }
  return (
    <div className={css.container}>
      <div className={css.carousel}>
        {promotionBanners.length ? (
          <Carousel autoplay>{renderScene()}</Carousel>
        ) : null}
      </div>
    </div>
  );
}

function mapStatesToProps({gameInfosModel}) {
  return {promotionBanners: gameInfosModel.promotionBanners};
}

export default connect(mapStatesToProps)(CarouselBag);
