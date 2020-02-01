import Loadable from 'react-loadable'

import Loading from "../components/Loading";

const Dashboard = Loadable({
    loader: () => import('./Dashboard'),
    loading: Loading
});

const Containers = Loadable({
    loader: () => import('./Containers'),
    loading: Loading
});

const Images = Loadable({
    loader: () => import('./Images'),
    loading: Loading
});

const NotFound = Loadable({
    loader: () => import('./NotFound'),
    loading: Loading
});
const Login = Loadable({
    loader: () => import('./Login'),
    loading: Loading
});
const Admin = Loadable({
    loader: () => import('./Admin'),
    loading: Loading
});
const Settings = Loadable({
    loader: () => import('./Settings'),
    loading: Loading
});

export {
    Dashboard,
    Containers,
    Images,
    Login,
    NotFound,
    Settings,
    Admin
}