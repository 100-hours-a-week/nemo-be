import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ScheduleList = () => {
    const [schedules, setSchedules] = useState([]);
    const [newSchedule, setNewSchedule] = useState({
        content: '',
        date: '',
        startTime: '',
        finishTime: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [classId, setClassId] = useState(1); // 초기 classId를 1로 설정
    const [availableClasses] = useState([1, 2, 3, 4]); // 선택할 수 있는 클래스 ID 목록

    const token = localStorage.getItem("accessToken");

    // 스케줄 조회
    const fetchSchedules = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`z/api/classes/${classId}/schedule`, {
                headers: {
                    // Authorization: `Bearer ${token}`
                }
            });
            setSchedules(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 스케줄 생성
    const createSchedule = async () => {
        try {
            const response = await axios.post(
                `http://localhost:8080/api/classes/${classId}/schedule`,
                newSchedule,
                {
                    headers: {
                        // Authorization: `Bearer ${token}`
                    }
                }
            );
            setSchedules([...schedules, response.data]);
            setNewSchedule({
                content: '',
                date: '',
                startTime: '',
                finishTime: ''
            });
        } catch (err) {
            setError(err.message);
        }
    };

    // 스케줄 삭제
    const deleteSchedule = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/classes/${classId}/schedule/${id}`, {
                headers: {
                    // Authorization: `Bearer ${token}`
                }
            });
            setSchedules(schedules.filter((schedule) => schedule.id !== id));
        } catch (err) {
            setError(err.message);
        }
    };

    // 클래스 ID 변경 시 스케줄 재조회
    useEffect(() => {
        fetchSchedules();
    }, [classId]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h2>Select Class</h2>
            <div>
                {availableClasses.map((id) => (
                    <button
                        key={id}
                        onClick={() => setClassId(id)}
                        style={{
                            backgroundColor: classId === id ? 'lightgreen' : 'lightgray',
                            margin: '0 5px',
                            padding: '10px',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Class {id}
                    </button>
                ))}
            </div>

            <h2>Schedule List for Class {classId}</h2>
            <ul>
                {schedules.map((schedule) => (
                    <li key={schedule.id}>
                        <p>{schedule.content}</p>
                        <p>{schedule.date} {schedule.startTime} - {schedule.finishTime}</p>
                        <button onClick={() => deleteSchedule(schedule.id)}>Delete</button>
                    </li>
                ))}
            </ul>

            <h2>Create Schedule for Class {classId}</h2>
            <input
                type="text"
                placeholder="Content"
                value={newSchedule.content}
                onChange={(e) => setNewSchedule({ ...newSchedule, content: e.target.value })}
            />
            <input
                type="date"
                placeholder="Date"
                value={newSchedule.date}
                onChange={(e) => setNewSchedule({ ...newSchedule, date: e.target.value })}
            />
            <input
                type="time"
                placeholder="Start Time"
                value={newSchedule.startTime}
                onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
            />
            <input
                type="time"
                placeholder="Finish Time"
                value={newSchedule.finishTime}
                onChange={(e) => setNewSchedule({ ...newSchedule, finishTime: e.target.value })}
            />
            <button onClick={createSchedule}>Create</button>
        </div>
    );
};

export default ScheduleList;
