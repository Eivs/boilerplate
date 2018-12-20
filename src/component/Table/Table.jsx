import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {
  treeMap,
  flatFilter,
  flatArray,
  normalizeColumns,
  createStore,
  stopPropagation,
  createComponents,
  getColumnKey,
  getFilteredValueColumns,
  getFiltersFromColumns,
  getSortOrderColumns,
  getSortStateFromColumns,
  isFiltersChanged,
} from './tableUtils';
import MainTable from './core/MainTable';
import Icon from '../Icon';
import Pagination from '../Pagination';
import Loading from '../Loading';
import FilterDropdown from './FilterDropdown';
import SelectionBox from './SelectionBox';
import SelectionCheckboxAll from './SelectionCheckboxAll';

class Table extends Component {
  static propTypes = {
    rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.func]),
    dataSource: PropTypes.array,
    columns: PropTypes.array,
    prefixCls: PropTypes.string,
    useFixedHeader: PropTypes.bool,
    rowSelection: PropTypes.object,
    className: PropTypes.string,
    style: PropTypes.object,
    loading: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
    bordered: PropTypes.bool,
    onChange: PropTypes.func,
    dropdownPrefixCls: PropTypes.string,
    showHeader: PropTypes.bool,
    expandedRowRender: PropTypes.any,
    expandIconAsCell: PropTypes.bool,
    expandIcons: PropTypes.array,
    children: PropTypes.node,
    pagination: PropTypes.object,
    onRow: PropTypes.func,
    childrenColumnName: PropTypes.string,
    hiddenColumns: PropTypes.array,
    onHideColumn: PropTypes.func,
    expandRowIndent: PropTypes.bool,
    components: PropTypes.shape({
      table: PropTypes.any,
      header: PropTypes.shape({
        wrapper: PropTypes.any,
        row: PropTypes.any,
        cell: PropTypes.any,
      }),
      body: PropTypes.shape({
        wrapper: PropTypes.any,
        row: PropTypes.any,
        cell: PropTypes.any,
      }),
    }),
  };

  static defaultProps = {
    dataSource: [],
    prefixCls: 'table',
    useFixedHeader: false,
    rowSelection: null,
    loading: false,
    bordered: false,
    rowKey: 'key',
    showHeader: true,
    expandRowIndent: true,
    childrenColumnName: 'children',
    expandIcons: ['chevron-up', 'chevron-down'],
    components: {},
  };

  constructor(props) {
    super(props);
    const columns = props.columns || normalizeColumns(props.children);
    this.state = {
      ...this.getDefaultSortOrder(columns),
      filters: getFiltersFromColumns(columns),
      pagination: this.getDefaultPagination(props),
      hasSelected: false,
      hiddenCols: [],
      columns,
      components: createComponents(props.components),
    };

    this.CheckboxPropsCache = {};

    this.store = createStore({
      selectedRowKeys: (props.rowSelection || {}).selectedRowKeys || [],
      selectionDirty: false,
    });

    if (this.store.getState().selectedRowKeys.length > 0) {
      this.state.hasSelected = true;
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      pagination, rowSelection, hiddenColumns, components,
    } = nextProps;
    const {
      sortColumn, sortOrder, hiddenCols, filters,
    } = prevState;
    const columns = nextProps.columns || normalizeColumns(nextProps.children);
    const newState = {};
    if ('pagination' in nextProps) {
      const newPagination = {
        onChange: () => {},
        ...prevState.pagination,
        ...pagination,
      };
      newPagination.current = newPagination.current || 1;
      newPagination.pageSize = newPagination.pageSize || 10;
      newState.pagination = pagination !== false ? newPagination : {};
    }

    if (rowSelection && 'selectedRowKeys' in rowSelection) {
      const selectedRowKeys = rowSelection.selectedRowKeys || [];
      newState.hasSelected = selectedRowKeys.length > 0;
    }

    if (getSortOrderColumns(columns).length > 0) {
      const sortState = getSortStateFromColumns(columns);
      if (sortState.sortColumn !== sortColumn || sortState.sortOrder !== sortOrder) {
        newState.sortState = sortState;
      }
    }

    const filteredValueColumns = getFilteredValueColumns(columns);
    if (filteredValueColumns.length > 0) {
      const filtersFromColumns = getFiltersFromColumns(columns);
      const newFilters = {};
      Object.keys(filtersFromColumns).forEach((key) => {
        newFilters[key] = filtersFromColumns[key];
      });
      if (isFiltersChanged(newFilters, filters)) {
        newState.filters = newFilters;
      }
    } else {
      newState.filters = {};
    }

    if (hiddenColumns && hiddenCols !== hiddenColumns) {
      newState.hiddenCols = hiddenColumns;
    }

    if (components !== prevState.components) {
      newState.components = createComponents(components, prevState.components);
    }

    if (columns !== prevState.columns) {
      newState.columns = columns;
    }
    return newState;
  }

  shouldComponentUpdate(nextProps) {
    const { rowSelection, dataSource } = nextProps;
    const { dataSource: prevDataSource } = this.props;
    if (rowSelection && 'selectedRowKeys' in rowSelection) {
      const selectedRowKeys = rowSelection.selectedRowKeys || [];
      this.store.setState({ selectedRowKeys });
    }

    if ('dataSource' in this.props && dataSource !== prevDataSource) {
      this.store.setState({
        selectionDirty: false,
      });
    }

    this.CheckboxPropsCache = {};

    return true;
  }

  onRow = (record, index) => {
    const { onRow, prefixCls } = this.props;
    const custom = onRow ? onRow(record, index) : {};
    return {
      ...custom,
      prefixCls,
      store: this.store,
      rowKey: this.getRecordKey(record, index),
    };
  };

  setSelectedRowKeys(selectedRowKeys, {
    selectWay, record, checked, changeRowKeys, nativeEvent,
  }) {
    const { rowSelection = {} } = this.props;

    if (rowSelection && !('selectedRowKeys' in rowSelection)) {
      this.store.setState({ selectedRowKeys });
    }

    const data = this.getFlatData();

    if (!rowSelection.onChange && !rowSelection[selectWay]) {
      return;
    }

    const selectedRows = data.filter((row, index) => {
      const recordKey = this.getRecordKey(row, index);
      return selectedRowKeys.indexOf(recordKey) > -1;
    });

    if (rowSelection.onChange) {
      rowSelection.onChange(selectedRowKeys, selectedRows);
    }

    if (selectWay === 'onSelect' && rowSelection.onSelect) {
      rowSelection.onSelect(record, checked, selectedRows, nativeEvent);
    } else if (selectWay === 'onSelectAll' && rowSelection.onSelectAll) {
      const changeRows = data.filter((row, index) => {
        const recordKey = this.getRecordKey(row, index);
        return changeRowKeys.indexOf(recordKey) > -1;
      });
      rowSelection.onSelectAll(checked, selectedRows, changeRows);
    } else if (selectWay === 'onSelectInvert' && rowSelection.onSelectInvert) {
      rowSelection.onSelectInvert(selectedRowKeys);
    }
    this.setState({ hasSelected: selectedRowKeys.length > 0 });
  }

  getDefaultSortOrder = (columns) => {
    const definedSortState = getSortStateFromColumns(columns);

    const defaultSortedColumn = flatFilter(
      columns || [],
      column => column.defaultSortOrder != null,
    )[0];

    if (defaultSortedColumn && !definedSortState.sortColumn) {
      return {
        sortColumn: defaultSortedColumn,
        sortOrder: defaultSortedColumn.defaultSortOrder,
      };
    }

    return definedSortState;
  };

  getSorterFn() {
    const { sortOrder, sortColumn } = this.state;
    if (!sortOrder || !sortColumn || typeof sortColumn.sorter !== 'function') {
      return false;
    }
    return (a, b) => {
      const result = sortColumn && sortColumn.sorter(a, b);
      if (result !== 0) {
        return sortOrder === 'descend' ? -result : result;
      }
      return 0;
    };
  }

  getFiltersFromColumns = (columns) => {
    const filters = {};
    getFilteredValueColumns(columns).forEach((col) => {
      const colKey = getColumnKey(col);
      if ('filteredValue' in col && col.filteredValue !== null && col.filteredValue !== undefined) {
        filters[colKey] = col.filteredValue;
      }
    });
    return filters;
  };

  getDefaultPagination(props) {
    const pagination = props.pagination || {};

    return this.hasPagination(props)
      ? {
        onChange: () => {},
        ...pagination,
        current: pagination.defaultCurrent || pagination.current || 1,
        pageSize: pagination.defaultPageSize || pagination.pageSize || 10,
      }
      : {};
  }

  getCurrentPageData() {
    let data = this.getLocalData();
    let current;
    const { pagination } = this.state;
    let { pageSize } = pagination;
    if (!this.hasPagination()) {
      pageSize = Number.MAX_VALUE;
      current = 1;
    } else {
      current = this.getMaxCurrent(pagination.total || data.length);
    }

    if (data.length > pageSize || pageSize === Number.MAX_VALUE) {
      data = data.filter((item, i) => i >= (current - 1) * pageSize && i < current * pageSize);
    }
    return data;
  }

  getLocalData() {
    const { state } = this;
    const { dataSource } = this.props;
    let data = dataSource || [];
    data = data.slice(0);
    const sorterFn = this.getSorterFn();
    if (sorterFn) {
      data = this.recursiveSort(data, sorterFn);
    }
    if (state.filters) {
      Object.keys(state.filters).forEach((columnKey) => {
        const col = this.findColumn(columnKey);
        if (!col) {
          return;
        }
        const values = state.filters[columnKey] || [];
        if (values.length === 0) {
          return;
        }
        const { onFilter } = col;
        data = onFilter ? data.filter(record => values.some(v => onFilter(v, record))) : data;
      });
    }
    return data;
  }

  getFlatData = () => flatArray(this.getLocalData());

  getFlatCurrentPageData = () => flatArray(this.getCurrentPageData());

  getRecordKey = (record, index) => {
    const { rowKey } = this.props;
    const recordKey = typeof rowKey === 'function' ? rowKey(record, index) : record[rowKey];
    return recordKey === undefined ? index : recordKey;
  };

  getDefaultSelection() {
    const { rowSelection = {} } = this.props;
    if (!rowSelection.getCheckboxProps) {
      return [];
    }
    return this.getFlatData()
      .filter((item, rowIndex) => this.getCheckboxPropsByItem(item, rowIndex).defaultChecked)
      .map((record, rowIndex) => this.getRecordKey(record, rowIndex));
  }

  getCheckboxPropsByItem = (item, index) => {
    const { rowSelection = {} } = this.props;
    if (!rowSelection.getCheckboxProps) {
      return {};
    }
    const key = this.getRecordKey(item, index);
    if (!this.CheckboxPropsCache[key]) {
      this.CheckboxPropsCache[key] = rowSelection.getCheckboxProps(item);
    }
    return this.CheckboxPropsCache[key];
  };

  getMaxCurrent(total) {
    const { pagination } = this.state;
    const { current, pageSize } = pagination;
    if ((current - 1) * pageSize >= total) {
      return Math.floor((total - 1) / pageSize) + 1;
    }
    return current;
  }

  handleFilterDropdownClick = (value, column) => {
    if (value.action === 'sort') {
      this.toggleSortOrder(value.type, column);
    }
    if (value.action === 'filter') {
      this.handleFilter(value.type, column);
    }
    if (value.action === 'hidden') {
      this.handleHideColumn(column);
    }
  };

  handlePageChange = (current, ...otherArguments) => {
    const { props } = this;
    const { pagination: statePagination } = this.state;
    const pagination = { ...statePagination };
    if (current) {
      pagination.current = current;
    } else {
      pagination.current = pagination.current || 1;
    }
    pagination.onChange(pagination.current, ...otherArguments);

    const newState = {
      pagination,
    };
    if (props.pagination && typeof props.pagination === 'object' && 'current' in props.pagination) {
      newState.pagination = {
        ...pagination,
        current: statePagination.current,
      };
    }
    this.setState(newState);

    this.store.setState({
      selectionDirty: false,
    });

    const { onChange } = this.props;
    if (typeof onChange === 'function') {
      onChange(
        ...this.prepareParamsArguments({
          ...this.state,
          selectionDirty: false,
          pagination,
        }),
      );
    }
  };

  handleFilter = (nextFilters, column) => {
    const { props } = this;
    const { pagination: statePagination, filters: stateFilters, columns } = this.state;
    const pagination = { ...statePagination };
    const colKey = getColumnKey(column);
    const newFilter = { [colKey]: nextFilters };
    const filters = {
      ...stateFilters,
      ...newFilter,
    };

    if (stateFilters[colKey] === nextFilters) {
      delete filters[colKey];
    }

    const currentColumnKeys = [];

    treeMap(columns, (col) => {
      if (!col.children) {
        currentColumnKeys.push(getColumnKey(col));
      }
    });

    Object.keys(filters).forEach((columnKey) => {
      if (currentColumnKeys.indexOf(columnKey) < 0) {
        delete filters[columnKey];
      }
    });

    if (props.pagination) {
      pagination.current = 1;
      pagination.onChange(pagination.current);
    }

    const newState = {
      pagination,
      filters: {},
    };

    const filtersToSetState = { ...filters };

    getFilteredValueColumns(columns).forEach((col) => {
      const columnKey = getColumnKey(col);
      if (columnKey) {
        delete filtersToSetState[columnKey];
      }
    });

    if (Object.keys(filtersToSetState).length > 0) {
      newState.filters = filtersToSetState;
    }

    if (typeof props.pagination === 'object' && 'current' in props.pagination) {
      newState.pagination = {
        ...pagination,
        current: statePagination.current,
      };
    }

    this.setState(newState, () => {
      this.store.setState({
        selectionDirty: false,
      });
      const { onChange } = this.props;
      if (onChange) {
        onChange(
          ...this.prepareParamsArguments({
            ...this.state,
            selectionDirty: false,
            filters,
            pagination,
          }),
        );
      }
    });
  };

  handleHideColumn = (column) => {
    const { hiddenCols } = this.state;
    const { onHideColumn } = this.props;
    const columnKey = getColumnKey(column);
    const newHiddenCols = [...hiddenCols];
    if (hiddenCols.indexOf(columnKey) === -1) {
      newHiddenCols.push(columnKey);
    }
    this.setState({ hiddenCols: newHiddenCols }, () => {
      if (onHideColumn) {
        onHideColumn(newHiddenCols);
      }
    });
  };

  handleSelect = (record, rowIndex, e) => {
    const { checked } = e.target;
    const { nativeEvent } = e;
    const defaultSelection = this.store.getState().selectionDirty ? [] : this.getDefaultSelection();
    let selectedRowKeys = this.store.getState().selectedRowKeys.concat(defaultSelection);
    const key = this.getRecordKey(record, rowIndex);
    if (checked) {
      selectedRowKeys.push(this.getRecordKey(record, rowIndex));
    } else {
      selectedRowKeys = selectedRowKeys.filter(i => key !== i);
    }

    this.store.setState({
      selectionDirty: true,
    });

    this.setSelectedRowKeys(selectedRowKeys, {
      selectWay: 'onSelect',
      record,
      checked,
      changeRowKeys: undefined,
      nativeEvent,
    });

    this.setState({ hasSelected: selectedRowKeys.length > 0 });
  };

  handleRadioSelect = (record, rowIndex, e) => {
    const { checked } = e.target.checked;
    const { nativeEvent } = e;
    const defaultSelection = this.store.getState().selectionDirty ? [] : this.getDefaultSelection();
    let selectedRowKeys = this.store.getState().selectedRowKeys.concat(defaultSelection);
    const key = this.getRecordKey(record, rowIndex);
    selectedRowKeys = [key];
    this.store.setState({
      selectionDirty: true,
    });
    this.setSelectedRowKeys(selectedRowKeys, {
      selectWay: 'onSelect',
      record,
      checked,
      changeRowKeys: undefined,
      nativeEvent,
    });
  };

  handleSelectRow = (selectionKey) => {
    const data = this.getFlatCurrentPageData();
    const defaultSelection = this.store.getState().selectionDirty ? [] : this.getDefaultSelection();
    const selectedRowKeys = this.store.getState().selectedRowKeys.concat(defaultSelection);
    const changeableRowKeys = data
      .filter((item, i) => !this.getCheckboxPropsByItem(item, i).disabled)
      .map((item, i) => this.getRecordKey(item, i));
    const changeRowKeys = [];
    let selectWay = '';
    let checked;
    switch (selectionKey) {
      case 'all':
        changeableRowKeys.forEach((key) => {
          if (selectedRowKeys.indexOf(key) < 0) {
            selectedRowKeys.push(key);
            changeRowKeys.push(key);
          }
        });
        selectWay = 'onSelectAll';
        checked = true;
        break;
      case 'removeAll':
        changeableRowKeys.forEach((key) => {
          if (selectedRowKeys.indexOf(key) >= 0) {
            selectedRowKeys.splice(selectedRowKeys.indexOf(key), 1);
            changeRowKeys.push(key);
          }
        });
        selectWay = 'onSelectAll';
        checked = false;
        break;
      case 'invert':
        changeableRowKeys.forEach((key) => {
          if (selectedRowKeys.indexOf(key) < 0) {
            selectedRowKeys.push(key);
          } else {
            selectedRowKeys.splice(selectedRowKeys.indexOf(key), 1);
          }
          changeRowKeys.push(key);
          selectWay = 'onSelectInvert';
        });
        break;
      default:
        break;
    }

    this.store.setState({
      selectionDirty: true,
    });
    this.setSelectedRowKeys(selectedRowKeys, {
      selectWay,
      checked,
      changeRowKeys,
    });
    return false;
  };

  recursiveSort = (data, sorterFn) => {
    const { childrenColumnName } = this.props;
    return data.sort(sorterFn).map(item => (item[childrenColumnName]
      ? {
        ...item,
        [childrenColumnName]: this.recursiveSort(item[childrenColumnName], sorterFn),
      }
      : item));
  };

  findColumn = (Key) => {
    const { columns } = this.state;
    let column;
    treeMap(columns, (c) => {
      if (getColumnKey(c) === Key) {
        column = c;
      }
    });
    return column;
  };

  isSortColumn = (column) => {
    const { sortColumn } = this.state;
    if (!column || !sortColumn) {
      return false;
    }
    return getColumnKey(sortColumn) === getColumnKey(column);
  };

  prepareParamsArguments = (state) => {
    const pagination = { ...state.pagination };
    delete pagination.onChange;
    delete pagination.onShowSizeChange;
    const { filters } = state;
    const sorter = {};
    if (state.sortColumn && state.sortOrder) {
      sorter.column = state.sortColumn;
      sorter.order = state.sortOrder;
      sorter.field = state.sortColumn.dataIndex;
      sorter.columnKey = getColumnKey(state.sortColumn);
    }
    return [pagination, filters, sorter];
  };

  toggleSortOrder = (order, column) => {
    let { sortColumn, sortOrder } = this.state;
    const { columns } = this.state;
    const isSortColumn = this.isSortColumn(column);
    if (!isSortColumn) {
      sortOrder = order;
      sortColumn = column;
    } else if (sortOrder === order) {
      sortOrder = '';
      sortColumn = null;
    } else {
      sortOrder = order;
    }

    const newState = {
      sortOrder,
      sortColumn,
    };

    if (getSortOrderColumns(columns).length === 0) {
      this.setState(newState);
    }

    const { onChange } = this.props;
    if (onChange) {
      onChange(
        ...this.prepareParamsArguments({
          ...this.state,
          ...newState,
        }),
      );
    }
  };

  hasPagination = (props = this.props) => !('footer' in props) && 'pagination' in props;

  renderColumnsDropdown(columns) {
    const { prefixCls, dropdownPrefixCls } = this.props;
    const { sortOrder, filters } = this.state;
    return treeMap(columns, (originColumn, i) => {
      const column = { ...originColumn };
      const key = getColumnKey(column, i);
      let filterDropdown = null;
      let sortButton;
      if ((column.filters && column.filters.length > 0) || column.sorter || column.hideable) {
        const colFilters = filters[key] || [];
        filterDropdown = (
          <FilterDropdown
            key={key}
            column={column}
            enableSort={column.sorter}
            selectedKeys={colFilters}
            hideable={column.hideable}
            label={column.title}
            onClick={this.handleFilterDropdownClick}
            prefixCls={`${prefixCls}-filter`}
            dropdownPrefixCls={dropdownPrefixCls || 'dropdown'}
            getPopupContainer={this.getPopupContainer}
          />
        );
      }
      if (column.sorter) {
        const isSortColumn = this.isSortColumn(column);
        if (isSortColumn) {
          column.className = classNames(column.className, {
            [`${prefixCls}-column-sort`]: sortOrder,
          });
        }
        const isAscend = isSortColumn && sortOrder === 'ascend';
        const isDescend = isSortColumn && sortOrder === 'descend';

        sortButton = (
          <div className={`${prefixCls}-column-sorter`}>
            {isAscend ? (
              <span className={`${prefixCls}-column-sorter-up`}>
                <Icon
                  name="sort-ascending"
                  size={16}
                  type="coloured"
                />
              </span>
            ) : null}
            {isDescend ? (
              <span className={`${prefixCls}-column-sorter-down`}>
                <Icon
                  name="sort-descending"
                  size={16}
                  type="coloured"
                />
              </span>
            ) : null}
          </div>
        );
      }

      column.title = (
        <span key={key}>
          {filterDropdown || column.title}
          {sortButton}
        </span>
      );

      if (sortButton || filterDropdown) {
        column.className = classNames(`${prefixCls}-column-has-filters`, column.className);
      }

      return column;
    });
  }

  renderSelectionBox = type => (_, record, index) => {
    const rowIndex = this.getRecordKey(record, index);
    const props = this.getCheckboxPropsByItem(record, index);
    const handleChange = (e) => {
      if (type === 'radio') {
        this.handleRadioSelect(record, rowIndex, e);
      } else {
        this.handleSelect(record, rowIndex, e);
      }
    };

    return (
      <span onClick={stopPropagation}>
        <SelectionBox
          type={type}
          store={this.store}
          rowIndex={rowIndex}
          onChange={handleChange}
          defaultSelection={this.getDefaultSelection()}
          {...props}
        />
      </span>
    );
  };

  renderRowSelection() {
    const { prefixCls, rowSelection } = this.props;
    const { columns: stateColumns } = this.state;
    const columns = stateColumns.concat();
    if (rowSelection) {
      const data = this.getFlatCurrentPageData().filter((item, index) => {
        if (rowSelection.getCheckboxProps) {
          return !this.getCheckboxPropsByItem(item, index).disabled;
        }
        return true;
      });
      const selectionColumnClass = classNames(`${prefixCls}-selection-column`, {
        [`${prefixCls}-selection-column-custom`]: rowSelection.selections,
      });
      const selectionColumn = {
        key: 'selection-column',
        render: this.renderSelectionBox(rowSelection.type),
        className: selectionColumnClass,
        fixed: rowSelection.fixed,
        width: rowSelection.columnWidth,
      };
      if (rowSelection.type !== 'radio') {
        const disabled = data.every((n, i) => this.getCheckboxPropsByItem(n, i).disabled);
        selectionColumn.title = (
          <SelectionCheckboxAll
            store={this.store}
            data={data}
            getCheckboxPropsByItem={this.getCheckboxPropsByItem}
            getRecordKey={this.getRecordKey}
            disabled={disabled}
            prefixCls={prefixCls}
            onSelect={this.handleSelectRow}
            selections={rowSelection.selections}
            hideDefaultSelections={rowSelection.hideDefaultSelections}
            getPopupContainer={this.getPopupContainer}
          />
        );
      }
      if ('fixed' in rowSelection) {
        selectionColumn.fixed = rowSelection.fixed;
      } else if (columns.some(column => column.fixed === 'left' || column.fixed === true)) {
        selectionColumn.fixed = 'left';
      }
      if (columns[0] && columns[0].key === 'selection-column') {
        columns[0] = selectionColumn;
      } else {
        columns.unshift(selectionColumn);
      }
    }
    return columns;
  }

  renderPagination(paginationPosition) {
    if (!this.hasPagination()) {
      return null;
    }

    const { prefixCls } = this.props;
    const { pagination } = this.state;
    const position = pagination.position || 'bottom';
    const total = pagination.total || this.getLocalData().length;
    return total > 0 && (position === paginationPosition || position === 'both') ? (
      <Pagination
        isFullwidth
        placement="right"
        key={`pagination-${paginationPosition}`}
        className={classNames(pagination.className, `${prefixCls}-pagination`)}
        current={this.getMaxCurrent(total)}
        total={total}
        pageSize={pagination.pageSize}
        onChange={this.handlePageChange}
      />
    ) : null;
  }

  renderTable = () => {
    const {
      style,
      className,
      prefixCls,
      dataSource,
      showHeader,
      expandedRowRender,
      bordered,
      expandIcons,
      expandIconAsCell: propsExpandIconAsCell,
      ...restProps
    } = this.props;
    const {
      hiddenCols, hasSelected, components, columns: stateColumns,
    } = this.state;
    const data = dataSource;
    const expandIconAsCell = expandedRowRender && propsExpandIconAsCell !== false;

    const classString = classNames({
      [`${prefixCls}-bordered`]: bordered,
      [`${prefixCls}-empty`]: !data.length,
      [`${prefixCls}-without-column-header`]: !showHeader,
      [`${prefixCls}-hasSelected`]: hasSelected,
    });
    // eslint-disable-next-line
    let columns = stateColumns;

    columns = this.renderRowSelection();
    columns = this.renderColumnsDropdown(columns);
    columns = columns.map((column, i) => {
      const newColumn = { ...column };
      newColumn.key = getColumnKey(newColumn, i);
      return newColumn;
    });

    hiddenCols.forEach((key) => {
      columns.forEach((column, index) => {
        if (column.key === key) {
          columns.splice(index, 1);
        }
      });
    });

    if (!('expandIconColumnIndex' in restProps)) {
      restProps.expandIconColumnIndex = columns[0] && columns[0].key === 'selection-column' ? 1 : 0;
    }

    return (
      <MainTable
        key="table"
        {...restProps}
        onRow={this.onRow}
        prefixCls={prefixCls}
        data={data}
        components={components}
        columns={columns}
        showHeader={showHeader}
        className={classString}
        expandIconAsCell={expandIconAsCell}
        expandedRowRender={expandedRowRender}
        expandIcons={expandIcons}
      />
    );
  };

  render() {
    const { prefixCls, className, style } = this.props;
    let { loading } = this.props;

    if (typeof loading === 'boolean') {
      loading = {
        spinning: loading,
      };
    }
    return (
      <Loading
        {...loading}
        size="large"
      >
        <div
          className={classNames(`${prefixCls}-wrapper`, className)}
          style={style}
        >
          {this.renderPagination('top')}
          {this.renderTable(loading)}
          {this.renderPagination('bottom')}
        </div>
      </Loading>
    );
  }
}

export default Table;
