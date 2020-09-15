import SimpleSchema from 'simpl-schema';

import Vertex from '../../../sharedSchemas/vertex.js';

export default Face = new SimpleSchema({
    currentPosition: {
        type: Array,
        minCount: 1,
        maxCount: 3,
        defaultValue: [0, 0, 0],
        optional: true
    },
    'currentPosition.$': {
        type: Number
    },
    currentVelocity: {
        type: Array,
        minCount: 1,
        maxCount: 3,
        defaultValue: [0, 0, 0],
        optional: true
    },
    'currentVelocity.$': {
        type: Number
    },
    currentForce: {
        type: Array,
        minCount: 1,
        maxCount: 3,
        defaultValue: [0, 0, 0],
        optional: true
    },
    'currentForce.$': {
        type: Number
    },
    vertexes: {
        type: [Vertex],
        label: "Vertexes",
        minCount: 1,
        maxCount: 3
    }
});