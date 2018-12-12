import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Icon from '../Icon';
import { Menu, MenuGroup } from '../Menu';
import Dropdown from '../Dropdown';
import { locale } from '../LocaleProvider';

const { MenuItem, MenuDivider } = Menu;

class FilterDropdown extends Component {
  static propTypes = {
    enableSort: PropTypes.bool,
    hideable: PropTypes.bool,
    column: PropTypes.object,
    prefixCls: PropTypes.string,
    dropdownPrefixCls: PropTypes.string,
    onClick: PropTypes.func,
    label: PropTypes.node,
  };

  static defaultProps = {
    enableSort: false,
    hideable: false,
    column: {},
  };

  onClickHandle = (e, key, value) => {
    const { onClick, column } = this.props;
    if (typeof onClick === 'function') {
      onClick(value, column);
    }
  };

  hasfilters = () => {
    const { column } = this.props;
    return column.filters && column.filters.length > 1;
  };

  renderSortMenu = () => {
    const { enableSort, hideable } = this.props;
    return (
      <MenuGroup title={locale.get('OPERATE')}>
        {enableSort ? (
          <MenuItem
            key="sort-ascend"
            value={{ action: 'sort', type: 'ascend' }}
          >
            <Icon name="sort-ascending" />
            {locale.get('ASCENDING_ORDER')}
          </MenuItem>
        ) : null}
        {enableSort ? (
          <MenuItem
            key="sort-descend"
            value={{ action: 'sort', type: 'descend' }}
          >
            <Icon name="sort-descending" />
            {locale.get('DESCENDING_ORDER')}
          </MenuItem>
        ) : null}
        {hideable ? (
          <MenuItem
            key="hidden"
            value={{ action: 'hidden' }}
          >
            <Icon name="eye-closed" />
            {locale.get('HIDDEN')}
          </MenuItem>
        ) : null}
      </MenuGroup>
    );
  };

  renderFilterMenu = () => {
    const { column } = this.props;
    const { filters } = column;
    return (
      <MenuGroup title={locale.get('FILTER')}>
        {filters.map(item => (
          <MenuItem
            key={`filter-${item.value}`}
            value={{ action: 'filter', type: item.value }}
          >
            {item.text}
          </MenuItem>
        ))}
      </MenuGroup>
    );
  };

  renderMenu = () => {
    const { enableSort, hideable, column } = this.props;
    const enablefilters = this.hasfilters();
    const { filteredValue } = column;
    const selectedKey = 'filteredValue' in column && filteredValue !== null ? `filter-${filteredValue}` : null;
    return (
      <Menu
        onClick={this.onClickHandle}
        selectedKey={selectedKey}
        selectable
      >
        {enableSort || hideable ? this.renderSortMenu() : null}
        {enableSort && enablefilters ? <MenuDivider /> : null}
        {enablefilters ? this.renderFilterMenu() : null}
      </Menu>
    );
  };

  render() {
    const { prefixCls, dropdownPrefixCls, label } = this.props;
    return (
      <Dropdown
        placement="bottom"
        content={this.renderMenu()}
        className={`${prefixCls}-${dropdownPrefixCls}`}
      >
        <a>
          {label}
          <Icon
            name="caret-down"
            size={16}
          />
        </a>
      </Dropdown>
    );
  }
}

export default FilterDropdown;
