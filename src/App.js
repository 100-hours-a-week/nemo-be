import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import KakaoLogin from './components/KakaoLogin';
import KakaoCallback from './components/KakaoCallback';
import Classroom from "./components/Classroom";
import ScheduleList from "./components/ScheduleList";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<KakaoLogin />} />
                <Route path="/classroom" element={<Classroom />} />
                <Route path="/schedule" element={<ScheduleList />} />
                <Route path="/oauth/kakao/callback" element={<KakaoCallback />} />
            </Routes>
        </Router>
    );
}

export default App;
