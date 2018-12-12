import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import classes from 'component-classes';
import { merge } from 'lodash';
import { Provider, create } from '../../../utils/mini-store';
import shallowEqual from '../../../utils/shallowEqual';
import { debounce, getDataAndAriaProps } from '../tableUtils';
import ColumnManager from './ColumnManager';
import HeadTable from './HeadTable';
import BodyTable from './BodyTable';
import ExpandableTable from './ExpandableTable';

class Table extends PureComponent {
  static propTypes = {
    data: PropTypes.array,
    useFixedHeader: PropTypes.bool,
    columns: PropTypes.array,
    prefixCls: PropTypes.string,
    bodyStyle: PropTypes.object,
    style: PropTypes.object,
    rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    rowClassName: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    onRow: PropTypes.func,
    onHeaderRow: PropTypes.func,
    onRowClick: PropTypes.func,
    onRowDoubleClick: PropTypes.func,
    onRowContextMenu: PropTypes.func,
    onRowMouseEnter: PropTypes.func,
    onRowMouseLeave: PropTypes.func,
    showHeader: PropTypes.bool,
    title: PropTypes.func,
    id: PropTypes.string,
    footer: PropTypes.func,
    emptyText: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
    scroll: PropTypes.object,
    rowRef: PropTypes.func,
    getBodyWrapper: PropTypes.func,
    children: PropTypes.node,
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
    ...ExpandableTable.PropTypes,
  };

  static childContextTypes = {
    table: PropTypes.any,
    components: PropTypes.any,
  };

  static defaultProps = {
    data: [],
    useFixedHeader: false,
    rowKey: 'key',
    rowClassName: () => '',
    onRow() {},
    onHeaderRow() {},
    prefixCls: 'table',
    bodyStyle: {},
    style: {},
    showHeader: true,
    scroll: {},
    rowRef: () => null,
    emptyText: null,
  };

  constructor(props) {
    super(props);

    this.columnManager = new ColumnManager(props.columns, props.children);

    this.store = create({
      currentHoverKey: null,
      fixedColumnsHeadRowsHeight: [],
      fixedColumnsBodyRowsHeight: {},
    });

    this.setScrollPosition('left');

    this.debouncedWindowResize = debounce(this.handleWindowResize, 150);
  }

  state = {};

  getChildContext() {
    const { components } = this.props;
    return {
      table: {
        props: this.props,
        columnManager: this.columnManager,
        saveRef: this.saveRef,
        components: merge(
          {
            table: 'table',
            header: {
              wrapper: 'thead',
              row: 'tr',
              cell: 'th',
            },
            body: {
              wrapper: 'tbody',
              row: 'tr',
              cell: 'td',
            },
          },
          components,
        ),
      },
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.columns && nextProps.columns !== prevState.columns) {
      return {
        columns: nextProps.columns,
        children: null,
      };
    }
    if (nextProps.children !== prevState.children) {
      return {
        columns: null,
        children: nextProps.children,
      };
    }
    return null;
  }

  componentDidMount() {
    if (this.columnManager.isAnyColumnsFixed()) {
      this.handleWindowResize();
      window.addEventListener('resize', this.debouncedWindowResize, false);
      this.resizeEvent = true;
    }

    if (this.headTable) {
      this.headTable.scrollLeft = 0;
    }
    if (this.bodyTable) {
      this.bodyTable.scrollLeft = 0;
    }
  }

  componentDidUpdate(prevProps) {
    const { data } = this.props;
    if (this.columnManager.isAnyColumnsFixed()) {
      this.handleWindowResize();
      if (!this.resizeEvent) {
        window.addEventListener('resize', this.debouncedWindowResize, false);
        this.resizeEvent = true;
      }
    }

    if (prevProps.data.length > 0 && data.length === 0 && this.hasScrollX()) {
      this.resetScrollX();
    }
  }

  componentWillUnmount() {
    if (this.resizeEvent) {
      window.removeEventListener('resize', this.debouncedWindowResize, false);
    }
    if (typeof this.debouncedWindowResize === 'function' && this.debouncedWindowResize.cancel) {
      this.debouncedWindowResize.cancel();
    }
  }

  getRowKey = (record, index) => {
    const { rowKey } = this.props;
    const key = typeof rowKey === 'function' ? rowKey(record, index) : record[rowKey];
    return key === undefined ? index : key;
  };

  setScrollPosition(position) {
    this.scrollPosition = position;
    if (this.tableNode) {
      const { prefixCls } = this.props;
      if (position === 'both') {
        classes(this.tableNode)
          .remove(new RegExp(`^${prefixCls}-scroll-position-.+$`))
          .add(`${prefixCls}-scroll-position-left`)
          .add(`${prefixCls}-scroll-position-right`);
      } else {
        classes(this.tableNode)
          .remove(new RegExp(`^${prefixCls}-scroll-position-.+$`))
          .add(`${prefixCls}-scroll-position-${position}`);
      }
    }
  }

  setScrollPositionClassName() {
    const node = this.bodyTable;
    if (!node) return; // TODO remove
    const scrollToLeft = node.scrollLeft === 0;
    const firstNode = node.children[0];
    const width = firstNode.getBoundingClientRect().width - node.getBoundingClientRect().width;
    const scrollToRight = node.scrollLeft + 1 >= width;
    if (scrollToLeft && scrollToRight) {
      this.setScrollPosition('both');
    } else if (scrollToLeft) {
      this.setScrollPosition('left');
    } else if (scrollToRight) {
      this.setScrollPosition('right');
    } else if (this.scrollPosition !== 'middle') {
      this.setScrollPosition('middle');
    }
  }

  handleWindowResize = () => {
    this.syncFixedTableRowHeight();
    this.setScrollPositionClassName();
  };

  syncFixedTableRowHeight = () => {
    if (!this.tableNode) return; // TODO remove
    const tableRect = this.tableNode.getBoundingClientRect();

    if (tableRect.height !== undefined && tableRect.height <= 0) {
      return;
    }

    const { prefixCls } = this.props;
    const headRows = this.headTable
      ? this.headTable.querySelectorAll('thead')
      : this.bodyTable.querySelectorAll('thead');
    const bodyRows = this.bodyTable.querySelectorAll(`.${prefixCls}-row`) || [];
    const fixedColumnsHeadRowsHeight = [].map.call(
      headRows,
      row => row.getBoundingClientRect().height || 'auto',
    );

    const state = this.store.getState();

    const fixedColumnsBodyRowsHeight = [].reduce.call(
      bodyRows,
      (acc, row) => {
        const rowKey = row.getAttribute('data-row-key');
        const height =
          row.getBoundingClientRect().height || state.fixedColumnsBodyRowsHeight[rowKey] || 'auto';
        acc[rowKey] = height;
        return acc;
      },
      {},
    );

    if (
      shallowEqual(state.fixedColumnsHeadRowsHeight, fixedColumnsHeadRowsHeight) &&
      shallowEqual(state.fixedColumnsBodyRowsHeight, fixedColumnsBodyRowsHeight)
    ) {
      return;
    }

    this.store.setState({
      fixedColumnsHeadRowsHeight,
      fixedColumnsBodyRowsHeight,
    });
  };

  saveRef = name => node => {
    this[name] = node;
  };

  handleBodyScrollLeft = e => {
    const { target, currentTarget } = e;
    const { scroll = {} } = this.props;
    const { headTable, bodyTable } = this;

    if (currentTarget !== target) {
      return;
    }

    if (target.scrollLeft !== this.lastScrollLeft && scroll.x) {
      if (target === bodyTable && headTable) {
        headTable.scrollLeft = target.scrollLeft;
      } else if (target === headTable && bodyTable) {
        bodyTable.scrollLeft = target.scrollLeft;
      }
      this.setScrollPositionClassName();
    }

    this.lastScrollLeft = target.scrollLeft;
  };

  handleBodyScrollTop = e => {
    const { target, currentTarget } = e;

    if (currentTarget !== target) {
      return;
    }

    const { scroll = {} } = this.props;
    const { headTable, bodyTable, fixedColumnsBodyLeft, fixedColumnsBodyRight } = this;

    if (target.scrollTop !== this.lastScrollTop && scroll.y && target !== headTable) {
      const { scrollTop } = target;
      if (fixedColumnsBodyLeft && target !== fixedColumnsBodyLeft) {
        fixedColumnsBodyLeft.scrollTop = scrollTop;
      }
      if (fixedColumnsBodyRight && target !== fixedColumnsBodyRight) {
        fixedColumnsBodyRight.scrollTop = scrollTop;
      }
      if (bodyTable && target !== bodyTable) {
        bodyTable.scrollTop = scrollTop;
      }
    }

    this.lastScrollTop = target.scrollTop;
  };

  handleBodyScroll = e => {
    this.handleBodyScrollLeft(e);
    this.handleBodyScrollTop(e);
  };

  handleWheel = event => {
    const { scroll = {} } = this.props;
    if (window.navigator.userAgent.match(/Trident\/7\./) && scroll.y) {
      event.preventDefault();
      const wd = event.deltaY;
      const { target } = event;
      const { bodyTable, fixedColumnsBodyLeft, fixedColumnsBodyRight } = this;
      let scrollTop = 0;

      if (this.lastScrollTop) {
        scrollTop = this.lastScrollTop + wd;
      } else {
        scrollTop = wd;
      }

      if (fixedColumnsBodyLeft && target !== fixedColumnsBodyLeft) {
        fixedColumnsBodyLeft.scrollTop = scrollTop;
      }
      if (fixedColumnsBodyRight && target !== fixedColumnsBodyRight) {
        fixedColumnsBodyRight.scrollTop = scrollTop;
      }
      if (bodyTable && target !== bodyTable) {
        bodyTable.scrollTop = scrollTop;
      }
    }
  };

  resetScrollX() {
    if (this.headTable) {
      this.headTable.scrollLeft = 0;
    }

    if (this.bodyTable) {
      this.bodyTable.scrollLeft = 0;
    }
  }

  hasScrollX() {
    const { scroll = {} } = this.props;
    return 'x' in scroll;
  }

  renderMainTable() {
    const { scroll, prefixCls } = this.props;
    const isAnyColumnsFixed = this.columnManager.isAnyColumnsFixed();
    const scrollable = isAnyColumnsFixed || scroll.x || scroll.y;

    const table = [
      this.renderTable({
        columns: this.columnManager.groupedColumns(),
        isAnyColumnsFixed,
      }),
      this.renderEmptyText(),
      this.renderFooter(),
    ];

    return scrollable ? <div className={`${prefixCls}-scroll`}>{table}</div> : table;
  }

  renderLeftFixedTable() {
    const { prefixCls } = this.props;

    return (
      <div className={`${prefixCls}-fixed-left`}>
        {this.renderTable({
          columns: this.columnManager.leftColumns(),
          fixed: 'left',
        })}
      </div>
    );
  }

  renderRightFixedTable() {
    const { prefixCls } = this.props;

    return (
      <div className={`${prefixCls}-fixed-right`}>
        {this.renderTable({
          columns: this.columnManager.rightColumns(),
          fixed: 'right',
        })}
      </div>
    );
  }

  renderTable(options) {
    const { columns, fixed, isAnyColumnsFixed } = options;
    const { prefixCls, scroll = {} } = this.props;
    const tableClassName = scroll.x || fixed ? `${prefixCls}-fixed` : '';

    const headTable = (
      <HeadTable
        key="head"
        columns={columns}
        fixed={fixed}
        tableClassName={tableClassName}
        handleBodyScrollLeft={this.handleBodyScrollLeft}
        expander={this.expander}
      />
    );

    const bodyTable = (
      <BodyTable
        key="body"
        columns={columns}
        fixed={fixed}
        tableClassName={tableClassName}
        getRowKey={this.getRowKey}
        handleWheel={this.handleWheel}
        handleBodyScroll={this.handleBodyScroll}
        expander={this.expander}
        isAnyColumnsFixed={isAnyColumnsFixed}
      />
    );

    return [headTable, bodyTable];
  }

  renderTitle() {
    const { title, prefixCls, data } = this.props;
    return title ? (
      <div className={`${prefixCls}-title`} key="title">
        {title(data)}
      </div>
    ) : null;
  }

  renderFooter() {
    const { footer, prefixCls, data } = this.props;
    return footer ? (
      <div className={`${prefixCls}-footer`} key="footer">
        {footer(data)}
      </div>
    ) : null;
  }

  renderEmptyText() {
    const { emptyText, prefixCls, data } = this.props;
    if (data.length) {
      return null;
    }

    const emptyClassName = `${prefixCls}-placeholder`;
    return (
      <div className={emptyClassName} key="emptyText">
        {typeof emptyText === 'function' ? emptyText() : emptyText}
      </div>
    );
  }

  render() {
    const { props } = this;
    const { prefixCls } = props;
    const { columns, children } = this.state;

    if (columns) {
      this.columnManager.reset(props.columns);
    } else if (children) {
      this.columnManager.reset(null, props.children);
    }

    let className = props.prefixCls;

    if (props.className) {
      className += ` ${props.className}`;
    }

    if (props.useFixedHeader || (props.scroll && props.scroll.y)) {
      className += ` ${prefixCls}-fixed-header`;
    }

    if (this.scrollPosition === 'both') {
      className += ` ${prefixCls}-scroll-position-left ${prefixCls}-scroll-position-right`;
    } else {
      className += ` ${prefixCls}-scroll-position-${this.scrollPosition}`;
    }

    const hasLeftFixed = this.columnManager.isAnyColumnsLeftFixed();
    const hasRightFixed = this.columnManager.isAnyColumnsRightFixed();
    const dataAndAriaProps = getDataAndAriaProps(props);

    return (
      <Provider store={this.store}>
        <ExpandableTable {...props} columnManager={this.columnManager} getRowKey={this.getRowKey}>
          {expander => {
            this.expander = expander;
            return (
              <div
                ref={this.saveRef('tableNode')}
                className={className}
                style={props.style}
                id={props.id}
                {...dataAndAriaProps}
              >
                {this.renderTitle()}
                <div className={`${prefixCls}-content`}>
                  {this.renderMainTable()}
                  {hasLeftFixed && this.renderLeftFixedTable()}
                  {hasRightFixed && this.renderRightFixedTable()}
                </div>
              </div>
            );
          }}
        </ExpandableTable>
      </Provider>
    );
  }
}

export default Table;
