import SimpleSchema from 'simpl-schema';

import NonSolidObject from './nonSolidObject.js';
import SolidObject from './solidObject.js';

export default Objects = new SimpleSchema({
    nonSolidObjects: {
        type: Array,
        label: "Non-Solid Objects",
        optional: true,
    },
    'nonSolidObjects.$': {
        type: NonSolidObject,
        label: "Non-Solid Object"
    },
    solidObjects: {
        type: Array,
        label: "Solid Objects",
        optional: true
    },
    'solidObjects.$': {
        type: SolidObject,
        label: "Solid Object"
    }
});