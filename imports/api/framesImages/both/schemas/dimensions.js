import SimpleSchema from 'simpl-schema';

export default Dimensions = new SimpleSchema({
    width: {
        type: Number,
        label: "Width",
        optional: false
    },
    height: {
        type: Number,
        label: "Height",
        optional: false
    }
});