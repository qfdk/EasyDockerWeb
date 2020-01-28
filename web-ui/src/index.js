import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.less'

// import * as serviceWorker from './serviceWorker';
import {HashRouter as Router, Route, Switch, Redirect} from "react-router-dom";

import {mainRouter} from "./routes";

const myRouter = (
    <Router>
        <Switch>
            <Route path="/admin" render={(routerProps) => {
                // TODO : 权限需要登录
                return <App {...routerProps}/>
            }}/>
            {
                mainRouter.map(route => {
                    return <Route
                        key={route.component.name}
                        path={route.pathname}
                        component={route.component}/>
                })
            }
            <Redirect to="/admin" from="/" exact/>
            <Redirect to="/404"/>
        </Switch>
    </Router>
);

ReactDOM.render(myRouter
    , document.getElementById('root'));

