import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { isFunction } from 'lodash';
import TableHead from './TableHead';
import TableRow from './TableRow';
import { Provider } from './TableStore';

class Table extends PureComponent {
  static propTypes = {
    columns: PropTypes.array,
    dataSource: PropTypes.array,
    rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  };

  static defaultProps = {
    columns: [],
    dataSource: [],
  };

  getRowKey = (record, index) => {
    const { rowKey } = this.props;
    const key = isFunction(rowKey) ? rowKey(record, index) : record[rowKey];
    return key === undefined ? `row-key-${index}` : key;
  };

  render() {
    const { columns, dataSource } = this.props;
    return (
      <Provider>
        <table>
          <TableHead columns={columns} />
          <tbody>
            {dataSource.map((record, index) => {
              const rowKey = this.getRowKey(record, index);
              return <TableRow key={rowKey} rowKey={rowKey} record={record} columns={columns} />;
            })}
          </tbody>
        </table>
      </Provider>
    );
  }
}

export default Table;
