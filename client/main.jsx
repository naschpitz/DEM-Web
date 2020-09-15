import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import Loadable from 'react-loadable';
import Modal from 'react-modal';

import { BrowserRouter } from 'react-router-dom';

// Will load Bootstrap's *.js.
import 'bootstrap';

// Will load Bootstrap's styles.
import 'bootstrap/dist/css/bootstrap.css';

import 'react-s-alert/dist/s-alert-default.css';

import 'react-table-v6/react-table.css';

import '@naschpitz/button-enhanced/dist/index.css';
import '@naschpitz/form-input/dist/index.css';
import '@naschpitz/unique-modal/dist/index.css';

import '../imports/startup/both';
import '../imports/startup/client';

const MainContainer = Loadable({
    loader: () => { return import('../imports/ui/layouts/main/main.jsx'); },
    render(loaded, props) {
        let Component = loaded.default;
        return <Component {...props}/>;
    },
    loading: () => (null),
});

Meteor.startup(() => {
    render(<BrowserRouter><MainContainer/></BrowserRouter>, document.getElementById('render-target'));

    // https://github.com/reactjs/react-modal/issues/576
    Modal.setAppElement('#render-target');
});
