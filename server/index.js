const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require("socket.io");
const server = http.createServer(app);
app.use(cors()); // identyfikujemy główny obiekt z mechanizmem cors

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCeTn0ez0tn3CclqV2-Aez671Zg4WjP0kg",
  authDomain: "chot-559af.firebaseapp.com",
  projectId: "chot-559af",
  storageBucket: "chot-559af.appspot.com",
  messagingSenderId: "917398569742",
  appId: "1:917398569742:web:56efb8d0f325e73a3d8d5f",
  measurementId: "G-SSB68P1EZ4"
};

// Initialize Firebase
const application = initializeApp(firebaseConfig);
const analytics = getAnalytics(application);

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