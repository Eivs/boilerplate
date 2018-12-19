/* eslint-disable */
import React from 'react';
// import { Tabs, Icon, Message } from './component';
import { Select } from './component';

const Demo1Options = [
  { value: 'CentOS', label: 'CentOS 5.8 32bit' },
  { value: 'Debian', label: 'Debian Jessie 8.1 64bit' },
  { value: 'Ubuntu', label: 'Ubuntu Server 14.04.3 LTS 64bit', disabled: true },
  { value: 'Windows', label: 'Windows Server 2003 R2' },
];

const Demo2Options = [
  {
    label: 'Cent OS',
    options: [
      { value: 'CentOS-5.8', label: 'CentOS 5.8 32bit' },
      { value: 'CentOS-6.6', label: 'CentOS 6.6 64bit', disabled: true },
      { value: 'CentOS-7', label: 'CentOS 7 64bit' },
    ],
  },
  {
    label: 'Debian',
    options: [
      { value: 'Debian-8.3', label: 'Debian Jessie 8.3 64bit' },
      { value: 'Debian-9.3', label: 'Debian Stretch 9.3 64bit' },
    ],
  },
];

class SelectDemo1 extends React.Component {
  state = {
    selectedValue: [],
    defaultOptions: Demo1Options,
    filteredOptions: Demo1Options,
  };

  handleChange = selectedValue => {
    this.setState({ selectedValue });
    if (selectedValue) {
      console.log('Selected: ', selectedValue);
    }
  };

  filterOptions = input => {
    const { defaultOptions } = this.state;

    if (!input) {
      this.setState({ filteredOptions: defaultOptions });
      return;
    }

    const filteredOptions = defaultOptions.map(option => {
      const remain = option.label.toLowerCase().includes(input.toLowerCase());
      return Object.assign({}, option, { hidden: !remain });
    });

    this.setState({ filteredOptions });
  };

  render() {
    const { selectedValue, filteredOptions } = this.state;
    return (
      <Select
        name="os"
        multi
        searchable
        closeOnSelect={false}
        value={selectedValue}
        onChange={this.handleChange}
        onInputChange={this.filterOptions}
        options={filteredOptions}
      />
    );
  }
}

class SelectDemo2 extends React.Component {
  state = {
    selectedValue: '',
    defaultOptions: Demo2Options,
    filteredOptions: Demo2Options,
  };

  handleChange = selectedValue => {
    this.setState({ selectedValue });
    console.log(`Selected: ${selectedValue}`);
  };

  filterOptions = input => {
    const { defaultOptions } = this.state;

    if (!input) {
      this.setState({ filteredOptions: defaultOptions });
      return;
    }

    const groupFilteredOptions = defaultOptions
      .map(group => {
        const filterOptions = group.options.filter(option => {
          const optionLabel = option.label.toLowerCase();
          return optionLabel.includes(input.toLowerCase());
        });
        return Object.assign({}, group, {
          options: filterOptions,
        });
      })
      .filter(group => group.options && group.options.length > 0);

    this.setState({ filteredOptions: groupFilteredOptions });
  };

  render() {
    const { selectedValue, filteredOptions } = this.state;
    return (
      <Select
        name="os"
        searchable
        value={selectedValue}
        onChange={this.handleChange}
        onInputChange={this.filterOptions}
        options={filteredOptions}
      />
    );
  }
}

const SelectDemo = () => (
  <div className="demo-wrapper select-demo">
    <SelectDemo1 />
    <SelectDemo2 />
  </div>
);

export default SelectDemo;
