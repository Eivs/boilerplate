import React from 'react';
import { warning } from '../../utils';
import CreateBodyRow from './CreateBodyRow';

let scrollbarSize;

const scrollbarMeasure = {
  position: 'absolute',
  top: '-9999px',
  width: '50px',
  height: '50px',
  overflow: 'scroll',
};

export function measureScrollbar(direction = 'vertical') {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return 0;
  }
  if (scrollbarSize) {
    return scrollbarSize;
  }
  const scrollDiv = document.createElement('div');
  Object.keys(scrollbarMeasure).forEach(scrollProp => {
    scrollDiv.style[scrollProp] = scrollbarMeasure[scrollProp];
  });
  document.body.appendChild(scrollDiv);
  let size = 0;
  if (direction === 'vertical') {
    size = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  } else if (direction === 'horizontal') {
    size = scrollDiv.offsetHeight - scrollDiv.clientHeight;
  }

  document.body.removeChild(scrollDiv);
  scrollbarSize = size;
  return scrollbarSize;
}

export function debounce(func, wait, immediate) {
  let timeout;
  function debounceFunc(...args) {
    const context = this;
    // https://fb.me/react-event-pooling
    if (args[0] && args[0].persist) {
      args[0].persist();
    }
    const later = () => {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      func.apply(context, args);
    }
  }
  debounceFunc.cancel = function cancel() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  return debounceFunc;
}

const warned = {};

export function warningOnce(condition, format, args) {
  if (!warned[format]) {
    warning(condition, format, args);
    warned[format] = !condition;
  }
}

export function remove(array, item) {
  const index = array.indexOf(item);
  const front = array.slice(0, index);
  const last = array.slice(index + 1, array.length);
  return front.concat(last);
}

export function createStore(initialState) {
  let state = initialState;
  const listeners = [];

  function setState(partial) {
    state = {
      ...state,
      ...partial,
    };
    for (let i = 0; i < listeners.length; i += 1) {
      listeners[i]();
    }
  }

  function getState() {
    return state;
  }

  function subscribe(listener) {
    listeners.push(listener);

    return function unsubscribe() {
      const index = listeners.indexOf(listener);
      listeners.splice(index, 1);
    };
  }

  return {
    setState,
    getState,
    subscribe,
  };
}

export function treeMap(tree, mapper, childrenName = 'children') {
  return tree.map((node, index) => {
    const extra = {};
    if (node[childrenName]) {
      extra[childrenName] = treeMap(node[childrenName], mapper, childrenName);
    }
    return {
      ...mapper(node, index),
      ...extra,
    };
  });
}

export function flatFilter(tree, callback) {
  return tree.reduce((acc, node) => {
    if (callback(node)) {
      acc.push(node);
    }
    if (node.children) {
      const children = flatFilter(node.children, callback);
      acc.push(...children);
    }
    return acc;
  }, []);
}

export function flatArray(data, childrenName = 'children') {
  const result = [];
  const loop = array => {
    array.forEach(item => {
      if (item[childrenName]) {
        const newItem = { ...item };
        delete newItem[childrenName];
        result.push(newItem);
        if (item[childrenName].length > 0) {
          loop(item[childrenName]);
        }
      } else {
        result.push(item);
      }
    });
  };
  loop(data);
  return result;
}

export function normalizeColumns(elements) {
  const columns = [];
  React.Children.forEach(elements, element => {
    if (!React.isValidElement(element)) {
      return;
    }
    const column = {
      ...element.props,
    };
    if (element.key) {
      column.key = element.key;
    }
    if (element.type && element.type.TABLE_COLUMN_GROUP) {
      column.children = normalizeColumns(column.children);
    }
    columns.push(column);
  });
  return columns;
}

export function stopPropagation(e) {
  e.stopPropagation();
  if (e.nativeEvent.stopImmediatePropagation) {
    e.nativeEvent.stopImmediatePropagation();
  }
}

export function getDataAndAriaProps(props) {
  return Object.keys(props).reduce((memo, key) => {
    if (key.substr(0, 5) === 'data-' || key.substr(0, 5) === 'aria-') {
      memo[key] = props[key]; // eslint-disable-line no-param-reassign
    }
    return memo;
  }, {});
}

export function createComponents(components, prevComponents) {
  const bodyRow = components && components.body && components.body.row;
  const preBodyRow = prevComponents && prevComponents.body && prevComponents.body.row;
  const newComponents = { ...components, body: { ...components.body } };
  if (prevComponents === undefined || bodyRow !== preBodyRow) {
    newComponents.body.row = CreateBodyRow(bodyRow);
  }
  return newComponents;
}

export function getColumnKey(column, index) {
  return column.key || column.dataIndex || index;
}

export function getFilteredValueColumns(columns) {
  return flatFilter(columns || [], column => typeof column.filteredValue !== 'undefined');
}

export function getSortOrderColumns(columns) {
  return flatFilter(columns || [], column => 'sortOrder' in column);
}

export function getFiltersFromColumns(columns) {
  const filters = {};
  getFilteredValueColumns(columns).forEach(col => {
    const colKey = getColumnKey(col);
    if ('filteredValue' in col && col.filteredValue !== null && col.filteredValue !== undefined) {
      filters[colKey] = col.filteredValue;
    }
  });
  return filters;
}

export function getSortStateFromColumns(columns) {
  const sortedColumn = getSortOrderColumns(columns).filter(col => col.sortOrder)[0];

  if (sortedColumn) {
    return {
      sortColumn: sortedColumn,
      sortOrder: sortedColumn.sortOrder,
    };
  }

  return {
    sortColumn: null,
    sortOrder: null,
  };
}

export function isFiltersChanged(filters, stateFilters) {
  let filtersChanged = false;
  if (Object.keys(filters).length !== Object.keys(stateFilters).length) {
    filtersChanged = true;
  } else {
    Object.keys(filters).forEach(columnKey => {
      if (filters[columnKey] !== stateFilters[columnKey]) {
        filtersChanged = true;
      }
    });
  }
  return filtersChanged;
}
