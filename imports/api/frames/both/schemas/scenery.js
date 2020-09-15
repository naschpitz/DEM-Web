import SimpleSchema from 'simpl-schema';

import Objects from './objects.js';

export default Scenery = new SimpleSchema({
    _id: {
        type: String,
        label: "Scenery id",
        regEx: SimpleSchema.RegEx.Id,
        optional: false
    },
    objects: {
        type: Objects,
        label: "Objects",
        optional: true
    },
});