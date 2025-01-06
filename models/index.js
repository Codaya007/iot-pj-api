const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
    name: String,
    // location: String,
    additionalInformation: String,
    hours: String,
    uuid: String, // Identificador único del lugar (para asociarlo con notificaciones)
    adjacencyPlaces: [String]
});

const notificationSchema = new mongoose.Schema({
    placeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Place' }, // Relación con un lugar
    message: String,
    date: { type: Date, default: Date.now }
});

const Place = mongoose.model('Place', placeSchema);
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = { Place, Notification };