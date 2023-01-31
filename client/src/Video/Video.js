import './Video.css';
import React, { useState, useEffect, useRef } from "react";
import Peer from "simple-peer";



function Video( { socket, room, nickname } ) {

 	const [ stream, setStream ] = useState()

	const [ receivingCall, setReceivingCall ] = useState(false)
    const [ caller, setCaller ] = useState()
	const [ isCaller, setIsCaller] = useState(false)
	const [ callerName, setCallerName ] = useState('')
	const [ callerSignal, setCallerSignal ] = useState()

	const [ callAccepted, setCallAccepted ] = useState(false)
	const [ callEnded, setCallEnded] = useState(false)
	
    const myVideo = useRef()
	const userVideo = useRef()

	const connectionRef= useRef()

    const constraints = {
        'video': true,
        'audio': true
    }    

    //wyskakujace okienko pytajace na udostepnienie kamery i mikrofonu oraz ustawienie myVideo na aktualny strumien danych
    useEffect(() => {
        navigator.mediaDevices.getUserMedia(constraints)
        .then((stream) => {
            setStream(stream)
            myVideo.current.srcObject = stream
        });

        //proba nawiazania polaczenia od uzytkownika poprzez "callRoom"
        socket.on("callRoom", (data) => {
            setReceivingCall(true)
            setCaller(data.from)
            setCallerSignal(data.signal)
			setCallerName(data.nickname)
        });
    }, [socket]);

    //nowe polaczenie peer-peer
	const callRoom = (id) => {
		setIsCaller(!isCaller)
		const peer = new Peer({
			initiator: true,
			trickle: false,
			stream: stream
		});

        //przeslanie danych do serwera
		peer.on("signal", (data) => {
			socket.emit("callRoom", {
				roomToCall: room,
				signalData: data,
				from: socket.id,
				nickname: nickname
			});
		});

        //ustawienie wideo czatu
		peer.on("stream", (stream) => {
			userVideo.current.srcObject = stream
		});

		socket.on("callAccepted", (signal) => {
			setCallAccepted(true);
			peer.signal(signal);
		});

        //obecne polaczenie jest rowne peer'owi
		connectionRef.current = peer
	};

    const answerCall = () =>  {
		setCallAccepted(true)
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream: stream
		});

        //nawiazanie polaczenia wideo
		peer.on("signal", (data) => {
			socket.emit("answerCall", { signal: data, to: caller });
		});

        //ustawienie wideo czatu dla odbiorcy
		peer.on("stream", (stream) => {
			userVideo.current.srcObject = stream;
		});

        //obecne polaczenie jest rowne peer'owi
		peer.signal(callerSignal)
		connectionRef.current = peer
	};

	const leaveCall = () => {
		setCallEnded(true);
		connectionRef.current.destroy();
        window.location.replace("http://localhost:3000");
	};

    return (
		<div className="video">
			<div className='video-container'>
				<div className={`myvideo ${callAccepted ? "myvideo-accepted" : ''}`}>
                    <video playsInline muted ref={myVideo} autoPlay/>
                </div>

                <div className="uservideo">
                    {callAccepted && !callEnded ?
                    <video playsInline ref={userVideo} autoPlay  />:
                    null}
                </div>
			</div>
			
            <div className="home-user ">
				<div className="call-info buttons-video">
					{callAccepted && !callEnded ? (
						<button onClick={leaveCall}> 
                            <span>
								End Call
							</span>
                        </button>
					) : (
						<button onClick={() => callRoom(room)}>
                            <span>
								Voice Chat
							</span>
						</button>
					)}
				
				{receivingCall && !callAccepted && !isCaller ? (
					<div className="caller">
						<div className='caller-info'>
							<h1> Someone is calling {callerName}
							 </h1>
							<button onClick={answerCall}>
								<span>
									Answer
								</span>
							</button>
						</div>						
					</div>
				) : null}
			    </div>
			</div>
        </div>
	)
}

export default Video;