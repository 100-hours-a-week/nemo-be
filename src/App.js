import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import KakaoLogin from './components/KakaoLogin';
import KakaoCallback from './components/KakaoCallback';
import ChatApp from './components/ChatApp';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<KakaoLogin />} />
                <Route path="/oauth/kakao/callback" element={<KakaoCallback />} />
                <Route path="/chat" element={<ChatApp />} />
            </Routes>
        </Router>
    );
}

export default App;
