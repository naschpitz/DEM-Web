import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import _ from 'lodash';

import MaterialsClass from '../../../../../../../api/materials/both/class.js';

import Alert from 'react-s-alert';
import FormInput from '@naschpitz/form-input'

import './properties.css';

export default Properties = (props) => {
    const [ isReady, setIsReady ] = useState(false);

    useTracker(() => {
        Meteor.subscribe('materials.list',  props.material.owner, {
            onStop: (error) => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
            onReady: () => (setIsReady(true))
        });
    }, [ props.material ]);

    const materials = useTracker(() => {
        return MaterialsClass.find({owner: props.material.owner}).fetch();
    });

    const material = props.material;

    function onEvent(event, name, value) {
        const material = _.cloneDeep(props.material);

        _.set(material, name, value);

        Meteor.call('materials.update', material, (error) => {
            if (error)
                Alert.error("Error saving material: " + error.reason);
        })
    }

    function getForceCoefficientsInputs() {
        const forceType = material.forceType;

        const coefficients = [];

        switch (forceType) {
            case 'adiabatic_compression': {
                coefficients.push(
                    {
                        label: 'P0',
                        name: 'coefficients[0]',
                        value: _.get(material, 'coefficients[0]')
                    }
                );

                coefficients.push(
                    {
                        label: 'Gamma',
                        name: 'coefficients[1]',
                        value: _.get(material, 'coefficients[1]')
                    }
                );

                break;
            }

            case 'hooks_law': {
                coefficients.push(
                    {
                        label: 'K',
                        name: 'coefficients[0]',
                        value: _.get(material, 'coefficients[0]')
                    }
                );

                break;
            }

            case 'inverse_linear': {
                coefficients.push(
                    {
                        label: 'K',
                        name: 'coefficients[0]',
                        value: _.get(material, 'coefficients[0]')
                    }
                );

                break;
            }

            case 'inverse_quadratic': {
                coefficients.push(
                    {
                        label: 'K',
                        name: 'coefficients[0]',
                        value: _.get(material, 'coefficients[0]')
                    }
                );

                break;
            }

            case 'inverse_cubic': {
                coefficients.push(
                    {
                        label: 'K',
                        name: 'coefficients[0]',
                        value: _.get(material, 'coefficients[0]')
                    }
                );
                break;
            }

            case 'lennard_jones': {
                coefficients.push(
                    {
                        label: 'Epsilon',
                        name: 'coefficients[0]',
                        value: _.get(material, 'coefficients[0]')
                    },
                    {
                        label: 'N',
                        name: 'coefficients[1]',
                        value: _.get(material, 'coefficients[1]')
                    }
                );

                break;
            }

            case 'realistic_material': {
                coefficients.push(
                    {
                        label: 'Rupture',
                        name: 'coefficients[0]',
                        value: _.get(material, 'coefficients[0]')
                    }
                );

                coefficients.push(
                    {
                        label: 'Elastic limit',
                        name: 'coefficients[1]',
                        value:_.get(material, 'coefficients[1]')
                    }
                );

                coefficients.push(
                    {
                        label: 'Plastic maximum',
                        name: 'coefficients[2]',
                        value: _.get(material, 'coefficients[2]')
                    }
                );

                break;
            }
        }

        return getCoefficientsInputs(coefficients);
    }

    function getDragForceCoefficientsInputs() {
        const dragForceType = props.material.dragForceType;

        const dragCoefficients = [];

        switch (dragForceType) {
            case 'linear':
                dragCoefficients.push(
                    {
                        label: 'C0',
                        name: 'dragCoefficients[0]',
                        value:_.get(props.material, 'dragCoefficients[0]')
                    }
                );
                break;

            case 'quadratic':
                dragCoefficients.push(
                    {
                        label: 'C0',
                        name: 'dragCoefficients[0]',
                        value:_.get(props.material, 'dragCoefficients[0]')
                    }
                );
                break;

            case 'cubic':
                dragCoefficients.push(
                    {
                        label: 'C0',
                        name: 'dragCoefficients[0]',
                        value:_.get(material, 'dragCoefficients[0]')
                    }
                );
                break;
        }

        return getCoefficientsInputs(dragCoefficients);
    }

    function getCoefficientsInputs(coefficients) {
        return (
            <div>
                {coefficients.map((coefficient) => (
                    <FormInput label={coefficient.label}
                               name={coefficient.name}
                               value={coefficient.value}
                               type="field"
                               subtype="number"
                               size="small"
                               labelSizes={{sm: 6, md: 4, lg: 4}}
                               inputSizes={{sm: 6, md: 6, lg: 6}}
                               onEvent={onEvent}
                    />
                ))}
            </div>
        )
    }

    let materialsOptions = materials.map((materialItem) => {
        if (materialItem._id === material._id)
            return null;

        return {value: materialItem._id, text: materialItem.name}
    });

    materialsOptions = _.compact(materialsOptions);
    materialsOptions.unshift({value: '', text: "-- Select Material --"});

    const forcesOptions = [
        { value: '',                      text: "-- Select Force --"    },
        { value: 'adiabatic_compression', text: "Adiabatic Compression" },
        { value: 'hooks_law',             text: "Hook's Law"            },
        { value: 'inverse_linear',        text: "Inverse Linear"        },
        { value: 'inverse_quadratic',     text: "Inverse Quadratic"     },
        { value: 'inverse_cubic',         text: "Inverse Cubic"         },
        { value: 'lennard_jones',         text: "Lennard-Jones"         },
        { value: 'realistic_material',    text: "Realistic Material"    }
    ];

    const dragForcesOptions = [
        { value: '',          text: "-- Select Drag Force --" },
        { value: 'linear',    text: "Linear"                  },
        { value: 'quadratic', text: "Quadratic"               },
        { value: 'cubic',     text: "Cubic"                   },
    ];

    return (
        <div id="materialProperties">
            <div className="row">
                <div className="col-md-4">
                    <FormInput label="Material 1"
                               name="material1"
                               value={material.material1}
                               type="dropdown"
                               subtype="string"
                               options={materialsOptions}
                               size="small"
                               labelSizes={{sm: 6, md: 4, lg: 4}}
                               inputSizes={{sm: 6, md: 6, lg: 6}}
                               onEvent={onEvent}
                    />
                </div>

                <div className="col-md-4">
                    <FormInput label="Material 2"
                               name="material2"
                               value={material.material2}
                               type="dropdown"
                               subtype="string"
                               options={materialsOptions}
                               size="small"
                               labelSizes={{sm: 6, md: 4, lg: 4}}
                               inputSizes={{sm: 6, md: 6, lg: 6}}
                               onEvent={onEvent}
                    />
                </div>

                <div className="col-md-4">
                    <FormInput label="Distance Threshold"
                               name="distanceThreshold"
                               value={material.distanceThreshold}
                               type="field"
                               subtype="number"
                               size="small"
                               labelSizes={{sm: 6, md: 4, lg: 4}}
                               inputSizes={{sm: 6, md: 6, lg: 6}}
                               onEvent={onEvent}
                    />
                </div>
            </div>

            <hr/>

            <div className="row">
                <div className="col-md-4">
                    <FormInput label="Force"
                               name="forceType"
                               value={material.forceType}
                               type="dropdown"
                               subtype="string"
                               options={forcesOptions}
                               size="small"
                               labelSizes={{sm: 6, md: 4, lg: 4}}
                               inputSizes={{sm: 6, md: 6, lg: 6}}
                               onEvent={onEvent}
                    />

                    {getForceCoefficientsInputs()}
                </div>

                <div className="col-sm-12 col-md-4">
                    <FormInput label="Drag"
                               name="dragForceType"
                               value={material.dragForceType}
                               type="dropdown"
                               subtype="string"
                               options={dragForcesOptions}
                               size="small"
                               labelSizes={{sm: 6, md: 4, lg: 4}}
                               inputSizes={{sm: 6, md: 6, lg: 6}}
                               onEvent={onEvent}
                    />

                    {getDragForceCoefficientsInputs()}
                </div>
            </div>
        </div>
    )
}

/*
_Properties.propTypes = {
    material: PropTypes.object.isRequired
};
*/