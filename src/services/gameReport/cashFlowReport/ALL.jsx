import _ from 'lodash';
import classnames from 'classnames';
import cssB from 'styles/User/Dsf/ProfileIndex1.less';
import {renderValue} from 'services/gameReport/general';

const CashFlowReport = {
    gameReportMain: ({
      renderId,
      sortedInfo,
      renderCashFlowIdSearch,
    }) => {
      const columns = [];
      columns.push({
        title: '交易时间',
        dataIndex: 'transactionTime',
        key: 'transactionTime',
        className: classnames(cssB.cashFlowList_medium),
      });
      columns.push({
        title: '订单号',
        dataIndex: 'transactionId',
        key: 'transactionId',
        className: classnames(cssB.cashFlowList_long),
        render: renderId,
      });
      columns.push({
        title: '交易类型',
        dataIndex: 'transactionType',
        key: 'transactionType',
        className: classnames(cssB.cashFlowList_mediumShort),
      });
      columns.push({
        title: '交易项目',
        dataIndex: 'transactionTypeDetail',
        key: 'transactionTypeDetail',
        className: classnames(cssB.cashFlowList_medium),
      });
      columns.push({
        title: '交易金额',
        dataIndex: 'transactionTotal',
        key: 'transactionTotal',
        className: cssB.cashFlowList_columnAmount,
        render: renderValue,
        sorter: (a, b) => a.transactionTotal - b.transactionTotal,
        sortOrder:
          sortedInfo.columnKey === 'transactionTotal' && sortedInfo.order,
      });
      columns.push({
        title: '帐变后余额',
        dataIndex: 'transactionBalanceAfter',
        key: 'transactionBalanceAfter',
        className: cssB.cashFlowList_columnAmount,
        render: renderValue,
      });
      return columns;
    },
    gameReportMainData: ({displayList, selectedGamePlatform}) => {
      const data = [];
      _.map(displayList, (list, index) => {
        const {
          crossReferenceId,
          processTime,
          type,
          subType,
          delta,
          grandTotal,
          balance,
        } = list;
        data.push({
          key: `${index}_${crossReferenceId}_cashflow`,
          transactionTime: processTime,
          transactionId: crossReferenceId,
          transactionType: type,
          transactionTypeDetail: subType,
          transactionTotal: delta,
          transactionBalance: grandTotal,
          transactionBalanceAfter: balance
        });
      });
      return data;
    },
  };

  export default CashFlowReport;