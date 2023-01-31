const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require("socket.io");
const server = http.createServer(app);
app.use(cors()); // identyfikujemy główny obiekt z mechanizmem cors


const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

//polaczenie do serwera
io.on("connection", (socket) => {
    console.log("Joined:", socket.id);

    socket.emit("me", socket.id)

    //rozlaczenie z serwerem
    socket.on("disconnect", () => {
      console.log("user:", socket.id, "Disconnected ");
    });

    //dolaczenie do konkretnego pokoju, poprzez "join" .on odbiera wiadomosci od klienta 
    socket.on("join", (roomData) => {
      socket.join(roomData);
      console.log("--------------Joined to room", roomData, "by:", socket.id);
    });

    //dolaczenie do konkretnego pokoju voice chatu, poprzez "joinV" 
    socket.on("joinV", (data) => {
      socket.join(data);
      console.log("--------------Joined to room", data, "by:", socket.id);
    });

    //emitowanie wiadomosci i wysylanie jej do konkretnego pokoju
    socket.on("send_message", (data) => {
      socket.to(data.room).emit("receive_message", data);
      console.log(data);
    });

    //rozpoczecie wideo czatu poprzez numer pokoju, w ktorym jestesmy poprzez "callRoom"
    socket.on("callRoom", (data) => {
      io.to(data.roomToCall).emit("callRoom", { signal: data.signalData, from: data.from, nickname: data.nickname 
      })
    });
  
    //odebranie polaczenia
    socket.on("answerCall", (data) => {
      io.to(data.to).emit("callAccepted", data.signal)
    });
});

server.listen(3001, () => {
  console.log('listening on: 3001');
});

//wartosci dla cors, ktore przypisuje
/*
const io = new require("socket.io")( {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});*/