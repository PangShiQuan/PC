import _ from 'lodash';
import {type as TYPE} from 'utils';
import {renderDate} from 'services/gameReport/general';

const TransferReport = {
  gameReportMain({gamePlatformList}) {
    const columns = [];
    columns.push({
      title: '创建时间 (GMT+8)',
      dataIndex: 'createTime',
      key: 'createTime',
      render: data => (data ? renderDate(data) : ''),
    });
    columns.push({
      title: '订单号',
      dataIndex: 'transactionId',
      key: 'transactionId',
    });
    columns.push({
      title: '转账金额',
      dataIndex: 'amount',
      key: 'amount',
      render: data => `￥${data}`,
    });
    columns.push({
      title: '游戏平台',
      dataIndex: 'gamePlatform',
      key: 'gamePlatform',
      render: data => {
        return (
          (gamePlatformList[data] || TYPE.gamePlatformList[data])
            .gameNameInChinese || ''
        );
      },
    });
    columns.push({
      title: '转账类型',
      dataIndex: 'type',
      key: 'type',
      render: data =>
        data ? TYPE.moneyOperationTypeRefs[data.toUpperCase()] : '',
    });
    columns.push({
      title: '转账状态',
      dataIndex: 'stateExplain',
      key: 'stateExplain',
    });
    return columns;
  },
  gameReportMainData({displayList, selectedGamePlatform}) {
    const data = [];
    _.map(displayList, (dataItem, index) => {
      const {
        gamePlatform,
        type,
        stateExplain,
        transactionId,
        amount,
        createTime,
      } = dataItem;
      data.push({
        key: transactionId,
        transactionId,
        amount,
        createTime,
        gamePlatform,
        type,
        stateExplain,
      });
    });
    return data;
  },
  tableDimension() {
    return {width: 900, height: 450};
  },
};

export default TransferReport;
