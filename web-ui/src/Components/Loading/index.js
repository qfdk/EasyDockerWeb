import React, {Component} from 'react';
import {Spin, Alert} from 'antd';

class Loading extends Component {
    render() {
        return (
            <Spin tip="Loading..." size="large">
                <Alert
                    message="Loading..."
                    description="Loading component please wait :)"
                    type="info"
                />
            </Spin>
        );
    }
}

export default Loading;