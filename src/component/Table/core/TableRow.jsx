import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { connect } from '../../../utils/mini-store';
import TableCell from './TableCell';
import { warningOnce } from '../tableUtils';

class TableRow extends Component {
  static propTypes = {
    onRow: PropTypes.func,
    onRowClick: PropTypes.func,
    onRowDoubleClick: PropTypes.func,
    onRowContextMenu: PropTypes.func,
    onRowMouseEnter: PropTypes.func,
    onRowMouseLeave: PropTypes.func,
    record: PropTypes.object,
    prefixCls: PropTypes.string,
    onHover: PropTypes.func,
    columns: PropTypes.array,
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    index: PropTypes.number,
    rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    className: PropTypes.string,
    indent: PropTypes.number,
    indentSize: PropTypes.number,
    hasExpandIcon: PropTypes.func,
    hovered: PropTypes.bool.isRequired,
    visible: PropTypes.bool.isRequired,
    store: PropTypes.object.isRequired,
    fixed: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    renderExpandIcon: PropTypes.func,
    renderExpandIconCell: PropTypes.func,
    components: PropTypes.any,
    expandedRow: PropTypes.bool,
    isAnyColumnsFixed: PropTypes.bool,
    ancestorKeys: PropTypes.array.isRequired,
  };

  static defaultProps = {
    onRow() {},
    onHover() {},
    hasExpandIcon() {},
    renderExpandIcon() {},
    renderExpandIconCell() {},
  };

  constructor(props) {
    super(props);

    this.shouldRender = props.visible;

    this.state = {};
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.visible || (!prevState.visible && nextProps.visible)) {
      return {
        shouldRender: true,
        visible: nextProps.visible,
      };
    }
    return {
      visible: nextProps.visible,
    };
  }

  componentDidMount() {
    const { shouldRender } = this.state;
    if (shouldRender) {
      this.saveRowRef();
    }
  }

  shouldComponentUpdate(nextProps) {
    const { visible } = this.props;
    return !!(visible || nextProps.visible);
  }

  componentDidUpdate() {
    const { shouldRender } = this.state;
    if (shouldRender && !this.rowRef) {
      this.saveRowRef();
    }
  }

  onRowClick = event => {
    const { record, index, onRowClick } = this.props;
    if (onRowClick) {
      onRowClick(record, index, event);
    }
  };

  onRowDoubleClick = event => {
    const { record, index, onRowDoubleClick } = this.props;
    if (onRowDoubleClick) {
      onRowDoubleClick(record, index, event);
    }
  };

  onContextMenu = event => {
    const { record, index, onRowContextMenu } = this.props;
    if (onRowContextMenu) {
      onRowContextMenu(record, index, event);
    }
  };

  onMouseEnter = event => {
    const { record, index, onRowMouseEnter, onHover, rowKey } = this.props;
    onHover(true, rowKey);
    if (onRowMouseEnter) {
      onRowMouseEnter(record, index, event);
    }
  };

  onMouseLeave = event => {
    const { record, index, onRowMouseLeave, onHover, rowKey } = this.props;
    onHover(false, rowKey);
    if (onRowMouseLeave) {
      onRowMouseLeave(record, index, event);
    }
  };

  setExpanedRowHeight() {
    const { store, rowKey } = this.props;
    let { expandedRowsHeight } = store.getState();
    const { height } = this.rowRef.getBoundingClientRect();
    expandedRowsHeight = {
      ...expandedRowsHeight,
      [rowKey]: height,
    };
    store.setState({ expandedRowsHeight });
  }

  setRowHeight() {
    const { store, rowKey } = this.props;
    const { fixedColumnsBodyRowsHeight } = store.getState();
    const { height } = this.rowRef.getBoundingClientRect();
    store.setState({
      fixedColumnsBodyRowsHeight: {
        ...fixedColumnsBodyRowsHeight,
        [rowKey]: height,
      },
    });
  }

  getStyle() {
    const { height, visible } = this.props;

    if (height && height !== this.style.height) {
      this.style = { ...this.style, height };
    }

    if (!visible && !this.style.display) {
      this.style = { ...this.style, display: 'none' };
    }

    return this.style;
  }

  saveRowRef() {
    this.rowRef = ReactDOM.findDOMNode(this);

    const { isAnyColumnsFixed, fixed, expandedRow, ancestorKeys } = this.props;

    if (!isAnyColumnsFixed) {
      return;
    }

    if (!fixed && expandedRow) {
      this.setExpanedRowHeight();
    }

    if (!fixed && ancestorKeys.length >= 0) {
      this.setRowHeight();
    }
  }

  render() {
    const { shouldRender } = this.state;
    if (!shouldRender) {
      return null;
    }

    const {
      prefixCls,
      columns,
      record,
      rowKey,
      index,
      onRow,
      indent,
      indentSize,
      hovered,
      height,
      visible,
      components,
      hasExpandIcon,
      renderExpandIcon,
      renderExpandIconCell,
    } = this.props;

    const BodyRow = components.body.row;
    const BodyCell = components.body.cell;

    let { className } = this.props;

    if (hovered) {
      className += ` ${prefixCls}-hover`;
    }

    const cells = [];

    renderExpandIconCell(cells);

    for (let i = 0; i < columns.length; i += 1) {
      const column = columns[i];

      warningOnce(
        column.onCellClick === undefined,
        'column[onCellClick] is deprecated, please use column[onCell] instead.',
      );

      cells.push(
        <TableCell
          prefixCls={prefixCls}
          record={record}
          indentSize={indentSize}
          indent={indent}
          index={index}
          column={column}
          key={column.key || column.dataIndex}
          expandIcon={hasExpandIcon(i) && renderExpandIcon()}
          component={BodyCell}
        />,
      );
    }

    const tableRowPorps = onRow(record, index) || {};
    const { className: customClassName, style: customStyle, ...restProps } = tableRowPorps;
    let style = { height };

    if (!visible) {
      style.display = 'none';
    }

    style = { ...style, ...customStyle };
    const rowClassName = classNames(
      prefixCls,
      className,
      `${prefixCls}-level-${indent}`,
      customClassName,
    );

    return (
      <BodyRow
        onClick={this.onRowClick}
        onDoubleClick={this.onRowDoubleClick}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onContextMenu={this.onContextMenu}
        {...restProps}
        className={rowClassName}
        style={style}
        data-row-key={rowKey}
      >
        {cells}
      </BodyRow>
    );
  }
}

const getRowHeight = (state, props) => {
  const { expandedRowsHeight, fixedColumnsBodyRowsHeight } = state;
  const { fixed, rowKey } = props;

  if (!fixed) {
    return null;
  }

  if (expandedRowsHeight[rowKey]) {
    return expandedRowsHeight[rowKey];
  }

  if (fixedColumnsBodyRowsHeight[rowKey]) {
    return fixedColumnsBodyRowsHeight[rowKey];
  }

  return null;
};

export default connect((state, props) => {
  const { currentHoverKey, expandedRowKeys } = state;
  const { rowKey, ancestorKeys } = props;
  const keyLength = ancestorKeys.length;
  const visible = keyLength === 0 || ancestorKeys.every(k => expandedRowKeys.indexOf(k) !== -1);

  return {
    visible,
    hovered: currentHoverKey === rowKey,
    height: getRowHeight(state, props),
  };
})(TableRow);
