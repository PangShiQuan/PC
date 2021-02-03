import React from 'react';
import css from 'styles/User/TradingCenter/Recharge.less';
import SVG from 'react-inlinesvg';
import lightBulb from 'assets/image/User/ic-tips.svg';

const TransferTips = ({gamePlatforms}) => {
  const BBIN = gamePlatforms.find(x => x.gamePlatform === 'BBIN');

  return (
    <div className={css.tips_div}>
      <div className={css.tips_content}>
        <div className={css.tips_title}>
          <SVG className={css.tips_svg_icon} src={lightBulb} />
          温馨提示
        </div>
        <div className={css.tips_description}>
          <div style={{lineHeight: '30px'}}>
            中心余额与各个游戏钱包是相互独立的，转帐只能够在中心余额与游戏钱包间直接互转，游戏钱包之间不能直接互转。如要将各游戏钱包的金额发生流动，需要完成
            两次转帐，先将转出方金额转入中心余额，再由中心余额将金额移到转入方。
          </div>

          {BBIN && (
            <div>
              {BBIN.gameNameInChinese}
              只允许整数金额从钱包里转出，遗留在钱包里的小数点金额将不会计入到中心钱包。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default React.memo(TransferTips);
