import {Layout, Menu, Icon} from 'antd';
import './index.less'
import React, {Component} from "react";
// import {adminRouter} from "../../routes";

import {withRouter} from 'react-router-dom'

const {Header, Content, Sider, Footer} = Layout;

@withRouter
class Frame extends Component {
    state = {
        collapsed: false,
    };

    onCollapse = collapsed => {
        this.setState({collapsed});
    };

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
                    <Sider width={200} collapsible collapsed={this.state.collapsed}
                           style={{marginTop: "4px"}}
                           onCollapse={this.onCollapse}>
                        <Menu
                            mode="inline"
                            theme="dark"
                            selectedKeys={[this.props.location.pathname]}
                            onClick={this.onMenuClick}
                            style={{height: '100%', borderRight: 0}}
                        >
                            {
                                this.props.menus.map(menu => {
                                    return <Menu.Item key={menu.pathname}><Icon type={menu.icon}/>
                                        <span>{menu.title}</span>
                                    </Menu.Item>
                                })
                            }
                        </Menu>
                    </Sider>
                    <Layout style={{padding: '4px 16px 0 16px'}}>
                        <Content
                            style={{
                                background: '#fff',
                                margin: 0,
                            }}
                        >
                            {this.props.children}
                        </Content>
                        <Footer style={{textAlign: 'center'}}>NASI TECH ©2020 Created by qfdk</Footer>
                    </Layout>
                </Layout>
            </Layout>
        )
    }
}

export default Frame;