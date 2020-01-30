import React, {Component} from 'react';
import {Button, Card, Icon, message, Modal, Table, Tag} from 'antd';
import {getContainers, getDeleteContainerById, getStartContainerById, getStopContainerById} from "../../requests";
import ButtonGroup from "antd/es/button/button-group";

const stateColorMap = {
    "running": "green",
    "exited": "red",
    "created": "yellow"
};


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
                                disabled={record.State === 'running' ? true : false}
                                onClick={() => this.startContainerHandler(record.key)}>
                            <Icon type="caret-right"/></Button>
                        <Button size="small" type="dashed"
                                loading={record.stopLoading}
                                disabled={record.State === 'exited' ? true : false}
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
            isLoading: false,
            visible: false,
            confirmLoading: false,
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
                const ports = res.Ports.map(p => {
                    let tmp = '';
                    if (p.IP) {
                        tmp = " -> " + p.IP + ":" + p.PublicPort
                    }
                    return "[" + p.Type + "] " + p.PrivatePort + tmp + "; ";
                });
                return {
                    key: res.Id,
                    Names: res.Names[0].split("/")[1],
                    Image: res.Image,
                    Ports: ports,
                    State: res.State,
                    startLoading: false,
                    stopLoading: false,
                    deleteLoading: false
                }
            });

            // const listStateMap = tmp.map(res => {
            //     return Object.assign({}, {
            //         startLoading: false,
            //         stopLoading: false,
            //         deleteLoading: false
            //     }, res);
            // });
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

    showModal = () => {
        this.setState({
            visible: true,
        });
    };

    handleOk = () => {
        this.setState({
            confirmLoading: true,
        });
        setTimeout(() => {
            this.setState({
                visible: false,
                confirmLoading: false,
            });
        }, 2000);
    };

    handleCancel = () => {
        console.log('Clicked cancel button');
        this.setState({
            visible: false,
        });
    };

    render() {
        return (
            <Card title="Containers" bordered={false}>
                <Button type="primary" style={{marginBottom: '8px'}} onClick={this.showModal}>
                    <Icon type="plus"/>
                    New container
                </Button>
                <Table dataSource={this.state.dataSource}
                       loading={this.state.isLoading}
                       columns={this.columns}/>
                <Modal
                    title="New container"
                    visible={this.state.visible}
                    onOk={this.handleOk}
                    confirmLoading={this.confirmLoading}
                    onCancel={this.handleCancel}
                >
                   <p>test</p>
                </Modal>
            </Card>

        );
    }
}

export default Containers;