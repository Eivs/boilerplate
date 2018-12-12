import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from '../../../utils/mini-store';

const propTypes = {
  row: PropTypes.array,
  index: PropTypes.number,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  components: PropTypes.any,
  onHeaderRow: PropTypes.func,
};

const TableHeaderRow = ({ row, index, height, components, onHeaderRow, prefixCls }) => {
  const HeaderRow = components.header.row;
  const HeaderCell = components.header.cell;
  const rowProps = onHeaderRow(row.map(cell => cell.column), index);
  const customStyle = rowProps ? rowProps.style : {};
  const style = { height, ...customStyle };

  return (
    <HeaderRow {...rowProps} style={style}>
      {row.map((cell, i) => {
        const { column, ...cellProps } = cell;
        const customProps = column.onHeaderCell ? column.onHeaderCell(column) : {};
        if (column.align) {
          customProps.style = { ...customProps.style, textAlign: column.align };
          customProps.className = classNames(customProps.className, column.className, {
            [`${prefixCls}-align-${column.align}`]: !!column.align,
          });
        }
        return (
          <HeaderCell {...cellProps} {...customProps} key={column.key || column.dataIndex || i} />
        );
      })}
    </HeaderRow>
  );
};

TableHeaderRow.propTypes = propTypes;

const getRowHeight = (state, props) => {
  const { fixedColumnsHeadRowsHeight } = state;
  const { columns, rows, fixed } = props;
  const headerHeight = fixedColumnsHeadRowsHeight[0];

  if (!fixed) {
    return null;
  }

  if (headerHeight && columns) {
    if (headerHeight === 'auto') {
      return 'auto';
    }
    return headerHeight / rows.length;
  }
  return null;
};

export default connect((state, props) => ({
  height: getRowHeight(state, props),
}))(TableHeaderRow);
