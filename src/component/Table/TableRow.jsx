import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import Cell from './TableCell';

class TableRow extends PureComponent {
  static propTypes = {
    columns: PropTypes.array,
    record: PropTypes.object,
    rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  };

  render() {
    const { columns, record, rowKey } = this.props;
    const cells = columns.map((column, index) => {
      const { dataIndex } = column;
      const cellkey = `col-${index}-${dataIndex}`;
      const cellProps = {
        key: cellkey,
        index,
        rowKey,
        record,
        column,
      };
      return <Cell {...cellProps} />;
    });
    return <tr>{cells}</tr>;
  }
}

export default TableRow;
