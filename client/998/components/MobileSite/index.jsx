import React, {Component} from 'react';
import {connect} from 'dva';
import classnames from 'classnames';
import {MDIcon, QRCode} from 'components/General';
import MobileWebFooter from '../../assets/image/mobileSite/mobile_web_footer.jpg';
import css from '../../styles/mobileSite/mobileSite.less';

function Mobile({iosAppLink, androidAppLink}) {
  function onURLLink({currentTarget}) {
    window.open(currentTarget.value);
  }

  const QRCodeSize = 180;
  return (
    <div>
      <div className={css.mobileSiteOuter}>
        <div className={css.mobileSite}>
          <div className={css.mobile}>
            <div className={css.mobileText} data-label>
              手机购彩 尽在caipiao998.cc
            </div>
            <div className={css.mobileText} data-description>
              手机便捷下注，游戏生活两不误随时随地， 玩<br /> 彩票就那么简单
            </div>
            <div className={css.mobileButtonsOuter}>
              <div>
                <button
                  onClick={onURLLink}
                  className={css.mobileBtn}
                  data-left
                  value={iosAppLink}>
                  <div className={css.mobileIconOuter} data-left>
                    <MDIcon iconName="apple" className={css.mobileApple} />
                  </div>
                  <div className={css.mobileTextOuter}>iPhone 下载</div>
                </button>
                <div className={css.mobileBtnDescription}>
                  支持 IOS 9.0 及以上
                </div>
                <QRCode
                  text={iosAppLink}
                  size={QRCodeSize}
                  className={css.mobileQR}
                />
              </div>
              <div className={css.mobileBtnHolder}>
                <button
                  onClick={onURLLink}
                  className={css.mobileBtn}
                  data-right
                  value={androidAppLink}>
                  <div className={css.mobileIconOuter} data-right>
                    <MDIcon iconName="android" className={css.mobileAndroid} />
                  </div>
                  <div className={css.mobileTextOuter}>Android 下载</div>
                </button>
                <div className={css.mobileBtnDescription}>
                  支持 Android 4.3 及以上
                </div>
                <QRCode
                  text={androidAppLink}
                  size={QRCodeSize}
                  className={css.mobileQR}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <img
        src={MobileWebFooter}
        alt="MobileWeb"
        className={css.mobileImageFooter}
      />
    </div>
  );
}

const mapStatesToProps = ({layoutModel}) => ({
  iosAppLink: layoutModel.iosAppLink,
  androidAppLink: layoutModel.androidAppLink,
});

export default connect(mapStatesToProps)(Mobile);
