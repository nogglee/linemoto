import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [data, setData] = useState(null);
  const [name, setName] = useState("");
  const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:5001"  // 🔥 로컬 환경
    : "https://dodogo.vercel.app"; // 🔥 배포된 Vercel 환경

useEffect(() => {
  axios.get(`${API_BASE_URL}/users`)
    .then(response => setData(response.data))
    .catch(error => console.error("API 호출 오류:", error));
}, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return alert("이름을 입력하세요!");

    try {
      const response = await axios.post("http://localhost:5001/data", { name });
      alert(response.data.message);
      setName(""); // 입력 필드 초기화
    } catch (error) {
      console.error("데이터 저장 오류:", error);
    }
  };

  return (
    <div>
      <h1>백엔드 연결 테스트</h1>
      {data ? <p>{data.message}</p> : <p>로딩 중...</p>}

      <h2>데이터 저장 테스트</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="이름 입력"
        />
        <button type="submit">저장</button>
      </form>
    </div>
  );
}

export default App;