import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash';
import classNames from 'classnames';
import AutosizeInput from 'react-input-autosize';

const SEMICOLON = ':';
class Autosuggest extends Component {
  static propTypes = {
    items: PropTypes.array,
    filter: PropTypes.func,
    sort: PropTypes.any,
    limit: PropTypes.number,
    renderMenu: PropTypes.func,
    renderItem: PropTypes.func,
    onSelected: PropTypes.func,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    onDelete: PropTypes.func,
    prefixCls: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.string,
    placeholder: PropTypes.string,
  };

  static defaultProps = {
    items: [],
    prefixCls: 'autosuggest',
    filter: (item, query) => item.label.toLowerCase().includes(query.trim().toLowerCase()),
    sort: () => {},
    onSelected: noop,
    onDelete: noop,
    onChange: noop,
  };

  state = {
    isOpen: false,
    selectedIndex: -1,
    value: '',
    curItem: null,
  };

  componentDidMount() {
    this.isBlur = true;
  }

  get value() {
    const { value } = this.state;
    return value;
  }

  get items() {
    const {
      items, filter, sort, limit,
    } = this.props;
    const { value, curItem } = this.state;
    const results = items
      .filter(item => filter(item, value))
      .sort(sort)
      .slice(0, limit);

    if (curItem && curItem.options && value === curItem.label + SEMICOLON) {
      return curItem.options;
    }

    return results;
  }

  open = () => {
    this.setState({ isOpen: true, selectedIndex: -1 });
  };

  close = () => {
    this.setState({ isOpen: false, selectedIndex: -1 });
  };

  focus = () => {
    this.inputbox.focus();
  };

  blur = () => {
    this.inputbox.blur();
  };

  clear = () => {
    this.blur();
    this.setState({
      isOpen: false,
      selectedIndex: -1,
      value: '',
      curItem: null,
    });
  };

  handleMouseLeave = () => {
    this.setState({ selectedIndex: -1 });
  };

  handleMouseEnter = index => () => {
    this.setState({ selectedIndex: index });
  };

  handleMouseDown = () => {
    this.isBlur = false;
  };

  handleChange = (e) => {
    const { value } = e.target;
    const { onChange, items } = this.props;
    const item = items.find(n => new RegExp(`^${n.label + SEMICOLON}`, '').test(value));
    if (item) {
      this.setState({ value, curItem: item });
    } else {
      this.setState({ value, curItem: null });
    }
    onChange(e, value);
  };

  handleSelected = (params, event) => {
    const { inputbox } = this;
    const { onSelected } = this.props;

    this.setState({ value: '', selectedIndex: -1, curItem: null }, () => {
      onSelected(params, event);
      inputbox.focus();
      this.isBlur = true;
      this.close();
    });
  };

  handlePressEnter = (event) => {
    event.stopPropagation();
    const { selectedIndex, value, curItem } = this.state;
    let params = {};

    if (selectedIndex > -1 && this.items.length > 0) {
      const item = this.items[selectedIndex];
      if (item.options && item.options.length > 0 && curItem === null) {
        this.setState({ selectedIndex: 0, value: item.label + SEMICOLON, curItem: item });
        return;
      }

      if (curItem) {
        params = {
          filter: curItem.key,
          filterLabel: curItem.label,
          value: item.key,
          valueLabel: item.label,
        };
        this.handleSelected(params, event);
        return;
      }
      this.setState({ selectedIndex: -1, value: item.label + SEMICOLON, curItem: item });
      return;
    }

    if (curItem) {
      const val = value.replace(new RegExp(curItem.label + SEMICOLON), '').trim();
      if (val === '') return;
      params = {
        filter: curItem.key,
        filterLabel: curItem.label,
        value: val,
        valueLabel: val,
      };
      this.handleSelected(params, event);
      return;
    }

    if (value.trim() !== '') {
      params = {
        filter: 'keyword',
        filterLabel: '',
        value,
        valueLabel: value,
      };
      this.handleSelected(params, event);
    }
  };

  handleSelectItem = item => (event) => {
    event.stopPropagation();
    const { inputbox } = this;

    const changeEvent = new Event('input', { bubbles: true });
    inputbox.input.dispatchEvent(changeEvent);

    const { curItem } = this.state;
    if (!curItem) {
      this.setState({ value: item.label + SEMICOLON, curItem: item }, () => {
        inputbox.focus();
      });
      return;
    }
    this.handleSelected(
      {
        filter: curItem.key,
        filterLabel: curItem.label,
        value: item.key,
        valueLabel: item.label,
      },
      event,
    );
  };

  handleFocus = (event) => {
    const { onFocus } = this.props;

    this.open();
    if (onFocus) {
      onFocus(event);
    }
  };

  handleBlur = (event) => {
    const { onBlur } = this.props;

    if (!this.isBlur) return;

    this.close();
    if (onBlur) {
      onBlur(event);
    }
  };

  handleDelete = (event) => {
    const { onDelete } = this.props;
    const { value } = this.state;

    if (value === '') {
      event.preventDefault();
      this.close();
      onDelete(event);
    }
  };

  handleKeyDown = (event) => {
    const { selectedIndex } = this.state;

    this.open();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.setState({ selectedIndex: Math.min(selectedIndex + 1, this.items.length - 1) });
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.setState({ selectedIndex: Math.max(selectedIndex - 1, 0) });
        break;
      case 'Enter':
        this.handlePressEnter(event);
        break;
      case 'Escape':
        this.close();
        break;
      case 'Backspace':
        this.handleDelete(event);
        break;
      default:
        break;
    }
  };

  render() {
    const { isOpen, value, selectedIndex: stateSelectedIndex } = this.state;
    const {
      prefixCls,
      className,
      style,
      placeholder,
      renderMenu: Menu = ({ items }) => <ul className={`${prefixCls}-menu`}>{items}</ul>,
      renderItem: Item = ({ item, selectedIndex }) => (
        <li className={classNames(`${prefixCls}-item`, { 'is-active': selectedIndex })}>
          {item.label}
        </li>
      ),
    } = this.props;

    const showMenu = isOpen && this.items.length > 0;

    const renderedItems = this.items.map((item, index) => {
      const selectedIndex = stateSelectedIndex === index;
      return React.cloneElement(Item({ item, index, selectedIndex }), {
        onMouseEnter: this.handleMouseEnter(index),
        onMouseDown: this.handleMouseDown,
        onClick: this.handleSelectItem(item),
        key: `option-${index + 1}`,
      });
    });

    const renderedMenu = React.cloneElement(Menu({ items: renderedItems }), {
      onMouseLeave: this.handleMouseLeave,
    });

    return (
      <div
        style={style}
        className={classNames(prefixCls, className)}
      >
        <AutosizeInput
          className={`${prefixCls}-input`}
          type="text"
          onKeyDown={this.handleKeyDown}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          onChange={this.handleChange}
          placeholder={placeholder}
          ref={(n) => {
            this.inputbox = n;
          }}
          value={value}
        />

        {showMenu && renderedMenu}
      </div>
    );
  }
}

export default Autosuggest;
