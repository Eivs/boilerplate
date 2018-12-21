import React, { Component } from 'react';
import { Table, Button } from './component';

const columns = [
  {
    title: 'Name',
    dataIndex: 'name',
    render: name => `${name.first} ${name.last}`,
    width: '20%',
  },
  {
    title: 'Gender',
    dataIndex: 'gender',
    width: '20%',
  },
  {
    title: 'Email',
    dataIndex: 'email',
  },
];

class App extends Component {
  state = {
    data: [],
    selectedKeys: [],
    pagination: {
      pageSize: 100,
    },
    loading: false,
    results: 100,
  };

  componentDidMount() {
    this.getData();
  }

  handleTableChange = (pagination, filters, sorter) => {
    const { pagination: statePagination } = this.state;
    const pager = { ...statePagination };
    pager.current = pagination.current;
    this.setState({
      pagination: pager,
    });
    this.getData({
      results: pagination.pageSize,
      page: pagination.current,
      sortField: sorter.field,
      sortOrder: sorter.order,
      ...filters,
    });
  };

  getData = (params = {}) => {
    const { results } = this.state;
    this.setState({ loading: true });
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
        pagination.total = 1;
        this.setState({
          loading: false,
          data: data.results,
          pagination,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  handleClick = () => {
    this.getData();
  }

  render() {
    const {
      data, pagination, selectedKeys, loading,
    } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedKeys,
      type: 'checkbox',
      onChange: (selectedRowKeys) => {
        this.setState({ selectedKeys: selectedRowKeys });
      },
    };

    return (
      <div>
        <Button onClick={this.handleClick}>Reload</Button>
        <Table
          columns={columns}
          rowKey={record => record.login.uuid}
          rowSelection={rowSelection}
          dataSource={data}
          pagination={pagination}
          loading={loading}
          onChange={this.handleTableChange}
          expandIcons={['minus-square', 'plus-square']}
          expandedRowRender={record => (<p>{JSON.stringify(record.login)}</p>)}
        />
      </div>
    );
  }
}

export default App;
