import React, {useEffect, useRef, useState} from 'react';
import {Button, Card, Icon, message, Modal, Table, Tag} from 'antd';
import {getContainers, getDeleteContainerById, getStartContainerById, getStopContainerById} from "../../requests";
import ButtonGroup from "antd/es/button/button-group";

const stateColorMap = {
    "running": "green",
    "exited": "red",
    "created": "yellow"
};

const io = require('socket.io-client');
const socket = io('http://localhost:3000');
const Containers = () => {
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
        {
            title: 'CPU',
            dataIndex: 'cpu',
            key: 'cpu',
            render: (text, record) => {
                return (
                    <p>{record.cpu ? record.cpu : null}</p>
                )
            }
        },
        {
            title: 'RAM',
            dataIndex: 'ram',
            key: 'ram',
            render: (text, record) => {
                return (
                    <p>{record.ram ? record.ram : null}</p>
                )
            }
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
                                onClick={() => startContainerHandler(record.key)}>
                            <Icon type="caret-right"/></Button>
                        <Button size="small" type="dashed"
                                loading={record.stopLoading}
                                disabled={record.State === 'exited' ? true : false}
                                onClick={() => stopContainerHandler(record.key)}>
                            <Icon type="stop"/>
                        </Button>
                        <Button size="small" type="danger"
                                loading={record.deleteLoading}
                                onClick={() => deleteContainerHandler(record.key)}>
                            <Icon type="delete"/></Button>
                    </ButtonGroup>
                )

            }
        },
    ];

    const [dataSource, setDataSource] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [modalIsVisible, setModalIsVisible] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const dataRef = useRef([]);
    const useSocket = useRef(false);

    useEffect(() => {
        updateContainersList();
        return () => {
            socket.emit('end');
            socket.off('containerInfo');
            console.log("end socket")
        }
    }, []);

    useEffect(() => {
        // console.log("dataSource Changed")
        if (!useSocket.current && dataSource.length > 0) {
            console.log("start data ....");
            console.log("dataSource:" + dataSource.length);
            console.log("dataRef.current:" + dataRef.current.length)
            socket.on('containerInfo', (data) => {
                if (data.pids_stats.current) {
                    updateContainerStateByData(data);
                }
            });
            useSocket.current = true;
        }
    }, [dataSource]);

    const updateContainersList = (callback) => {
        setIsLoading(true);
        getContainers().then(response => {
            if (response) {
                const tmp = response.map(res => {
                    socket.emit('getContainersInfo', res.Id);
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
                        cpu: 'NO DATA',
                        ram: 'NO DATA',
                        startLoading: false,
                        stopLoading: false,
                        deleteLoading: false
                    }
                });
                setDataSource(tmp);
                dataRef.current = tmp;
                // return tmp;
            }
        }).catch(function (e) {
            message.error(e.toString());
        }).finally(() => {
            setIsLoading(false);
        })
    };

    const startContainerHandler = (id) => {
        console.log("startContainerHandler: " + id);
        // useSocket.current = false;
        updateContainerStateById(id, "startLoading", true);
        getStartContainerById(id).then(resp => {
            // update
            updateContainersList()
        }).catch(err => {
            message.error(err.toString());
        }).finally(() => {
            updateContainerStateById(id, "startLoading", false);
        })
    };

    const stopContainerHandler = (id) => {
        console.log("stopContainerHandler: " + id);
        socket.off('containerInfo');
        useSocket.current = false;

        updateContainerStateById(id, "stopLoading", true);
        getStopContainerById(id).then(resp => {
            // update
            updateContainersList()
        }).catch(err => {
            message.error(err.toString());
        }).finally(() => {
            updateContainerStateById(id, "stopLoading", false);
        })
    };

    const deleteContainerHandler = (id) => {
        console.log("deleteContainerHandler: " + id);
        socket.off('containerInfo');
        useSocket.current = false;

        updateContainerStateById(id, "deleteLoading", true);

        getDeleteContainerById(id).then(resp => {
            // update
            updateContainersList()
        }).catch(err => {
            message.error(err.toString());
        }).finally(() => {
            updateContainerStateById(id, "deleteLoading", false);
        })
    };

    /*
     * id id
     * type stop start delete
     * is active
     */
    const updateContainerStateById = (id, type, isActive) => {
        const newMapToUpdate = dataRef.current.map((data) => {
            if (data.key === id) {
                data[type] = isActive;
            }
            return data;
        });
        setIsLoading(isActive);
        setDataSource(newMapToUpdate);
    };

    const showModal = () => {
        setModalIsVisible(true);
    };

    const handleOk = () => {
        setConfirmLoading(true);
        setTimeout(() => {
            setModalIsVisible(false);
            setConfirmLoading(false);
        }, 2000);
    };

    const handleCancel = () => {
        console.log('Clicked cancel button');
        setModalIsVisible(false);
    };


    const getContainerRAMInfo = (json) => {
        if (json.memory_stats.usage) {
            return ((json.memory_stats.usage / json.memory_stats.limit) * 100).toFixed(2);
        }
    };

    const getContainerCPUInfo = (json) => {
        if (json.precpu_stats.system_cpu_usage) {
            return calculateCPUPercentUnix(json);
        }
    };

    // ref https://github.com/moby/moby/issues/29306
    const calculateCPUPercentUnix = (json) => {
        const previousCPU = json.precpu_stats.cpu_usage.total_usage;
        const previousSystem = json.precpu_stats.system_cpu_usage;
        let cpuPercent = 0.0;
        const cpuDelta = parseInt(json.cpu_stats.cpu_usage.total_usage) - parseInt(previousCPU);
        const systemDelta = parseInt(json.cpu_stats.system_cpu_usage) - parseInt(previousSystem);
        if (systemDelta > 0.0 && cpuDelta > 0.0) {
            cpuPercent = (cpuDelta / systemDelta) * parseInt(json.cpu_stats.cpu_usage.percpu_usage.length) * 100.0
        }
        return Number(cpuPercent).toFixed(2);
    };

    const updateContainerStateByData = (data) => {

        const containerIndex = dataRef.current.findIndex(container => {
            return container.key === data.id;
        });

        const container = {
            ...dataRef.current[containerIndex]
        };

        container.ram = getContainerRAMInfo(data) ? getContainerRAMInfo(data) + " %" : "NO DATA";
        container.cpu = getContainerCPUInfo(data) ? getContainerCPUInfo(data) + " %" : "NO DATA";

        // copy of containers
        const containers = [...dataRef.current];
        containers[containerIndex] = container;
        dataRef.current = containers;
        setDataSource(containers);
    };

    return (
        <Card title="Containers" bordered={false}>
            <Button type="primary" style={{marginBottom: '8px'}} onClick={showModal}>
                <Icon type="plus"/>
                New container
            </Button>
            <Table dataSource={dataSource}
                   loading={isLoading}
                   columns={columns}
            />
            <Modal
                title="New container"
                visible={modalIsVisible}
                onOk={handleOk}
                confirmLoading={confirmLoading}
                onCancel={handleCancel}
            >
                <p>test</p>
            </Modal>
        </Card>

    );

};

export default Containers;