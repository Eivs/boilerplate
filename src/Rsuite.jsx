import React, { Component } from 'react';
import {
  Table, Column, HeaderCell, Cell,
} from 'rsuite-table';
import 'rsuite-table/lib/less/index.less';

class App extends Component {
  state = {
    data: [],
    checkedKeys: [],
    pagination: {
      pageSize: 100,
    },
    // loading: false,
    results: 200,
  };

  componentDidMount() {
    this.getData();
  }

  getData = (params = {}) => {
    const { results } = this.state;
    // this.setState({ loading: true });
    const url = new URL('https://randomuser.me/api');
    const newParams = { ...params, results };
    Object.keys(newParams).forEach(key => url.searchParams.append(key, newParams[key]));
    fetch(url, {
      method: 'get',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then((data) => {
        const { pagination } = this.state;
        pagination.total = 200;
        this.setState({
          // loading: false,
          data: data.results,
          pagination,
        });
      })
      .catch((error) => {
        console.err(error);
      });
  };

  handleCheckAll = (e) => {
    const { checked } = e.currentTarget;
    const { data } = this.state;
    const checkedKeys = checked ? data.map(item => item.login.uuid) : [];
    this.setState({
      checkedKeys,
    });
  };

  handleCheck = (e) => {
    console.log(e);
    const { value, checked } = e.currentTarget;
    const { checkedKeys } = this.state;
    const nextCheckedKeys = checked
      ? [...checkedKeys, value]
      : checkedKeys.filter(item => item !== value);

    this.setState({
      checkedKeys: nextCheckedKeys,
    });
  };

  render() {
    const { data, checkedKeys } = this.state;

    let checkedAll = false;
    let indeterminate = false;

    if (checkedKeys.length === data.length) {
      checkedAll = true;
    } else if (checkedKeys.length === 0) {
      checkedAll = false;
    } else if (checkedKeys.length > 0 && checkedKeys.length < data.length) {
      indeterminate = true;
    }

    const CustomCell = ({
      rowData, dataKey, render, ...props
    }) => {
      const record = rowData[dataKey];
      return <Cell {...props}>{render(record, rowData, dataKey)}</Cell>;
    };

    const CheckCell = ({
      rowData, onChange, checkedKeys: keys, dataKey, ...props
    }) => (
      <Cell {...props}>
        <input
          type="checkbox"
          value={rowData[dataKey].uuid}
          onChange={onChange}
          checked={keys.some(item => item === rowData[dataKey].uuid)}
        />
      </Cell>
    );

    return (
      <div>
        <Table
          data={data}
          autoHeight
          bordered
        >
          <Column
            width={40}
            fixed
          >
            <HeaderCell>
              <input
                type="checkbox"
                checked={checkedAll}
                indeterminate={indeterminate}
                onChange={this.handleCheckAll}
              />
            </HeaderCell>
            <CheckCell
              dataKey="login"
              checkedKeys={checkedKeys}
              onChange={this.handleCheck}
            />
          </Column>

          <Column
            width={300}
            sort
            fixed
            resizable
          >
            <HeaderCell>Name</HeaderCell>
            <CustomCell
              dataKey="name"
              render={record => `${record.first} ${record.last}`}
            />
          </Column>

          <Column
            sort
            resizable
          >
            <HeaderCell>Gender</HeaderCell>
            <Cell dataKey="gender" />
          </Column>

          <Column
            width={300}
            sort
            resizable
          >
            <HeaderCell>Email</HeaderCell>
            <Cell dataKey="email" />
          </Column>

          <Column width={200}>
            <HeaderCell>Phone</HeaderCell>
            <Cell dataKey="phone" />
          </Column>

          <Column width={300}>
            <HeaderCell>Cell</HeaderCell>
            <Cell dataKey="cell" />
          </Column>
        </Table>
      </div>
    );
  }
}

export default App;
