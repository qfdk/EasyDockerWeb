import React, {Component} from 'react';
import {Button, Card, Icon, message, Table} from "antd";
import ButtonGroup from "antd/es/button/button-group";
import {getDeleteImagesById, getImages} from "../../requests";

class Images extends Component {
    columns = [
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
                    <ButtonGroup>
                        <Button size="small" type="danger"
                                onClick={() => this.deleteImagesHandler(record.key)}
                                loading={record.deleteLoading}
                        >
                            <Icon type="delete"/></Button>
                    </ButtonGroup>
                )

            }
        }
    ];

    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            isLoading: false
        }
    }

    componentDidMount() {
        this.updateImagesList();
    }

    updateImagesList() {
        this.setState({
            isLoading: true
        });
        getImages().then(response => {
            const map = response.map(res => {
                return {
                    key: res.Id,
                    RepoTags: res.RepoTags,
                    Size: this.getImageSize(res.Size),
                    deleteLoading: false
                }
            });
            this.setState({
                dataSource: map
            })

        }).catch((err) => {
            message.error(err.toString());
        }).finally(() => {
            this.setState({
                isLoading: false
            })
        })
    }

    deleteImagesHandler(id) {
        console.log("deleteImagesHandler: " + id);
        this.updateStateByKey(id, "deleteLoading", true);
        getDeleteImagesById(id).then(resp => {
            // update
            this.updateImagesList();
        }).catch(err => {
            message.error(err.toString());
        }).finally(() => {
            this.updateStateByKey(id, "deleteLoading", false);
        })
    }

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

    getImageSize = (str) => {
        const newSize = parseInt(str, 10);
        const tmp = (newSize / 1000 / 1000).toFixed(2).toString().substring(0, 4);
        if (tmp.indexOf('.') === 3) {
            return tmp.split('.')[0] + " MB";
        }
        return tmp + " MB";
    };

    render() {
        return (
            <Card title="Images" bordered={false}>
                <Table
                    dataSource={this.state.dataSource}
                    loading={this.state.isLoading}
                    columns={this.columns}
                />
            </Card>
        );
    }
}

export default Images;