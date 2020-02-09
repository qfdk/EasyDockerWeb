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

export const getStartContainerById = (id) => {
    return service.get("/api/containers/start/" + id);
};
export const getStopContainerById = (id) => {
    return service.get("/api/containers/stop/" + id);
};
export const getDeleteContainerById = (id) => {
    return service.get("/api/containers/remove/" + id);
};

export const getImages = () => {
    return service.get("/api/images");
};
export const getDeleteImagesById = (id) => {
    return service.get("/api/images/remove/" + id);
};

export const searchImage = (name) => {
    return service.get("/api/search/" + name);
};