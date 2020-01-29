import axios from 'axios'
import {message} from 'antd';

// const isDev = process.env.NODE_ENV === 'development';

const service = axios.create({
    // baseURL: isDev ? 'http://localhost:3100' : ''
});

service.interceptors.request.use((config) => {
    return config
});

service.interceptors.response.use((resp) => {
    if (resp.status === 200) {
        return resp.data;
    } else {
        message.error('This is an error message');
    }
});

export const getInfoOverView = () => {
    return service.get("/api/overview");
};

export const getContainers = () => {
    return service.get("/api/containers");
};