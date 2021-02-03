import React, {useState, useCallback} from 'react';
import {EllipsisLoader} from 'components/General';
import css from 'styles/User/TradingCenter/Recharge.less';

const QRCodeScan = ({data}) => {
  const {bankCardNo, bankName} = data;
  const [QRCodeLoading, setQRCodeLoading] = useState(true);

  const onQRImgLoad = useCallback(() => {
    setQRCodeLoading(false);
  }, []);

  return (
    <div className={css.qrcode_scan}>
      <div className={css.container}>
        <div className={css.qrcode_img}>
          {QRCodeLoading && (
            <p className={css.downloading}>
              正努力加载当中
              <EllipsisLoader duration={3000} />
            </p>
          )}
          <img onLoad={onQRImgLoad} src={bankCardNo} alt={bankName} />
        </div>

        <div>
          <div className={css.title}>扫二维码支付</div>
          <div className={css.description_container}>
            <p>1. 请扫描二维码，关注公众号</p>
            <p>2. 进入公众号后，点击下方“在线充值”按钮</p>
            <p>3. 输入账号、金额，完成充值</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeScan;
