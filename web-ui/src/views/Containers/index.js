import React, {Component} from 'react';
import {Card, Table, Button, message, Tag} from 'antd';
import {getContainers} from "../../requests";
import logger from "less/lib/less/logger";
import ButtonGroup from "antd/es/button/button-group";

const stateColorMap = {
    "running": "green",
    "exited": "red",
    "created": "yellow"
}
const columns = [
        {
            title: 'Names',
            dataIndex: 'Names',
            key: 'Names',
        },
        {
            title: 'Image',
            dataIndex: 'Image',
            key: 'Image',
        },
        {
            title: 'Ports',
            dataIndex: 'Ports',
            key: 'Ports',
        },
        {
            title: 'State',
            dataIndex: 'State',
            key: 'State',
            render: (text, record) => {
                return <Tag color={stateColorMap[record.State]}>{record.State}</Tag>
            }
        },
        // {
        //     title: 'CPU',
        //     dataIndex: 'cpu',
        //     key: 'cpu',
        // },
        // {
        //     title: 'RAM',
        //     dataIndex: 'ram',
        //     key: 'ram',
        // },
        {
            title: 'Operation',
            dataIndex: 'operation',
            key: 'operation',
            render: (text, record) => {
                return (
                    <ButtonGroup>
                        <Button size="small" type="primary">Start</Button>
                        <Button size="small" type="dashed">Stop</Button>
                        <Button size="small" type="danger">Delete</Button>
                    </ButtonGroup>
                )

            }
        },
    ]
;

class Containers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            isLoading: false
        }
    }

    componentDidMount() {
        this.setState({
            isLoading: true
        })
        getContainers().then(response => {
            const tmp = response.map(res => {
                return {
                    key: res.Id,
                    Names: res.Names[0].split("/")[1],
                    Image: res.Image,
                    Ports: res.Ports[0] ? res.Ports[0].Type + ": " + res.Ports[0].PrivatePort + " -> " + res.Ports[0].IP + ":" + res.Ports[0].PublicPort : '',
                    State: res.State
                }
            })
            if (response) {
                this.setState(
                    {
                        dataSource: tmp
                    }
                )
            }
        }).catch(function (e) {
            message.error(e.toString());
        }).finally(() => {
            this.setState({
                isLoading: false
            })
        })
    }

    render() {
        return (
            <Card title="Containers" bordered={false}>
                <Table dataSource={this.state.dataSource}
                       loading={this.state.isLoading}
                       columns={columns}/>
            </Card>
        );
    }
}

export default Containers;