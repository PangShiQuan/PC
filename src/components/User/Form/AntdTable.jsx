import React, {PureComponent} from 'react';
import classnames from 'classnames';
import {Table} from 'antd';
import css from 'styles/User/Form/AntdTable.less';

class AntdTable extends PureComponent {
  render() {
    const {
      columns,
      className,
      pagination,
      expandedRowRender,
      expandedRowKeys,
      expandIconColumnIndex,
      expandIconAsCell,
      dataSource,
      scroll,
      onChange,
    } = this.props;
    const classnameCombine = classnames(css.table, className);

    let props = {};
    if (expandedRowRender) {
      props = {
        rowClassName: (record, index) => (index % 2 ? 'appendBGcolor' : ''), // this is to cater table alternative row background color
        className: classnameCombine,
        columns,
        pagination,
        dataSource,
        expandedRowRender,
        expandedRowKeys,
        expandIconColumnIndex,
        expandIconAsCell,
        scroll,
      };
    } else {
      props = {
        className: classnameCombine,
        columns,
        pagination: pagination || false,
        dataSource,
        scroll,
        locale: {emptyText: '暂无数据'},
      };
    }

    if (onChange) {
      props.onChange = onChange;
    }

    return <Table {...props} />;
  }
}

export default AntdTable;
