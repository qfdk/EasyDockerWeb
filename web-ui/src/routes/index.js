import {
    Dashboard,
    Containers,
    Login,
    NotFound,
    Settings,
    Admin
} from '../views'

export const mainRouter =
    [
        {
            pathname: '/admin',
            component: Admin
        },
        {
            pathname: '/login',
            component: Login
        },
        {
            pathname: '/404',
            component: NotFound
        }
    ]

export const adminRouter = [
    {
        pathname: '/admin/dashboard',
        component: Dashboard,
        isNave: true,
        title: 'Dashboard',
        icon: 'dashboard'
    },
    {
        pathname: '/admin/containers',
        component: Containers,
        isNave: true,
        title: 'Containers',
        icon: 'container'
    },
    {
        pathname: '/admin/settings',
        component: Settings,
        isNave: true,
        title: 'Settings',
        icon: 'setting',
        exact: true
    }
]

