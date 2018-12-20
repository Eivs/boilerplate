import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash';
import classNames from 'classnames';

import Icon from '../../Icon';
import Tag from '../../Tag';
import Autosuggest from './Autosuggest';

class FilterInput extends Component {
  static propTypes = {
    placeholder: PropTypes.string,
    suggestions: PropTypes.array,
    tags: PropTypes.array,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
    onClear: PropTypes.func,
    onInputChange: PropTypes.func,
    isMultiKeyWord: PropTypes.bool,
  };

  static defaultProps = {
    suggestions: [],
    tags: [],
    onChange: noop,
    onBlur: noop,
    onFocus: noop,
    onClear: noop,
    onInputChange: noop,
    isMultiKeyWord: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      tags: props.tags,
      hasValue: false,
    };
  }

  get suggestions() {
    const { suggestions } = this.props;
    const { tags } = this.state;
    const curTags = tags.map(n => n.filter);
    if (curTags.length > 0) {
      return suggestions.filter(n => curTags.indexOf(n.key) === -1);
    }
    return suggestions;
  }

  get placeholder() {
    const { placeholder } = this.props;
    const { tags } = this.state;
    if (tags.length === 0) {
      return placeholder;
    }
    return null;
  }

  get showCloseBtn() {
    const { tags } = this.state;
    const { autosuggest } = this;
    return tags.length > 0 || (autosuggest ? autosuggest.value !== '' : false);
  }

  get hasValue() {
    const { tags, hasValue } = this.state;
    return tags.length > 0 || hasValue;
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (prevState.tags !== nextProps.tags) {
      return { tags: nextProps.tags };
    }
    return null;
  }

  handleInputChange = (event, value) => {
    const { onInputChange } = this.props;
    this.setState({ hasValue: value !== '' });
    onInputChange(event, value);
  };

  handleInputFocus = (event) => {
    const { onFocus } = this.props;
    this.setState({ hasValue: true }, () => {
      onFocus(event);
    });
  };

  handleInputBlur = (event) => {
    const { value } = this.autosuggest;
    const { onBlur } = this.props;
    this.setState({ hasValue: value !== '' }, () => {
      onBlur(event);
    });
  };

  handleClick = () => {
    this.autosuggest.focus();
  };

  handleSelect = (value) => {
    const { isMultiKeyWord } = this.props;
    const { tags } = this.state;
    if (isMultiKeyWord || value.filter !== 'keyword') {
      this.handleAdd(value);
      return;
    }
    this.setState(
      {
        tags: tags.filter(n => n.filter !== 'keyword'),
      },
      () => {
        this.handleAdd(value);
      },
    );
  };

  handleAdd = (item) => {
    const { onChange } = this.props;
    const { tags } = this.state;
    const newTags = [...tags, item];
    this.setState({ tags: newTags }, () => {
      onChange(newTags);
    });
  };

  handleDelete = () => {
    const { tags } = this.state;
    const { onChange } = this.props;
    if (tags.length <= 0) return;
    const newTags = tags.filter((n, index) => index !== tags.length - 1);
    this.setState({ tags: newTags }, () => {
      onChange(newTags);
    });
  };

  handleCloseTag = ({ value, filter }) => {
    const { tags } = this.state;
    const { onChange } = this.props;
    const newTags = tags.filter(n => n.value !== value && n.filter !== filter);
    this.setState({ tags: newTags }, () => {
      onChange(newTags);
    });
  };

  handleClear = (event) => {
    const { onChange, onClear } = this.props;
    event.stopPropagation();
    this.setState({ tags: [], hasValue: false }, () => {
      this.autosuggest.clear();
      onClear([]);
      onChange([]);
    });
  };

  renderTokenizer = () => {
    const { tags } = this.state;
    return (
      <React.Fragment>
        {tags.map((item, index) => (
          <Tag
            closable
            key={`${item.filter}-${item.value}-${index + 1}`}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onClose={() => {
              this.handleCloseTag(item);
            }}
          >
            {item.filter !== 'keyword' ? (
              <React.Fragment>
                <strong>
                  {item.filterLabel}
:
                </strong>
                {item.valueLabel}
              </React.Fragment>
            ) : (
              item.valueLabel
            )}
          </Tag>
        ))}
      </React.Fragment>
    );
  };

  render() {
    return (
      <div
        className={classNames('table-filter-bar', { 'has-value': this.hasValue })}
        onClick={this.handleClick}
      >
        <Icon
          className="is-left"
          name="magnifier"
          size={20}
        />
        <div className="table-filter-input tags">
          {this.renderTokenizer()}
          <Autosuggest
            ref={(n) => {
              this.autosuggest = n;
            }}
            placeholder={this.placeholder}
            items={this.suggestions}
            onSelected={this.handleSelect}
            onDelete={this.handleDelete}
            onChange={this.handleInputChange}
            onFocus={this.handleInputFocus}
            onBlur={this.handleInputBlur}
          />
        </div>
        {this.showCloseBtn ? (
          <Icon
            className="is-right"
            name="close"
            clickable
            onClick={this.handleClear}
          />
        ) : null}
      </div>
    );
  }
}

export default FilterInput;
