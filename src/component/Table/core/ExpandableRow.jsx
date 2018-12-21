import React, { Component } from 'react';
import PropTypes from 'prop-types';
import deepEqual from '../../../utils/deepEqual';
import { connect } from '../../../utils/mini-store';
import ExpandIcon from './ExpandIcon';

class ExpandableRow extends Component {
  static propTypes = {
    prefixCls: PropTypes.string.isRequired,
    rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    fixed: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    record: PropTypes.object.isRequired,
    indentSize: PropTypes.number,
    needIndentSpaced: PropTypes.bool.isRequired,
    expandRowByClick: PropTypes.bool,
    expanded: PropTypes.bool.isRequired,
    expandIconAsCell: PropTypes.bool,
    expandIcons: PropTypes.array,
    expandIconColumnIndex: PropTypes.number,
    childrenColumnName: PropTypes.string,
    expandedRowRender: PropTypes.func,
    expandIcon: PropTypes.func,
    onExpandedChange: PropTypes.func.isRequired,
    onRowClick: PropTypes.func,
    children: PropTypes.func.isRequired,
    columns: PropTypes.array,
  };

  shouldComponentUpdate(nextProps) {
    const { columns } = this.props;
    return !deepEqual(columns, nextProps.columns);
  }


  componentWillUnmount() {
    this.handleDestroy();
  }

  hasExpandIcon = (columnIndex) => {
    const { expandRowByClick } = this.props;
    return (
      !this.expandIconAsCell && !expandRowByClick && columnIndex === this.expandIconColumnIndex
    );
  };

  handleExpandChange = (record, event) => {
    const { onExpandedChange, expanded, rowKey } = this.props;
    if (this.expandable) {
      onExpandedChange(!expanded, record, event, rowKey);
    }
  };

  handleDestroy = () => {
    const { onExpandedChange, rowKey, record } = this.props;
    if (this.expandable) {
      onExpandedChange(false, record, null, rowKey, true);
    }
  };

  handleRowClick = (record, index, event) => {
    const { expandRowByClick, onRowClick } = this.props;
    if (expandRowByClick) {
      this.handleExpandChange(record, event);
    }
    if (onRowClick) {
      onRowClick(record, index, event);
    }
  };

  renderExpandIcon = () => {
    const {
      prefixCls, expanded, record, needIndentSpaced, expandIcon, expandIcons,
    } = this.props;

    if (expandIcon) {
      return expandIcon({
        prefixCls,
        expanded,
        record,
        needIndentSpaced,
        expandable: this.expandable,
        onExpand: this.handleExpandChange,
      });
    }

    return (
      <ExpandIcon
        expandable={this.expandable}
        prefixCls={prefixCls}
        onExpand={this.handleExpandChange}
        needIndentSpaced={needIndentSpaced}
        expanded={expanded}
        record={record}
        expandIcons={expandIcons}
      />
    );
  };

  renderExpandIconCell = (cells) => {
    if (!this.expandIconAsCell) {
      return;
    }
    const { prefixCls } = this.props;
    const expandCell = (
      <td
        className={`${prefixCls}-expand-icon-cell`}
        key="rc-table-expand-icon-cell"
      >
        {this.renderExpandIcon()}
      </td>
    );
    cells.push(expandCell);
  };

  render() {
    const {
      childrenColumnName,
      expandedRowRender,
      indentSize,
      record,
      fixed,
      expanded,
      expandIconAsCell,
      expandIconColumnIndex,
      children,
    } = this.props;

    this.expandIconAsCell = fixed !== 'right' ? expandIconAsCell : false;
    this.expandIconColumnIndex = fixed !== 'right' ? expandIconColumnIndex : -1;
    const childrenData = record[childrenColumnName];
    const hasChild = expandedRowRender && expandedRowRender(record) !== null;
    this.expandable = !!(childrenData || hasChild);

    const expandableRowProps = {
      indentSize,
      expanded,
      onRowClick: this.handleRowClick,
      hasExpandIcon: this.hasExpandIcon,
      renderExpandIcon: this.renderExpandIcon,
      renderExpandIconCell: this.renderExpandIconCell,
    };

    return children(expandableRowProps);
  }
}

export default connect(({ expandedRowKeys }, { rowKey }) => ({
  expanded: expandedRowKeys.indexOf(rowKey) !== -1,
}))(ExpandableRow);
