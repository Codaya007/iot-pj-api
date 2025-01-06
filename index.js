require("dotenv").config();
const express = require('express');
const cors = require('cors');
const { DB_URI, PORT } = process.env;
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { Place, Notification } = require("./models/index");

const app = express();

// Conectar a MongoDB
mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

app.use(cors());
app.use(bodyParser.json());

//! CRUD para Lugares (Places)
// Crear un nuevo lugar
app.post('/api/places', async (req, res) => {
  const { name, location, hours, uuid, additionalInformation, adjacencyPlaces = [] } = req.body;

  // console.log({ hours })

  const newPlace = new Place({ name, location, hours, uuid, additionalInformation, adjacencyPlaces });
  await newPlace.save();

  res.json(newPlace);
});

// Obtener todos los lugares
app.get('/api/places', async (req, res) => {
  const places = await Place.find();
  res.json(places);
});

// Actualizar un lugar por id
app.put('/api/places/:id', async (req, res) => {
  const { name, location, hours, uuid } = req.body;
  const updatedPlace = await Place.findByIdAndUpdate(req.params.id, { name, location, hours, uuid }, { new: true });
  res.json(updatedPlace);
});

// Eliminar un lugar por id
app.delete('/api/places/:id', async (req, res) => {
  await Place.findByIdAndDelete(req.params.id);
  res.json({ message: 'Lugar eliminado' });
});

//! CRUD para Notificaciones (Notifications)
// Crear una nueva notificación para un lugar
app.post('/api/notifications', async (req, res) => {
  const { placeId, message } = req.body;

  const newNotification = new Notification({ placeId, message });
  await newNotification.save();
  res.json(newNotification);
});

// Obtener todas las notificaciones
app.get('/api/notifications', async (req, res) => {
  const notifications = await Notification.find().populate('placeId');

  res.json(notifications);
});

// Obtener notificaciones relacionadas a un lugar (uuid)
app.get('/api/notifications/place/:uuid', async (req, res) => {
  const place = await Place.findOne({ uuid: req.params.uuid });

  if (!place) {
    return res.status(404).json({ message: 'Lugar no encontrado' });
  }

  const additionalInfoNotifications = [{
    _id: 0,
    placeId: place._id,
    message: `Estás cerca de '${place.name}'. ${place.additionalInformation}. Horario de atención: ${place.hours}`
  },
  {
    _id: 1,
    placeId: place._id,
    message: `Otros lugares cercanos: ${place.adjacencyPlaces.join(", ")}`
  }];

  const notifications = await Notification.find({ placeId: place._id });

  res.json([...additionalInfoNotifications, notifications]);
});

// Actualizar una notificación por id
app.put('/api/notifications/:id', async (req, res) => {
  const { placeId, message } = req.body;
  const updatedNotification = await Notification.findByIdAndUpdate(req.params.id, { placeId, message }, { new: true });
  res.json(updatedNotification);
});

// Eliminar una notificación por id
app.delete('/api/notifications/:id', async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.json({ message: 'Notificación eliminada' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
