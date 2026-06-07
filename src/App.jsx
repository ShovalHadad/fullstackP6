import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Home from './pages/Home.jsx';
import Tasks from './pages/Tasks.jsx';
import Questions from './pages/Questions.jsx';
import QuestionDetails from './pages/QuestionDetails.jsx';

function App() {
  return (
    // כאן נגדיר את כל הניווטים בין הדפים במערכת
    <BrowserRouter>
      <Routes>
        {/* דף ברירת מחדל - מעביר להתחברות */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* דפי כניסה והרשמה */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* דפי המערכת אחרי התחברות */}
        <Route path="/home" element={<Home />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/questions" element={<Questions />} />
        <Route path="/questions/:id" element={<QuestionDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;