import React, {Component} from 'react';
import {Button, Card, Icon, message, Modal, Table, Tag} from 'antd';
import {getContainers, getDeleteContainerById, getStartContainerById, getStopContainerById} from "../../requests";
import ButtonGroup from "antd/es/button/button-group";

const stateColorMap = {
    "running": "green",
    "exited": "red",
    "created": "yellow"
};

const socket = require('socket.io-client')('http://localhost:3000');

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
        {
            title: 'CPU',
            dataIndex: 'cpu',
            key: 'cpu',
        },
        {
            title: 'RAM',
            dataIndex: 'ram',
            key: 'ram',
        },
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
            if (response) {
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
                        cpu: 0,
                        ram: 0,
                        startLoading: false,
                        stopLoading: false,
                        deleteLoading: false
                    }
                });
                this.setState(
                    {
                        dataSource: tmp
                    }
                );
                tmp.forEach(container => {
                    this.getContainerCPUInfoById(container.key);
                    this.getContainerRAMInfoById(container.key);
                })
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


    getContainerRAMInfoById(id) {
        socket.emit('getSysInfo', id);
        socket.on(id, (data) => {
            var json = JSON.parse(data);
            if (json.memory_stats.usage) {
                var tmp = ((json.memory_stats.usage / json.memory_stats.limit) * 100).toFixed(2)
                this.updateStateById(id, tmp, 'ram');
            }
        });
        socket.on('end', (status) => {
            console.log("[END] getContainerRAMInfoById");
        });
    }

    getContainerCPUInfoById(id) {
        socket.emit('getSysInfo', id);
        socket.on(id, (data) => {
            var json = JSON.parse(data);
            var res = this.calculateCPUPercentUnix(json);
            if (json.precpu_stats.system_cpu_usage) {
                this.updateStateById(id, res, 'cpu');
            }
        });
        socket.on('end', (status) => {
            console.log("[END] getContainerCPUInfoById");
        });
    }

    // ref https://github.com/moby/moby/issues/29306
    calculateCPUPercentUnix(json) {
        const previousCPU = json.precpu_stats.cpu_usage.total_usage;
        const previousSystem = json.precpu_stats.system_cpu_usage;
        let cpuPercent = 0.0;
        const cpuDelta = parseInt(json.cpu_stats.cpu_usage.total_usage) - parseInt(previousCPU);
        const systemDelta = parseInt(json.cpu_stats.system_cpu_usage) - parseInt(previousSystem);
        if (systemDelta > 0.0 && cpuDelta > 0.0) {
            cpuPercent = (cpuDelta / systemDelta) * parseInt(json.cpu_stats.cpu_usage.percpu_usage.length) * 100.0
        }
        return Number(cpuPercent).toFixed(2);
    }

    updateStateById = (id, nb, type) => {
        const containerIndex = this.state.dataSource.findIndex(container => {
            return container.key === id;
        });

        const container = {
            ...this.state.dataSource[containerIndex]
        };

        if (type === 'ram') {
            container.ram = nb + " %";
        }
        if (type === 'cpu') {
            container.cpu = nb + " %";
        }

        // copy of containers
        const containers = [...this.state.dataSource];

        containers[containerIndex] = container;

        this.setState({
            dataSource: containers
        })
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