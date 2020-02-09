import React, {Component} from 'react';
import {Alert, Spin} from 'antd';
import './loading.less'

class Loading extends Component {
    render() {
        return (
            <div className="loading">
                <Spin tip="Loading..." size="large">
                    <Alert
                        message="Loading..."
                        description="Loading component please wait :)"
                        type="info"
                    />
                </Spin>
            </div>
        );
    }
}

export default Loading;