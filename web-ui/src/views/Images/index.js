import React, {useEffect, useState} from 'react';
import {AutoComplete, Button, Card, Icon, message, Modal, Table} from "antd";
import {getDeleteImagesById, getImages, searchImage} from "../../requests";
const socket = require('socket.io-client')('http://localhost:3000');

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
    const [images, setImages] = useState([]);

    useEffect(() => {
        updateImagesList();
        socket.on('show', (data) => {
            console.log(data);
        });

        socket.on('end', (status) => {
            socket.disconnect();
        });
        return () => {
            socket.disconnect();
        }
    }, []);

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
            setConfirmLoading(true);
            console.log('ask to pull image:' + imageName)
            socket.emit('pull', imageName, null, null);
        }
        // setTimeout(() => {
        //     setModalIsVisible(false);
        //     setConfirmLoading(false);
        // }, 30000);
    };

    const handleCancel = () => {
        console.log('Clicked cancel button');
        setModalIsVisible(false);
    };

    const showModal = () => {
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
                style={{width: 600}}
            >
                <h3>Pull a new image</h3>
                <AutoComplete
                    dataSource={images}
                    style={{width: 400}}
                    onSelect={onSelect}
                    onSearch={onSearch}
                    placeholder="Name of image"
                />
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