import React from 'react';
import {Carousel} from 'antd';
import {Link} from 'dva/router';
import {connect} from 'dva';
import css from 'styles/homepage/Dsf/carousel1.less';
import decoLeft from 'assets/image/CNY/deco-left.gif';
import decoRight from 'assets/image/CNY/deco-right.gif';

function CarouselBag({promotionBanners, showDeco}) {
  return (
    <div className={css.carousel}>
      {promotionBanners.length ? (
        <Carousel autoplay>
          {promotionBanners.map(({bannerImageUrl, activityId, sequenceId}) => {
            if (activityId && activityId >= 0) {
              return (
                <Link
                  key={`${activityId}__${sequenceId}`}
                  target="_blank"
                  to={`/promotions#${activityId}`}>
                  <img
                    src={bannerImageUrl}
                    alt={activityId}
                    className={css.carousel_img}
                  />
                </Link>
              );
            }

            return (
              <img
                key={`${activityId}__${sequenceId}`}
                src={bannerImageUrl}
                alt={activityId}
                className={css.carousel_img}
              />
            );
          })}
        </Carousel>
      ) : null}
      {showDeco && <img src={decoLeft} alt="deco" className={css.decoLeft} />}
      {showDeco && <img src={decoRight} alt="deco" className={css.decoRight} />}
    </div>
  );
}

function mapStatesToProps({gameInfosModel}) {
  return {promotionBanners: gameInfosModel.promotionBanners};
}

export default connect(mapStatesToProps)(CarouselBag);
