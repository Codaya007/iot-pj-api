require("dotenv").config();
const express = require('express');
const cors = require('cors');
const { DB_URI, PORT } = process.env;
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { Place, Notification } = require("./models/index");
const appRouter = require("./routes/index.routes");
var logger = require("morgan");
const errorHandler = require("./middlewares/errorHandler");
const notFound = require("./middlewares/notFound");

const app = express();


app.use(logger("dev"));

// Conectar a MongoDB
mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

app.use(cors());
app.use(bodyParser.json());

//! AÑADO LAS RUTAS
app.use("/api", appRouter);

//! CRUD para Lugares (Places)
// Crear un nuevo lugar
app.post('/api/places', async (req, res) => {
  const { name, location, hours, uuid, additionalInformation, adjacencyPlaces = [] } = req.body;

  const newPlace = new Place({ name, location, hours, uuid, additionalInformation, adjacencyPlaces });
  await newPlace.save();

  res.json(newPlace);
});

// Obtener todos los lugares
// Obtener todos los lugares
app.get('/api/places', async (req, res) => {
  const { skip = 0, limit = 10, search = '', ...where } = req.query;

  // Construir el objeto de búsqueda
  const searchQuery = {
    $or: [
      { name: { $regex: search, $options: 'i' } }, // Búsqueda insensible a mayúsculas/minúsculas
      { additionalInformation: { $regex: search, $options: 'i' } }
    ]
  };

  // Combinar los filtros adicionales con la búsqueda
  const query = search ? { ...where, ...searchQuery } : where;

  try {
    // Obtener los resultados con paginación
    const results = await Place.find(query)
      .skip(Number(skip))
      .limit(Number(limit));

    // Contar el total de documentos que coinciden con la consulta
    const totalCount = await Place.countDocuments(query);

    // Calcular el número total de páginas
    const totalPages = Math.ceil(totalCount / limit);

    // Enviar la respuesta
    res.json({
      results,
      totalCount,
      totalPages,
      currentPage: Math.floor(skip / limit) + 1
    });
  } catch (error) {
    console.error('Error al obtener los lugares:', error);
    res.status(500).json({ message: 'Error al obtener los lugares' });
  }
});

app.get('/api/places/:id', async (req, res) => {
  const { id } = req.params;

  const results = await Place.findById(id);

  res.json(results);
});

// Actualizar un lugar por id
app.put('/api/places/:id', async (req, res) => {
  const updatedPlace = await Place.findByIdAndUpdate(req.params.id, req.body, { new: true });

  res.json(updatedPlace);
});

// Buscar lugar por uuid
app.get('/api/places/uuid/:uuid', async (req, res) => {
  const place = await Place.findOne({ uuid: req.params.uuid });

  res.json(place);
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
  const { skip = 0, limit = 10, ...where } = req.query;
  const results = await Notification.find(where).skip(skip).limit(limit).populate('placeId');
  const totalCount = await Notification.countDocuments(where);

  res.json({ results, totalCount });
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
  const updatedNotification = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true });

  res.json(updatedNotification);
});

app.get('/api/notifications/:id', async (req, res) => {
  const updatedNotification = await Notification.findById(req.params.id);

  res.json(updatedNotification);
});

// Eliminar una notificación por id
app.delete('/api/notifications/:id', async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.json({ message: 'Notificación eliminada' });
});

app.use("*", notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
