// require("dotenv").config();
// const express = require('express');
// const { graphqlHTTP } = require('express-graphql');
// const { buildSchema } = require('graphql');
// const mongoose = require('mongoose');
// const { DB_URI, PORT } = process.env;
// const cors = require("cors");

// // Conectar a MongoDB
// mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// // Definir el esquema de GraphQL
// const schema = buildSchema(`
//   type Query {
//     rooms: [Room]
//   }
//   type Mutation {
//     reportPresence(macAddress: String!, rssi: Int!): String
//   }
//   type Room {
//     id: ID!
//     name: String!
//     people: [Person]

//     base: Float!
//     height: Float!

//   }
//   type Person {
//     id: ID!
//     macAddress: String!
//     room: Room!
//     username: String!
//     }
//       `);
// // doorSides: [{side:String!, separation:Float!}]


// const Room = mongoose.model('Room', { name: String });
// const Person = mongoose.model('Person', { macAddress: String, room: mongoose.Schema.Types.ObjectId });

// // Resolver las peticiones GraphQL
// const root = {
//   rooms: async () => await Room.find(),
//   reportPresence: async ({ macAddress, rssi }) => {
//     let person = await Person.findOne({ macAddress });
//     if (!person) {
//       const room = await Room.findOne({ name: determineRoomByRSSI(rssi) });
//       person = new Person({ macAddress, room: room._id });
//       await person.save();
//     } else {
//       // Actualizar la ubicación de la persona
//       const room = await Room.findOne({ name: determineRoomByRSSI(rssi) });
//       person.room = room._id;
//       await person.save();
//     }
//     return "Presence reported";
//   }
// };

// function determineRoomByRSSI(rssi) {
//   // Define aquí la lógica para asignar habitaciones basadas en el RSSI
//   if (rssi > -60) return "Sala";
//   if (rssi > -80) return "Cocina";
//   return "Cuarto";
// }

// const app = express();
// app.use(cors());
// app.use('/graphql', graphqlHTTP({
//   schema: schema,
//   rootValue: root,
//   graphiql: true,
// }));

// app.listen(PORT, () => console.log('Servidor GraphQL corriendo en el puerto 4000'));