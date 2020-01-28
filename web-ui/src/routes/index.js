import {
    Dashboard,
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
        title: '仪表盘',
        icon: 'dashboard'
    },
    {
        pathname: '/admin/settings',
        component: Settings,
        isNave: true,
        title: '设置',
        icon: 'setting',
        exact: true
    }
]

