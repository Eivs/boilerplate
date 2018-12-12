import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
// import shallowEqual from '../../../utils/shallowEqual';
// import Icon from '../../Icon';

class ExpandIcon extends PureComponent {
  static propTypes = {
    record: PropTypes.object,
    prefixCls: PropTypes.string,
    expandable: PropTypes.any,
    expanded: PropTypes.bool,
    needIndentSpaced: PropTypes.bool,
    onExpand: PropTypes.func,
    expandIcons: PropTypes.array,
  };

  // shouldComponentUpdate(nextProps) {
  //   return !shallowEqual(nextProps, this.props);
  // }

  render() {
    const {
      expandable,
      prefixCls,
      onExpand,
      needIndentSpaced,
      expanded,
      record,
      expandIcons,
    } = this.props;
    if (expandable) {
      const expandClassName = expanded ? 'expanded' : 'collapsed';
      const iconName = expanded ? expandIcons[0] : expandIcons[1];
      return (
        <Icon
          className={`${prefixCls}-expand-icon ${prefixCls}-${expandClassName}`}
          name={iconName}
          size={16}
          onClick={e => onExpand(record, e)}
        />
      );
    }
    if (needIndentSpaced) {
      return <span className={`${prefixCls}-expand-icon ${prefixCls}-spaced`} />;
    }
    return null;
  }
}

export default ExpandIcon;
