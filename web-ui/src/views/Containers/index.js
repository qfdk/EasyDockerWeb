import React, {Component} from 'react';
import {Card, Table, Button} from 'antd';

const dataSource = [
    {
        key: '1',
        name: '胡彦斌',
        age: 32,
        address: '西湖区湖底公园1号',
    },
    {
        key: '2',
        name: '胡彦祖',
        age: 42,
        address: '西湖区湖底公园1号',
    },
];

const columns = [
        {
            title: '姓名',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '年龄',
            dataIndex: 'age',
            key: 'age',
        },
        {
            title: '住址',
            dataIndex: 'address',
            key: 'address',
        },
        {
            title: 'Option',
            dataIndex: 'option',
            key: 'option',
            render: (text, record) => (
                <div>
                    <Button type="primary">Primary</Button>
                    <Button type="dashed">Dashed</Button>
                    <Button type="danger">Danger</Button>
                </div>)
        },
    ]
;

class Containers extends Component {
    render() {
        return (
            <Card title="Containers" bordered={false}>
                <Table dataSource={dataSource} columns={columns}/>
            </Card>
        );
    }
}

export default Containers;