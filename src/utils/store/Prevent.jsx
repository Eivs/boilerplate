import { PureComponent } from 'react';
import PropTypes from 'prop-types';

class Prevent extends PureComponent {
  static propTypes = {
    renderComponent: PropTypes.func,
  };

  render() {
    const { renderComponent, ...rest } = this.props;
    return renderComponent(rest);
  }
}

export default Prevent;
