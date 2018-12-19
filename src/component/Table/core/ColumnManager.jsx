import React from 'react';

class ColumnManager {
  cached = {};

  constructor(columns, elements) {
    this.columns = columns || this.normalize(elements);
  }

  isAnyColumnsFixed() {
    return this.cache('isAnyColumnsFixed', () => this.columns.some(column => !!column.fixed));
  }

  isAnyColumnsLeftFixed() {
    return this.cache('isAnyColumnsLeftFixed', () => this.columns.some(column => column.fixed === 'left' || column.fixed === true));
  }

  isAnyColumnsRightFixed() {
    return this.cache('isAnyColumnsRightFixed', () => this.columns.some(column => column.fixed === 'right'));
  }

  leftColumns() {
    return this.cache('leftColumns', () => this.groupedColumns().filter(column => column.fixed === 'left' || column.fixed === true));
  }

  rightColumns() {
    return this.cache('rightColumns', () => this.groupedColumns().filter(column => column.fixed === 'right'));
  }

  leafColumns() {
    return this.cache('leafColumns', () => this.getLeafColumns(this.columns));
  }

  leftLeafColumns() {
    return this.cache('leftLeafColumns', () => this.getLeafColumns(this.leftColumns()));
  }

  rightLeafColumns() {
    return this.cache('rightLeafColumns', () => this.getLeafColumns(this.rightColumns()));
  }

  groupedColumns() {
    return this.cache('groupedColumns', () => {
      const groupColumns = (columns, currentRow = 0, parentColumn = {}, rows = []) => {
        /* eslint-disable no-param-reassign */
        rows[currentRow] = rows[currentRow] || [];
        const grouped = [];
        const setRowSpan = column => {
          const rowSpan = rows.length - currentRow;
          if (
            column
            && !column.children
            && rowSpan > 1
            && (!column.rowSpan || column.rowSpan < rowSpan)
          ) {
            column.rowSpan = rowSpan;
          }
        };
        columns.forEach((column, index) => {
          const newColumn = { ...column };
          rows[currentRow].push(newColumn);
          parentColumn.colSpan = parentColumn.colSpan || 0;
          if (newColumn.children && newColumn.children.length > 0) {
            newColumn.children = groupColumns(newColumn.children, currentRow + 1, newColumn, rows);
            parentColumn.colSpan += newColumn.colSpan;
          } else {
            parentColumn.colSpan += 1;
          }
          for (let i = 0; i < rows[currentRow].length - 1; i += 1) {
            setRowSpan(rows[currentRow][i]);
          }
          if (index + 1 === columns.length) {
            setRowSpan(newColumn);
          }
          grouped.push(newColumn);
        });
        return grouped;
      };
      return groupColumns(this.columns);
      /* eslint-enable no-param-reassign */
    });
  }

  normalize(elements) {
    const columns = [];
    React.Children.forEach(elements, element => {
      if (!React.isValidElement(element)) {
        return;
      }
      const column = { ...element.props };
      if (element.key) {
        column.key = element.key;
      }
      if (element.type.isTableColumnGroup) {
        column.children = this.normalize(column.children);
      }
      columns.push(column);
    });
    return columns;
  }

  reset(columns, elements) {
    this.columns = columns || this.normalize(elements);
    this.cached = {};
  }

  cache(name, fn) {
    if (name in this.cached) {
      return this.cached[name];
    }
    this.cached[name] = fn();
    return this.cached[name];
  }

  getLeafColumns(columns) {
    const leafColumns = [];
    columns.forEach(column => {
      if (!column.children) {
        leafColumns.push(column);
      } else {
        leafColumns.push(...this.getLeafColumns(column.children));
      }
    });
    return leafColumns;
  }
}

export default ColumnManager;
