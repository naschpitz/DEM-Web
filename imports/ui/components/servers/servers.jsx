import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import moment from 'moment';
import _ from 'lodash';

import { FaPlus } from 'react-icons/fa';
import Alert from 'react-s-alert';
import { ButtonEnhanced } from '@naschpitz/button-enhanced';
import FormInput from '@naschpitz/form-input';
import ReactTable from 'react-table-v6';

import ServersClass from '../../../api/servers/both/class.js';

import './servers.css';

export default Servers = (props) => {
    const [ isCreating, setIsCreating ] = useState(false);
    const [ isRemoving, setIsRemoving ] = useState(false);
    const [ isReady, setIsReady ] = useState(false);

    useTracker(() => {
        Meteor.subscribe('servers.list', {
            onStop: (error) => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
            onReady: () => (setIsReady(true))
        });
    }, []);

    const servers = useTracker(() => {
        return ServersClass.find({}, {sort: {'createdAt': -1}}).fetch();
    });

    function onEvent(event, data, name, value) {
        const server = {_id: data._id};

        _.set(server, name, value);

        if (event === 'onBlur') {
            Meteor.call('servers.update', server, (error) => {
                if (error)
                    Alert.error("Error updating server: " + getErrorMessage(error));
            });
        }
    }

    function getColumns() {
        return [{
            Header: "Name",
            accessor: 'name',
            Cell: (cellInfo) => (<FormInput name="name"
                                            value={getValue(cellInfo)}
                                            type="field"
                                            subtype="string"
                                            autoComplete={false}
                                            size="small"
                                            inputSizes={{sm: 12, md: 12, lg: 12, xl: 12}}
                                            onEvent={(event, name, value) => onEvent(event, cellInfo.original, name, value)}
            />)
        }, {
            Header: "URL",
            accessor: 'url',
            className: 'text-center',
            Cell: (cellInfo) => (<FormInput name="url"
                                            value={getValue(cellInfo)}
                                            type="field"
                                            subtype="string"
                                            autoComplete={false}
                                            size="small"
                                            inputSizes={{sm: 12, md: 12, lg: 12, xl: 12}}
                                            onEvent={(event, name, value) => onEvent(event, cellInfo.original, name, value)}
            />)
        }, {
            Header: "Port",
            accessor: 'port',
            className: 'text-center',
            Cell: (cellInfo) => (<FormInput name="port"
                                            value={getValue(cellInfo)}
                                            type="field"
                                            subtype="number"
                                            autoComplete={false}
                                            size="small"
                                            inputSizes={{sm: 12, md: 12, lg: 12, xl: 12}}
                                            onEvent={(event, name, value) => onEvent(event, cellInfo.original, name, value)}
            />)
        }, {
            Header: "Created At",
            id: "createdAt",
            className: 'text-center',
            accessor: (data) => (data.createdAt),
            Cell: (cellInfo) => (moment(cellInfo.original.createdAt).format('L HH:mm:ss'))
        }, {
            Header: "Remove",
            id: 'removeButton',
            className: 'text-center',
            Cell: (cellInfo) => (<ButtonEnhanced buttonOptions={{regularText: "Remove",
                                                                 data: cellInfo,
                                                                 className: "btn btn-sm btn-danger ml-auto mr-auto",
                                                                 isAction: isRemoving,
                                                                 actionText: "Removing...",
                                                                 type: "button"}}
                                                 confirmationOptions={{title: "Confirm server removal",
                                                                       text: <span>Do you really want to remove the server <strong>{cellInfo.original.name}</strong> ?</span>,
                                                                       confirmButtonText: "Remove",
                                                                       confirmButtonAction: "Removing...",
                                                                       cancelButtonText: "Cancel",
                                                                       onDone: onRemoveDone}}
            />)
        }];
    }

    function getValue(cellInfo) {
        const name = cellInfo.column.id;

        return _.get(cellInfo.original, name);
    }

    function onCreateDone(result) {
        if (!result) return;

        setIsCreating(true);

        Meteor.call('servers.create', (error) => {
            if (error)
                Alert.error("Error creating server: " + error.reason);

            else
                Alert.success("Server successfully created.");

            setIsCreating(false);
        });
    }

    function onRemoveDone(result, data) {
        if (!result) return;

        setIsRemoving(true);

        const materialId = data.original._id;

        Meteor.call('servers.remove', materialId, (error) => {
            if (error)
                Alert.error("Error removing server: " + error.reason);

            else
                Alert.success("Server successfully removed.");

            setIsRemoving(false);
        });
    }

    return (
        <div className="container" id="servers">
            <h2 className="text-center">
                Servers &nbsp;
                <ButtonEnhanced buttonOptions={{regularText: <FaPlus className="align-middle"/>,
                                                className: "btn btn-sm btn-success",
                                                isAction: isCreating,
                                                actionText: "Creating...",
                                                type: "button"}}
                                confirmationOptions={{title: "Confirm simulation creation",
                                                      text: <span>Do you really want to create a new server?</span>,
                                                      confirmButtonText: "Create",
                                                      confirmButtonAction: "Creating...",
                                                      cancelButtonText: "Cancel",
                                                      onDone: onCreateDone}}
                />
            </h2>

            <ReactTable data={servers}
                        loading={!isReady}
                        loadingText="Loading servers list..."
                        columns={getColumns()}
                        defaultPageSize={5}
                        collapseOnDataChange={false}
                        className="-striped -highlight"
                        getTdProps={() => ({style: {display: 'flex', flexDirection: 'column', justifyContent: 'center'}})}
            />
        </div>
    )
}