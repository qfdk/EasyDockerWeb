import React, {Component} from 'react';
import {Card, Table, Button, message, Tag, Icon} from 'antd';
import {getContainers, getDeleteContainerById, getStartContainerById, getStopContainerById} from "../../requests";
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
                                loading={record.startLoading}
                                onClick={() => this.startContainerHandler(record.key)}>
                            <Icon type="caret-right"/></Button>
                        <Button size="small" type="dashed"
                                loading={record.stopLoading}
                                onClick={() => this.stopContainerHandler(record.key)}>
                            <Icon type="stop"/>
                        </Button>
                        <Button size="small" type="danger"
                                loading={record.deleteLoading}
                                onClick={() => this.deleteContainerHandler(record.key)}>
                            <Icon type="delete"/></Button>
                    </ButtonGroup>
                )

            }
        },
    ];

    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            isLoading: false
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

            const listStateMap = tmp.map(res => {
                return Object.assign({}, {
                    startLoading: false,
                    stopLoading: false,
                    deleteLoading: false
                }, res);
            });
            if (response) {
                this.setState(
                    {
                        dataSource: listStateMap
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
        this.updateStateByKey(id, "startLoading", true);
        getStartContainerById(id).then(resp => {
            // update
            this.updateContainerList()
        }).catch(err => {
            message.error(err.toString());
        }).finally(() => {
            this.updateStateByKey(id, "startLoading", false);
        })
    }

    stopContainerHandler(id) {
        console.log("stopContainerHandler: " + id);
        this.updateStateByKey(id, "stopLoading", true);
        getStopContainerById(id).then(resp => {
            // update
            this.updateContainerList()
        }).catch(err => {
            message.error(err.toString());
        }).finally(() => {
            this.updateStateByKey(id, "stopLoading", false);
        })
    }

    deleteContainerHandler(id) {
        console.log("deleteContainerHandler: " + id);
        this.updateStateByKey(id, "deleteLoading", true);

        getDeleteContainerById(id).then(resp => {
            // update
            this.updateContainerList()
        }).catch(err => {
            message.error(err.toString());
        }).finally(() => {
            this.updateStateByKey(id, "deleteLoading", false);
        })
    }

    /*
     * id id
     * type stop start delete
     * is active
     */
    updateStateByKey(id, type, isActive) {
        const newMapToUpdate = this.state.dataSource.map((data) => {
            if (data.key === id) {
                data[type] = isActive;
            }
            return data;
        });

        this.setState({
            loading: isActive,
            dataSource: newMapToUpdate
        });
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