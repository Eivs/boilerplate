import React from 'react';
import PropTypes from 'prop-types';
import { measureScrollbar } from '../tableUtils';
import BaseTable from './BaseTable';

const propTypes = {
  fixed: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  columns: PropTypes.array.isRequired,
  tableClassName: PropTypes.string.isRequired,
  handleBodyScrollLeft: PropTypes.func.isRequired,
  expander: PropTypes.object.isRequired,
};

const contextTypes = {
  table: PropTypes.any,
};

const HeadTable = (props, { table }) => {
  const { prefixCls, scroll, showHeader } = table.props;
  const { columns, fixed, tableClassName, handleBodyScrollLeft, expander } = props;
  const { saveRef } = table;
  let { useFixedHeader } = table.props;
  const headStyle = {};

  if (scroll.y) {
    useFixedHeader = true;
    const scrollbarWidth = measureScrollbar('horizontal');
    if (scrollbarWidth > 0 && !fixed) {
      headStyle.marginBottom = `-${scrollbarWidth}px`;
      headStyle.paddingBottom = '0px';
    }
  }

  if (!useFixedHeader || !showHeader) {
    return null;
  }

  return (
    <div
      key="headTable"
      ref={fixed ? null : saveRef('headTable')}
      className={`${prefixCls}-header`}
      style={headStyle}
      onScroll={handleBodyScrollLeft}
    >
      <BaseTable
        tableClassName={tableClassName}
        hasHead
        hasBody={false}
        fixed={fixed}
        columns={columns}
        expander={expander}
      />
    </div>
  );
};

HeadTable.propTypes = propTypes;
HeadTable.contextTypes = contextTypes;

export default HeadTable;
