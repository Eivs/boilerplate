import React from 'react';
import { Table } from './component';

const columns = [
  {
    title: 'ID',
    dataIndex: 'image_id',
  },
  {
    title: '名称',
    dataIndex: 'image_name',
  },
  {
    title: '状态',
    dataIndex: 'status',
    render: field => (field === 'available' ? '已启用' : '已弃用'),
  },
  {
    title: '容量 (G)',
    dataIndex: 'size',
  },
  {
    title: '平台',
    dataIndex: 'platform',
  },
];

const dataSource = [
  {
    image_id: 'arch201310x64',
    image_name: 'Arch Linux 2013.10 64bit',
    platform: 'linux',
    size: 20,
    status: 'available',
    key: 1,
  },
  {
    image_id: 'centos63x64',
    image_name: 'CentOS 6.3 64bit',
    platform: 'linux',
    size: 20,
    status: 'available',
    key: 3,
    children: [
      {
        image_id: 'arch201310x64',
        image_name: 'Arch Linux 2013.10 64bit',
        platform: 'linux',
        size: 20,
        status: 'available',
        key: 4,
        children: [
          {
            image_id: 'arch201310x64',
            image_name: 'Arch Linux 2013.10 64bit',
            platform: 'linux',
            size: 20,
            status: 'available',
            key: 6,
          },
          {
            image_id: 'debian91x64',
            image_name: 'Debian Stretch 9.1 64bit',
            platform: 'linux',
            size: 20,
            status: 'deprecated',
            key: 7,
            children: [
              {
                image_id: 'arch201310x64',
                image_name: 'Arch Linux 2013.10 64bit',
                platform: 'linux',
                size: 20,
                status: 'available',
                key: 8,
              },
              {
                image_id: 'debian91x64',
                image_name: 'Debian Stretch 9.1 64bit',
                platform: 'linux',
                size: 20,
                status: 'deprecated',
                key: 9,
              },
            ],
          },
        ],
      },
      {
        image_id: 'debian91x64',
        image_name: 'Debian Stretch 9.1 64bit',
        platform: 'linux',
        size: 20,
        status: 'deprecated',
        key: 5,
      },
    ],
  },
  {
    image_id: 'debian91x64',
    image_name: 'Debian Stretch 9.1 64bit',
    platform: 'linux',
    size: 20,
    status: 'deprecated',
    key: 2,
  },
];

const rowSelection = {
  onChange: (selectedRowKeys, selectedRows) => {
    console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
  },
  onSelect: (record, selected, selectedRows) => {
    console.log(record, selected, selectedRows);
  },
  onSelectAll: (selected, selectedRows, changeRows) => {
    console.log(selected, selectedRows, changeRows);
  },
};

const TableDemo = () => (
  <div className="demo-wrapper table-demo">
    <Table
      expandRowIndent={false}
      columns={columns}
      rowSelection={rowSelection}
      dataSource={dataSource}
      indentSize={20}
    />
  </div>
);

export default TableDemo;
