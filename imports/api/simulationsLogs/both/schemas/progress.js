import SimpleSchema from 'simpl-schema';

export default Progress = new SimpleSchema({
    step: {
        type: Number,
        label: "Step",
        optional: true
    },
    totalSteps: {
        type: Number,
        label: "Step",
        optional: true
    },
    time: {
        type: Number,
        label: "Time",
        optional: true
    },
    et: {
        type: Number,
        label: "ET",
        optional: true
    },
    eta: {
        type: Number,
        label: "ETA",
        optional: true
    }
});