const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const appConfig = require('../../../config/appConfig');
const saltRounds = appConfig.saltRounds;
const Schema = mongoose.Schema;

var contactSchema = new Schema({
    firstName: {
        type: String,
        trim: true,
        required: true,
    },
    lastName: {
        type: String,
        trim: true,
        required: true,
    },
    address: {
        street: {
            type: String,
            trim: true,
            default: '',
        },
        city: {
            type: String,
            trim: true,
            default: '',
        },
        state: {
            type: String,
            trim: true,
            default: '',
        },
        postal: {
            type: String,
            trim: true,
            default: '',
        },
        country: {
            type: String,
            trim: true,
            default: '',
        },
    },
    phone: {
        type: String,
        trim: true,
    },
    additionalInfo: {
        type: String,
        trim: true,
        default: '',
        maxlength: 500,
    }
});

var fitBitTokenSchema = new Schema({
    accessToken: {
        type: String,
        trim: true,
        default: '',
    },
    expiresIn: {
        type: Date,
        default: Date.now,
    },
    refreshToken: {
        type: String,
        trim: true,
        default: '',
    },
    scope: {
        type: String,
        trim: true,
        default: '',
    },
    tokenType: {
        type: String,
        trim: true,
        default: '',
    },
    userId: {
        type: String,
        trim: true,
        default: '',
    },
});

var userSchema = new Schema({
    email: {
        type: String,
        trim: true,
        maxlength: 320,
        required: true,
        unique: true,
        validate: [(value) => {
            return validator.isEmail(value);
        }, "Invalid email."],
    },
    password: {
        type: String,
        trim: true,
        require: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    createdDate: {
        type: Date,
        default: Date.now,
    },
    contact: {
        type: contactSchema,
    },
    fitbitToken: {
        type: fitBitTokenSchema,
    },
    weight: {
        type: [Number],
    },
});

userSchema.pre('save', async function(next){
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
});

module.exports = mongoose.model('Users',userSchema);