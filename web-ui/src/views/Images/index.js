import React, {useEffect, useState} from 'react';
import {AutoComplete, Button, Card, Col, Icon, Input, message, Modal, Row, Table} from "antd";
import {getDeleteImagesById, getImages, searchImage} from "../../requests";
import {Terminal} from "xterm";
import {FitAddon} from 'xterm-addon-fit';

import './images.less'

const socket = require('socket.io-client')('http://localhost:3000');
const term = new Terminal({
    windowsMode: ['Windows', 'Win16', 'Win32', 'WinCE'].indexOf(navigator.platform) >= 0,
    convertEol: true,
    fontFamily: `'Fira Mono', monospace`,
    fontSize: 14,
    fontWeight: 400,
    rendererType: "canvas" // canvas 或者 dom
});

const Images = () => {
    const columns = [
        {
            title: 'Repo:Tags',
            dataIndex: 'RepoTags',
            key: 'RepoTags',
        },
        {
            title: 'Size',
            dataIndex: 'Size',
            key: 'Size',
        },
        {
            title: 'Operation',
            dataIndex: 'operation',
            key: 'operation',
            render: (text, record) => {
                return (
                    <Button size="small" type="danger"
                            onClick={() => deleteImagesHandler(record.key)}
                            loading={record.deleteLoading}
                    >
                        <Icon type="delete"/></Button>
                )

            }
        }
    ];

    const [dataSource, setDataSource] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [modalIsVisible, setModalIsVisible] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    const [imageName, setImageName] = useState(null);
    const [tagName, setTagName] = useState(null);

    const [images, setImages] = useState([]);

    const updateImagesList = () => {
        setIsLoading(true);
        getImages().then(response => {
            const map = response.map(res => {
                return {
                    key: res.Id,
                    RepoTags: res.RepoTags,
                    Size: getImageSize(res.Size),
                    deleteLoading: false
                }
            });
            setDataSource(map);
        }).catch((err) => {
            message.error(err.toString());
        }).finally(() => {
            setIsLoading(false);
        })
    };

    useEffect(() => {
        updateImagesList();
        // when get the data from backend
        socket.on('show', (data) => {
            term.writeln(data);
        });

        // pull image finished, then update list and clean modal
        socket.on('end', (status) => {
            term.writeln("========= END ==========");
            updateImagesList();
            setConfirmLoading(false);
            setIsLoading(false);
            setTimeout(() => {
                setModalIsVisible(false);
            }, 5000);
            setImageName(null);
            console.log('ennnnnnd');
        });

        return () => {
            socket.disconnect();
        }
    }, []);


    const deleteImagesHandler = (id) => {
        console.log("deleteImagesHandler: " + id);
        updateStateByKey(id, "deleteLoading", true);
        getDeleteImagesById(id).then(resp => {
            // update
            updateImagesList();
        }).catch(err => {
            message.error(err.toString());
        }).finally(() => {
            updateStateByKey(id, "deleteLoading", false);
        })
    };

    const updateStateByKey = (id, type, isActive) => {
        const newMapToUpdate = dataSource.map((data) => {
            if (data.key === id) {
                data[type] = isActive;
            }
            return data;
        });

        setIsLoading(isActive);
        setDataSource(newMapToUpdate);
    };

    const getImageSize = (str) => {
        const newSize = parseInt(str, 10);
        const tmp = (newSize / 1000 / 1000).toFixed(2).toString().substring(0, 4);
        if (tmp.indexOf('.') === 3) {
            return tmp.split('.')[0] + " MB";
        }
        return tmp + " MB";
    };

    const handleOk = () => {
        if (imageName) {
            let surfix = ':';
            if (tagName) {
                surfix = surfix + tagName;
            } else {
                surfix = surfix + "latest";
            }

            setConfirmLoading(true);
            console.log('ask to pull image:' + imageName + surfix)
            openInitTerminal();
            term.writeln('Welcome to xterm.js');
            term.writeln('This is a local terminal with a real data stream in the back-end.');
            term.writeln('');
            socket.emit('pull', imageName + surfix, null, null);
        } else {
            message.error("Image name is inValid.");
        }
    };

    const handleCancel = () => {
        console.log('Clicked cancel button');
        setModalIsVisible(false);
    };

    const showModal = () => {
        const terminalContainer = document.getElementById('terminal');
        if (terminalContainer) {
            cleanTerminal(terminalContainer);
        }
        setModalIsVisible(true);
    };

    const onSearch = (searchText) => {
        if (searchText) {
            searchImage(searchText).then(imagesList => {
                const newImages = imagesList.map(img => {
                    return img.name
                });
                setImages(newImages);
            }).catch(function (e) {
                message.error(e.toString());
            }).finally(() => {
            });
        }
    };

    const onSelect = (image) => {
        console.log("on selected:" + image);
        setImageName(image);
    };

    const cleanTerminal = (terminalContainer) => {
        // 清除容器的子节点
        while (terminalContainer.children.length) {
            terminalContainer.removeChild(terminalContainer.children[0]);
        }
        term.clear();
    };

    const openInitTerminal = () => {
        console.log("loading terminal...");
        const terminalContainer = document.getElementById('terminal');
        cleanTerminal(terminalContainer);
        // style
        term.setOption("theme", {
            background: "black",
            foreground: "white"
        });

        // plugins
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        term.open(terminalContainer);

        term.element.style.padding = '10px';
        // fit windows
        fitAddon.fit();
        // focus
        term.focus();

    };

    return (
        <Card title="Images" bordered={false}>
            <Button type="primary" style={{marginBottom: '8px'}} onClick={showModal}>
                <Icon type="plus"/>
                New images
            </Button>
            <br/>
            <Modal
                title="New images"
                visible={modalIsVisible}
                onOk={handleOk}
                confirmLoading={confirmLoading}
                onCancel={handleCancel}
                width={'60%'}
            >
                <Row>
                    <Col span={12}>
                        <AutoComplete
                            dataSource={images}
                            style={{width: '100%'}}
                            onSelect={onSelect}
                            onSearch={onSearch}
                            // placeholder="Name of image"
                        >
                            <Input addonBefore="Name" placeholder="image name"/>

                        </AutoComplete>
                    </Col>
                    <Col span={12}>
                        <Input addonBefore="Tag" onChange={(e) => {
                            setTagName(e.target.value);
                        }} placeholder="latest"/>
                    </Col>
                    <Col span={24}>
                        <div id="terminal" style={{height: "100%", width: "100%", marginTop: '20px'}}/>
                    </Col>
                </Row>
            </Modal>

            <Table
                dataSource={dataSource}
                loading={isLoading}
                columns={columns}
            />
        </Card>
    );

};

export default Images;