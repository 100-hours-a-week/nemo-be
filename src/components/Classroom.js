import React, { useState, useEffect } from "react";
import axios from "axios";

const Classroom = () => {
    const [classrooms, setClassrooms] = useState([]);
    const [newClassroom, setNewClassroom] = useState({
        name: "",
        categoryId: 1,
        object: "",
        description: "",
    });

    const [schedules, setSchedules] = useState([]);
    const [selectedClassroom, setSelectedClassroom] = useState(null);

    const token = localStorage.getItem("accessToken");

    // JWT 토큰에서 사용자 ID를 파싱하는 함수
    const getUserIdFromToken = (token) => {
        if (!token) return null;
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.sub; // 토큰 payload에서 사용자 ID를 추출
    };

    const userId = getUserIdFromToken(token);

    // 강의 목록 조회
    const fetchClassrooms = async () => {
        if (!token) {
            console.error("JWT 토큰이 없습니다.");
            return;
        }
        try {
            const response = await axios.get("http://localhost:8080/api/classes", {
                // headers: { Authorization: `Bearer ${token}` },
            });
            console.log(token)
            setClassrooms(response.data);
        } catch (error) {
            console.error("Error fetching classrooms:", error);
        }
    };

    // 강의 생성
    const createClassroom = async () => {
        try {
            await axios.post(
                "http://localhost:8080/api/classes",
                {
                    ...newClassroom,
                    userId: userId, // 사용자 ID를 포함
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
                console.log(token)
            );
            alert("강의가 생성되었습니다.");
            fetchClassrooms(); // 새로 고침
        } catch (error) {
            console.error("Error creating classroom:", error);
        }
    };

    // 강의 삭제
    const deleteClassroom = async (classId) => {
        try {
            await axios.delete(`http://localhost:8080/api/classes/${classId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("강의가 삭제되었습니다.");
            fetchClassrooms(); // 새로 고침
        } catch (error) {
            console.error("Error deleting classroom:", error);
        }
    };

    // 강의 일정 조회
    const fetchSchedules = async (classId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/schedules/${classId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSchedules(response.data);
            setSelectedClassroom(classId);
        } catch (error) {
            console.error("Error fetching schedules:", error);
        }
    };

    // 일정 생성
    const createSchedule = async (classId) => {
        try {
            await axios.post(
                `http://localhost:8080/api/schedules`,
                { classId: classId, scheduleInfo: "일정 내용" },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            alert("일정이 생성되었습니다.");
            fetchSchedules(classId); // 새로 고침
        } catch (error) {
            console.error("Error creating schedule:", error);
        }
    };

    // 일정 삭제
    const deleteSchedule = async (scheduleId) => {
        try {
            await axios.delete(`/api/schedules/${scheduleId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            alert("일정이 삭제되었습니다.");
            fetchSchedules(selectedClassroom); // 새로 고침
        } catch (error) {
            console.error("Error deleting schedule:", error);
        }
    };

    // useEffect는 반드시 조건 없이 호출되어야 함
    useEffect(() => {
        fetchClassrooms(); // 컴포넌트가 처음 로드될 때 강의 목록을 불러옴
    }, []);

    return (
        <div>
            <h1>강의 관리</h1>
            <div>
                <h2>전체 강의 목록</h2>
                <ul>
                    {classrooms.map((classroom) => (
                        <li key={classroom.id}>
                            {classroom.name}{" "}
                            <button onClick={() => deleteClassroom(classroom.id)}>
                                강의 삭제
                            </button>
                            <button onClick={() => fetchSchedules(classroom.id)}>
                                일정 보기
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            <div>
                <h2>새 강의 생성</h2>
                <input
                    type="text"
                    placeholder="강의 이름"
                    value={newClassroom.name}
                    onChange={(e) =>
                        setNewClassroom({ ...newClassroom, name: e.target.value })
                    }
                />
                <input
                    type="text"
                    placeholder="강의 목표"
                    value={newClassroom.object}
                    onChange={(e) =>
                        setNewClassroom({ ...newClassroom, object: e.target.value })
                    }
                />
                <input
                    type="text"
                    placeholder="강의 소개"
                    value={newClassroom.description}
                    onChange={(e) =>
                        setNewClassroom({ ...newClassroom, description: e.target.value })
                    }
                />
                <button onClick={createClassroom}>강의 생성</button>
            </div>

            {selectedClassroom && (
                <div>
                    <h2>선택된 강의 일정</h2>
                    <ul>
                        {schedules.map((schedule) => (
                            <li key={schedule.id}>
                                {schedule.scheduleInfo}{" "}
                                <button onClick={() => deleteSchedule(schedule.id)}>
                                    일정 삭제
                                </button>
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => createSchedule(selectedClassroom)}>
                        일정 생성
                    </button>
                </div>
            )}
        </div>
    );
};

export default Classroom;
