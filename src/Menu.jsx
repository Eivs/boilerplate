/* eslint-disable */
import React from 'react';

import { Dropdown, Button, Menu, Icon } from './component';

const { MenuDivider, MenuItem } = Menu;

const style = {
  width: 120,
  marginRight: 30,
  justifyContent: 'space-between',
};

class DropdownDemo extends React.Component {
  state = { visible: false };

  handleClose = () => {
    this.setState({ visible: false });
  };

  handleOpen = () => {
    this.setState({ visible: true });
    setTimeout(() => {
      const { visible } = this.state;
      if (visible) {
        this.setState({ visible: true });
      }
    }, 1000);
  };

  renderDropdownContent = () => (
    <Menu>
      <MenuItem>asdasd</MenuItem>
      <MenuDivider>asdasd</MenuDivider>
    </Menu>
  );

  render() {
    const { visible } = this.state;
    return (
      <div className="demo-wrapper">
        <Button
          onClick={() => {
            this.setState(state => ({ visible: !state.visible }));
          }}
        >
          toggle
        </Button>
        <Dropdown
          content={this.renderDropdownContent()}
          onOpen={this.handleOpen}
          onClose={this.handleClose}
          visible={visible}
        >
          <Button style={style}>
            点击展示
            <Icon name="caret-down" />
          </Button>
        </Dropdown>
      </div>
    );
  }
}

export default DropdownDemo;
