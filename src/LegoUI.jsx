import React from 'react';
import {
  Dropdown, Button, Menu, Icon,
} from './component';

const { MenuItem, MenuDivider } = Menu;

const style = {
  width: 120,
  marginRight: 30,
  justifyContent: 'space-between',
};

class DropdownDemo extends React.Component {
  state = { canDelete: true, visible: false };

  handleClose = () => {
    this.setState({ visible: false });
  };

  handleOpen = () => {
    this.setState({ visible: true });
    setTimeout(() => {
      const { visible } = this.state;
      if (visible) {
        this.setState({ canDelete: false, visible: true });
      }
    }, 1000);
  };

  renderDropdownContent() {
    const { canDelete } = this.state;
    console.log(canDelete);
    return (
      <Menu>
        <MenuItem>asdsad</MenuItem>
        <MenuDivider />
      </Menu>
    );
  }

  render() {
    const { visible } = this.state;
    return (
      <div className="demo-wrapper">
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
        <Dropdown
          content={this.renderDropdownContent()}
          trigger="hover"
        >
          <Button style={style}>
            悬停展示
            <Icon name="caret-down" />
          </Button>
        </Dropdown>
        <Dropdown
          content={this.renderDropdownContent()}
          disabled
        >
          <Button style={style}>
            禁用
            <Icon name="caret-down" />
          </Button>
        </Dropdown>
      </div>
    );
  }
}

export default DropdownDemo;
