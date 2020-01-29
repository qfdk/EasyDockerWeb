import React, {Component} from 'react';
import {Card, Table, Button, message, Tag} from 'antd';
import {getContainers, getDeleteContainerById, getStartContainerById, getStopContainerById} from "../../requests";
import logger from "less/lib/less/logger";
import ButtonGroup from "antd/es/button/button-group";

const stateColorMap = {
    "running": "green",
    "exited": "red",
    "created": "yellow"
}


class Containers extends Component {

    columns = [
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
                        <Button size="small" type="primary"
                                // loading={this.state.startLoading}
                                onClick={() => this.startContainerHandler(record.key)}>Start</Button>
                        <Button size="small" type="dashed"
                                // loading={this.state.stopLoading}
                                onClick={() => this.stopContainerHandler(record.key)}>Stop</Button>
                        <Button size="small" type="danger"
                                // loading={this.state.deleteLoading}
                                onClick={() => this.deleteContainerHandler(record.key)}>Delete</Button>
                    </ButtonGroup>
                )

            }
        },
    ];

    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            isLoading: false,
            startLoading: false,
            stopLoading: false,
            deleteLoading: false
        }
    }

    componentDidMount() {
        this.updateContainerList()
    }

    updateContainerList() {
        this.setState({
            isLoading: true
        });
        getContainers().then(response => {
            const tmp = response.map(res => {
                return {
                    key: res.Id,
                    Names: res.Names[0].split("/")[1],
                    Image: res.Image,
                    Ports: res.Ports[0] ? res.Ports[0].Type + ": " + res.Ports[0].PrivatePort + " -> " + res.Ports[0].IP + ":" + res.Ports[0].PublicPort : '',
                    State: res.State
                }
            });
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

    startContainerHandler(id) {
        console.log("startContainerHandler: " + id);
        this.setState({
            isLoading: true,
            startLoading: true
        });
        getStartContainerById(id).then(resp => {
            // update
            this.updateContainerList()
        }).catch(err => {
            message.error(err.toString());
        }).finally(() => {
            this.setState({
                isLoading: false,
                startLoading: false
            })
        })
    }

    stopContainerHandler(id) {
        console.log("stopContainerHandler: " + id);
        this.setState({
            isLoading: true,
            stopLoading: true
        });
        getStopContainerById(id).then(resp => {
            // update
            this.updateContainerList()
        }).catch(err => {
            message.error(err.toString());
        }).finally(() => {
            this.setState({
                isLoading: false,
                stopLoading: false
            })
        })
    }

    deleteContainerHandler(id) {
        console.log("deleteContainerHandler: " + id);
        this.setState({
            isLoading: true,
            deleteLoading: true
        });
        getDeleteContainerById(id).then(resp => {
            // update
            this.updateContainerList()
        }).catch(err => {
            message.error(err.toString());
        }).finally(() => {
            this.setState({
                isLoading: false,
                deleteLoading: false
            })
        })
    }


    render() {
        return (
            <Card title="Containers" bordered={false}>
                <Table dataSource={this.state.dataSource}
                       loading={this.state.isLoading}
                       columns={this.columns}/>
            </Card>
        );
    }
}

export default Containers;