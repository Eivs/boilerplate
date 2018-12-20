import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { get } from 'lodash';

const isInvalidRenderCellText = text => text && !React.isValidElement(text) && Object.prototype.toString.call(text) === '[object Object]';

class TableCell extends PureComponent {
  static propTypes = {
    record: PropTypes.object,
    prefixCls: PropTypes.string,
    index: PropTypes.number,
    indent: PropTypes.number,
    indentSize: PropTypes.number,
    column: PropTypes.object,
    expandIcon: PropTypes.node,
    component: PropTypes.any,
  };

  handleClick = (e) => {
    const {
      record,
      column: { onCellClick },
    } = this.props;
    if (onCellClick) {
      onCellClick(record, e);
    }
  };

  render() {
    const {
      record,
      indentSize,
      prefixCls,
      indent,
      index,
      expandIcon,
      column,
      component: BodyCell,
    } = this.props;
    const { dataIndex, render, className = '' } = column;

    let text;
    if (typeof dataIndex === 'number') {
      text = get(record, dataIndex);
    } else if (!dataIndex || dataIndex.length === 0) {
      text = record;
    } else {
      text = get(record, dataIndex);
    }
    let tdProps = {};
    let tdColSpan;
    let tdRowSpan;

    if (render) {
      text = render(text, record, index);
      if (isInvalidRenderCellText(text)) {
        tdProps = text.props || tdProps;
        tdColSpan = tdProps.colSpan;
        tdRowSpan = tdProps.rowSpan;
        text = text.children;
      }
    }

    if (column.onCell) {
      tdProps = { ...tdProps, ...column.onCell(record, index) };
    }

    if (isInvalidRenderCellText(text)) {
      text = null;
    }

    const indentText = expandIcon ? (
      <span
        style={{ paddingLeft: `${indentSize * indent}px` }}
        className={`${prefixCls}-indent indent-level-${indent}`}
      />
    ) : null;

    if (tdRowSpan === 0 || tdColSpan === 0) {
      return null;
    }

    if (column.align) {
      tdProps.style = { ...tdProps.style, textAlign: column.align };
    }

    return (
      <BodyCell
        className={className}
        onClick={this.handleClick}
        {...tdProps}
      >
        {indentText}
        {expandIcon}
        {text}
      </BodyCell>
    );
  }
}

export default TableCell;
