import {Layout, Menu, Icon} from 'antd';
import './index.less'
import React, {Component} from "react";
import {adminRouter} from "../../routes";

import {withRouter} from 'react-router-dom'

const {Header, Content, Sider} = Layout;

@withRouter
class Frame extends Component {
    onMenuClick = ({item, key, keyPath, doEvent}) => {
        this.props.history.push(key);
    }

    render() {
        return (
            <Layout style={{minHeight: "100%"}}>
                <Header className="header">
                    <div className="logo">
                        <h2 className="titleColor">Easy Docker Web</h2>
                    </div>
                </Header>
                <Layout>
                    <Sider width={200} style={{background: '#fff'}}>
                        <Menu
                            mode="inline"
                            selectedKeys={[this.props.location.pathname]}
                            onClick={this.onMenuClick}
                            style={{height: '100%', borderRight: 0}}
                        >
                            {
                                this.props.menus.map(menu => {
                                    return <Menu.Item key={menu.pathname}><Icon type={menu.icon}/> {menu.title}
                                    </Menu.Item>
                                })
                            }
                        </Menu>
                    </Sider>
                    <Layout style={{padding: '16px'}}>
                        <Content
                            style={{
                                background: '#fff',
                                padding: 24,
                                margin: 0,
                                minHeight: 480,
                            }}
                        >
                            {this.props.children}
                        </Content>
                    </Layout>
                </Layout>
            </Layout>
        )
    }
}

export default Frame;