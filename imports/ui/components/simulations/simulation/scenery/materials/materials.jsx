import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import _ from 'lodash';

import MaterialsClass from '../../../../../../api/materials/both/class.js';

import Alert from 'react-s-alert';
import ButtonEnhanced from '@naschpitz/button-enhanced';
import FormInput from '@naschpitz/form-input';
import Properties from './properties/properties.jsx';
import ReactTable from 'react-table-v6';

import './materials.css';

export default Material = (props) => {
    const [ isReady, setIsReady ] = useState(false);
    const [ isRemoving, setIsRemoving ] = useState(false);

    useTracker(() => {
        Meteor.subscribe('materials.list', props.sceneryId, {
            onStop: (error) => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
            onReady: () => (setIsReady(true))
        });
    }, [ props.sceneryId ]);

    const materials = useTracker(() => {
        return MaterialsClass.find({owner: props.sceneryId}).fetch();
    });

    function onRemoveDone(result, data) {
        if (!result) return;

        setIsRemoving(true);

        const materialId = data.original._id;

        Meteor.call('materials.remove', materialId, (error) => {
            if (error)
                Alert.error("Error removing material: " + error.reason);

            else
                Alert.success("Material successfully removed.");

            setIsRemoving(false);
        });
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
            Header: "Remove",
            id: 'removeButton',
            className: 'text-center',
            Cell: (cellInfo) => (<ButtonEnhanced buttonOptions={{regularText: "Remove",
                                                                 data: cellInfo,
                                                                 className: "btn btn-sm btn-danger ml-auto mr-auto",
                                                                 isAction: isRemoving,
                                                                 actionText: "Removing...",
                                                                 type: "button"}}
                                                 confirmationOptions={{title: "Confirm material removal",
                                                                       text: <span>Do you really want to remove the material <strong>{cellInfo.original.name}</strong> ?</span>,
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

    function onEvent(event, data, name, value) {
        const material = {_id: data._id};

        _.set(material, name, value);

        if (event === 'onBlur') {
            Meteor.call('materials.update', material, (error) => {
                if (error)
                    Alert.error("Error updating material: " + getErrorMessage(error));
            });
        }
    }

    return (
        <div id="materials">
            <ReactTable data={materials}
                        columns={getColumns()}
                        defaultPageSize={5}
                        collapseOnDataChange={false}
                        className="-striped -highlight"
                        getTdProps={() => ({style: {display: 'flex', flexDirection: 'column', justifyContent: 'center'}})}
                        SubComponent={({index, original}) => (<Properties material={original}/>)}
            />
        </div>
    );
}

/*
_Materials.propTypes = {
    sceneryId: PropTypes.string.isRequired
};
*/