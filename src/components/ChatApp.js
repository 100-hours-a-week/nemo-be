import React, { useState, useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axios from 'axios';

const ChatApp = () => {
    const [stompClient, setStompClient] = useState(null);
    const [currentRoom, setCurrentRoom] = useState("1");
    const [subscription, setSubscription] = useState(null);
    const [messages, setMessages] = useState([]);
    const [connected, setConnected] = useState(false);
    const [content, setContent] = useState("");

    const setConnectedState = (connected) => {
        setConnected(connected);
        document.getElementById("conversation").style.display = connected ? "block" : "none";
        if (!connected) {
            setMessages([]); // Clear messages when disconnected
        }
    };

    const connect = () => {
        const socket = new SockJS('https://www.nemooceanacademy.com:5000/ws');
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                setStompClient(client); // 상태 업데이트
                setConnectedState(true);

                console.log('STOMP client connected');
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
            onDisconnect: () => {
                setConnectedState(false);
                console.log("Disconnected");
            }
        });

        client.activate();
    };

    // useEffect를 사용하여 stompClient 상태가 업데이트된 후 작업 수행
    useEffect(() => {
        if (stompClient && connected) {
            console.log(stompClient);
            console.log("Attempting to subscribe...");
            subscribeToRoom(currentRoom); // 현재 방에 구독
            loadChatHistory(currentRoom); // 현재 방의 채팅 기록 로드
        }
    }, [stompClient, connected, currentRoom]);

    const disconnect = () => {
        if (stompClient) {
            stompClient.deactivate();
            setConnectedState(false);
            console.log("Disconnected");
        }
    };

    const subscribeToRoom = (roomId) => {
        if (!stompClient) {
            console.error('STOMP client is not initialized. Cannot subscribe.');
            return;
        }
    
        if (!stompClient.connected) {
            console.error('STOMP client is not connected. Cannot subscribe.');
            return;
        }
    
        if (subscription) {
            console.log('Unsubscribing from previous room');
            subscription.unsubscribe();  // 이전 방에 대한 구독 해제
        }
        
        console.log("Attempting to subscribe to roomId = " + roomId);
        console.log("currentRoom = " + currentRoom);
        
        try {
            const newSubscription = stompClient.subscribe(`/topic/greetings/${roomId}`, (greeting) => {
                const messageContent = JSON.parse(greeting.body).content;
                console.log(`Received message: ${messageContent}`);
                showGreeting(roomId, messageContent);
            });
    
            setSubscription(newSubscription);
            console.log("Successfully subscribed to room " + roomId);
        } catch (error) {
            console.error("Failed to subscribe: ", error);
        }
    };

    const sendMessage = () => {
        if (stompClient && stompClient.connected) {
            const chatMessage = {
                roomId: Number(currentRoom),  // Ensure it's a number
                content: content,
                writerId: 123,  // Ensure it's a number
                createdDate: new Date().toISOString()  // Convert Date to ISO 8601 string
            };
            
            console.log("chat message = " + JSON.stringify(chatMessage));

            // 메시지를 서버로 전송
            stompClient.publish({
                destination: "/app/hello",
                body: JSON.stringify(chatMessage),
            });

            // 입력 필드를 초기화하고 메시지를 UI에 추가
            setContent('');
            //showGreeting(currentRoom, content);
        } else {
            console.error('STOMP client is not connected. Cannot send message.');
        }
    };

    const showGreeting = (room, message) => {
        setMessages(prevMessages => [...prevMessages, { room, message }]);
    };

    const loadChatHistory = (roomId) => {
        axios.get(`https://www.nemooceanacademy.com:5000/find/chat/list/${roomId}`)
            .then(response => {
                setMessages(response.data.map(msg => ({
                    room: roomId,
                    message: msg.content
                })));
            })
            .catch(error => {
                console.error("Failed to load chat history:", error);
            });
    };

    return (
        <div className="container" id="main-content">
            <div className="row">
                <div className="col-md-6">
                    <form className="form-inline" onSubmit={(e) => e.preventDefault()}>
                        <div className="form-group">
                            <label>WebSocket connection:</label>
                            <button 
                                type="button" 
                                className="btn btn-default" 
                                onClick={connect} 
                                disabled={connected}
                            >
                                Connect
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-default" 
                                onClick={disconnect} 
                                disabled={!connected}
                            >
                                Disconnect
                            </button>
                        </div>
                        <div className="form-group">
                            <label>Select Room:</label>
                            <select 
                                className="form-control" 
                                value={currentRoom} 
                                onChange={(e) => {
                                    const newRoom = e.target.value;
                                    setCurrentRoom(newRoom);
                                    if (connected && stompClient) {
                                        subscribeToRoom(newRoom);  // 새로운 방에 구독
                                        loadChatHistory(newRoom);  // 새로운 방의 채팅 기록 로드
                                    }
                                }}
                            >
                                <option value="1">Room 1</option>
                                <option value="2">Room 2</option>
                                <option value="3">Room 3</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div className="col-md-6">
                    <form className="form-inline" onSubmit={(e) => e.preventDefault()}>
                        <div className="form-group">
                            <label>Chatting</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                value={content} 
                                onChange={(e) => setContent(e.target.value)} 
                                placeholder="Enter your message"
                            />
                        </div>
                        <button 
                            type="button" 
                            className="btn btn-default" 
                            onClick={sendMessage}
                            disabled={!connected}
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>
            <div className="row">
                <div className="col-md-12">
                    <h3>Messages</h3>
                    <table className="table table-striped" id="conversation" style={{ display: 'none' }}>
                        <thead>
                            <tr>
                                <th>Room</th>
                                <th>Message</th>
                            </tr>
                        </thead>
                        <tbody id="greetings">
                            {messages.map((msg, index) => (
                                <tr key={index}>
                                    <td>Room {msg.room}</td>
                                    <td>{msg.message}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ChatApp;