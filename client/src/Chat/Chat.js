import './Chat.css';
import React, { useState, useEffect, useRef } from "react";
import { Scrollbars } from 'react-custom-scrollbars';
//-------------------------------------------------------------
import Peer from "simple-peer";

function Chat( { socket, nickname, room } ) {

    const [message, setMessage] = useState("");
    const [messageList, setMessageList] = useState([]);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messageList]);

    const messageHandler = (event) => {
        setMessage(event.target.value);
    };

    const handleEnter = (event) => {
        if (event.key === 'Enter') {
            sendMessage();}
    };

    const sendMessage = async () => {
        if (message !== "") {
          const messageData = {
            room: room,
            nickname: nickname,
            message: message,
            time: new Date(Date.now()).getHours() + ":" + new Date(Date.now()).getMinutes(),
          };

          //emituje wiadomosc i ja wysylam do serwera
          await socket.emit("send_message", messageData);
          setMessageList((list) => [...list, messageData]);
          setMessage("");
        }
      };

      //odbieranie wiadomosci
      useEffect(() => {
        socket.on("receive_message", (data) => {
            setMessageList((list) => [...list, data]);
        });
      }, [socket]);

      
    return (
        <div className='chat'>
            <h1 className='room-header'>Room number: {room}</h1>
            <div className="messages">
                <Scrollbars className="scroll">
                {messageList.map((displayMessage) => {
                    return (
                        <div className='container' 
                            id={nickname === displayMessage.nickname ? "me" : "you"}>
                            <div className='messages-info'> 
                                <p className='message-nickname'> {displayMessage.nickname}</p>
                                <p className='message-value'>{displayMessage.message}</p> 
                                <p className='message-date'> {displayMessage.time}</p>
                            </div>
                        </div>
                        )
                })}
                <div ref={messagesEndRef} className="scroll1" />
                </Scrollbars>
                <div className='write-message'>
                    <input type="text" 
                        onChange={messageHandler} 
                        onKeyPress={(e) => handleEnter(e)} value={message}>        
                    </input>

                    <button onClick={sendMessage}> 
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-send" viewBox="0 0 16 16">
                        <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;