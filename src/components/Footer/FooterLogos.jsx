import React from 'react';
import {connect} from 'dva';
import css from 'styles/footer/FooterLogos.less';
import {type} from 'utils';
import * as Logos from './FooterImages';

const {PLATFORM_TYPE} = type;

const paymentList = ['WECHAT', 'ALIPAY', 'VISA', 'UNION', 'QUICKPASS'];

const FooterLogos = ({gamePlatformList}) => {
  const availableGamePlatform = [];
  Object.keys(gamePlatformList).forEach(platform => {
    availableGamePlatform.push(
      gamePlatformList[platform].gamePlatformType === PLATFORM_TYPE.THIRD_PARTY
        ? gamePlatformList[platform].gamePlatform
        : undefined,
    );
  });

  return (
    <div className={css.container}>
      {Object.keys(Logos).map((name, index) => {
        if (
          paymentList.includes(name) ||
          availableGamePlatform.includes(name)
        ) {
          return (
            <div key={name} className={css.item}>
              <img src={Logos[name]} alt={`logo${index}`} />
            </div>
          );
        }
      })}
    </div>
  );
};

const mapStatesToProps = ({playerModel}) => {
  const {gamePlatformList = {}} = playerModel;
  return {gamePlatformList};
};

export default connect(mapStatesToProps)(FooterLogos);
