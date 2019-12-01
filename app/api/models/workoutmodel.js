const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var centroidSchema = new Schema({
    centroid: {
        type: [Number],
    },
});

// var centroidSchema = new Schema({
//     centroid: {
//         type: [String],
//         trim: true,
//     },
//     error: {
//         type: String,
//         trim: true,
//     },
//     size: {
//         type: Number,
//         default: 0,
//     },
// });

var modelSchema = new Schema({
    model: {
        it: {
            type: Number,
            default: 0,
        },
        k: {
            type: Number,
            default: 0,
        },
        centroids: {
            type: [],
        },
        idxs: {
            type: [Number],
            trim: true,
        },
    },
});
// var modelSchema = new Schema({
//     model: {
//         clusters: {
//             type: [Number],
//             trim: true,
//         },
//         centroids: {
//             type: [centroidSchema],
//         },
//         converged: {
//             type: Boolean,
//             default: false,
//         },
//         iterations: {
//             type: Number,
//             default: 0,
//         },
//     },
// });

module.exports = mongoose.model('WorkoutModel', modelSchema);
