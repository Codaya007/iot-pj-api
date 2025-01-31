const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
    name: String,
    // location: String,
    additionalInformation: String,
    hours: String,
    uuid: String, // Identificador único del lugar (para asociarlo con notificaciones)
    adjacencyPlaces: [String],
    enabled: { type: Boolean, default: true },
});

const notificationSchema = new mongoose.Schema({
    placeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Place' }, // Relación con un lugar
    message: String,
    date: { type: Date, default: Date.now },
    enabled: { type: Boolean, default: true },
});

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            minlength: 3,
            maxlength: 25,
        },
        lastname: {
            type: String,
            required: true,
            min: 3,
            max: 25,
        },
        email: {
            type: String,
            required: true,
            min: 5,
            max: 40,
        },
        password: {
            type: String,
            required: true,
            min: 5,
            max: 61,
        },
        enabled: {
            type: Boolean,
            default: true,
        },
        token: {
            type: String,
            required: false,
        },
        tokenExpiresAt: {
            type: Date,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);


const User = mongoose.model("users", userSchema);
const Place = mongoose.model('Place', placeSchema);
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = { Place, Notification, User };