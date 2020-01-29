import React, {Component} from 'react';
import {Button, Card, Col, message, Row, Tag} from "antd";

import {getInfoOverView} from "../../requests";

const cardTitleStyle = {"background": "#1890ff", color: "white"};

const containersTitleStyle = {"background": "rgb(133, 206, 98)", color: "white"};

class Dashboard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            "OperatingSystem": null,
            "ServerVersion": null,
            "NCPU": null,
            "KernelVersion": null,
            "Containers": null,
            "ContainersRunning": null,
            "ContainersPaused": null,
            "ContainersStopped": null,
            "Images": null
        }
    }

    componentDidMount() {
        getInfoOverView().then(resp => {
            if (resp) {
                this.setState({
                    "OperatingSystem": resp.OperatingSystem,
                    "ServerVersion": resp.ServerVersion,
                    "NCPU": resp.NCPU,
                    "KernelVersion": resp.KernelVersion,
                    "Containers": resp.Containers,
                    "ContainersRunning": resp.ContainersRunning,
                    "ContainersPaused": resp.ContainersPaused,
                    "ContainersStopped": resp.ContainersStopped,
                    "Images": resp.Images
                })
            }
        }).catch(function (e) {
            message.error(e.toString());
        });
    }

    render() {
        return (
            <Card title="Dashboard" bordered={false}>
                {/*<div style={{background: '#ECECEC', padding: '30px'}}>*/}
                <Row gutter={8}>
                    <Col span={6}>
                        <Card title="OS" bordered={true} headStyle={cardTitleStyle}>
                            {this.state.OperatingSystem}
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card title="Docker version" bordered={true} headStyle={cardTitleStyle}>
                            {this.state.ServerVersion}
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card title="CPU" bordered={true} headStyle={cardTitleStyle}>
                            {this.state.NCPU}
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card title="Kernel version" bordered={true} headStyle={cardTitleStyle}>
                            {this.state.KernelVersion}
                        </Card>
                    </Col>
                </Row>
                <Row gutter={8} style={{"marginTop": "12px"}}>
                    <Col span={12}>
                        <Card bordered={true} headStyle={containersTitleStyle}
                              cover={<Button type="primary" href="/#/admin/containers">Containers</Button>}
                        >
                            Stopped: <Tag color="#f50">{this.state.ContainersStopped}</Tag>
                            Paused: <Tag color="orange">{this.state.ContainersPaused}</Tag>
                            Running: <Tag color="#87d068">{this.state.ContainersRunning}</Tag>
                            Containers: <Tag color="#108ee9">{this.state.Containers}</Tag>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card bordered={true} headStyle={containersTitleStyle}
                              cover={<Button type="primary" href="/#/admin/settings">Images</Button>}
                        >                            {this.state.Images}
                        </Card>
                    </Col>
                </Row>
                {/*</div>*/}
            </Card>
        );
    }
}

export default Dashboard;