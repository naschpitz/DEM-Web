import SimpleSchema from 'simpl-schema';

export default SolidObject = new SimpleSchema({
    _id: {
        type: String,
        label: "Solid Object id",
        regEx: SimpleSchema.RegEx.Id,
        optional: false
    },
    name: {
        type: String,
        label: "Name",
        optional: true
    },
    mass: {
        type: Number,
        label: "Mass",
        optional: true,
    },
    kineticEnergyTotal: {
        type: Number,
        label: "Kinetic energy total",
        optional: true,
    },
    kineticEnergyInternal: {
        type: Number,
        label: "Kinetic energy internal",
        optional: true,
    },
    kineticEnergyExternal: {
        type: Number,
        label: "Kinetic energy external",
        optional: true,
    },
    force: {
        type: Array,
        minCount: 1,
        maxCount: 3,
        defaultValue: [0, 0, 0],
        optional: true
    },
    'force.$': {
        type: Number
    },

    position: {
        type: Array,
        minCount: 1,
        maxCount: 3,
        defaultValue: [0, 0, 0],
        optional: true
    },
    'position.$': {
        type: Number
    },
    velocity: {
        type: Array,
        minCount: 1,
        maxCount: 3,
        defaultValue: [0, 0, 0],
        optional: true
    },
    'velocity.$': {
        type: Number
    }
});