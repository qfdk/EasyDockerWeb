import React, {useEffect, useState} from 'react';
import {Button, Card, Icon, message, Table} from "antd";
import {getDeleteImagesById, getImages} from "../../requests";

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

    useEffect(() => {
        updateImagesList();
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


    return (
        <Card title="Images" bordered={false}>
            <Button type="primary" style={{marginBottom: '8px'}}>
                <Icon type="plus"/>
                New images
            </Button>
            <br/>
            <Table
                dataSource={dataSource}
                loading={isLoading}
                columns={columns}
            />
        </Card>
    );

};

export default Images;