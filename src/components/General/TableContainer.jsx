import React, {PureComponent} from 'react';
import classnames from 'classnames';
import {Table} from 'antd';
import css from 'styles/general/tableContainer.less';

class TableContainer extends PureComponent {
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
    const classnameCombine = classnames(css.tableContainer, className);

    let props = {};
    if (expandedRowRender) {
      props = {
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
      };
    }

    if (onChange) {
      props.onChange = onChange;
    }

    return <Table {...props} />;
  }
}

export default TableContainer;
