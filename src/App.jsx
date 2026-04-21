import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import UserHome from './pages/UserHome/UserHome';
import DFA from './pages/DFA/DFA';
import ERDiagram from './pages/ERDiagram/ERDiagram';
import Flowchart from './pages/Flowchart/Flowchart';
import DashboardHome from './pages/UserHome/DashboardHome';
import ComingSoon from './pages/UserHome/ComingSoon';
import Demo from './pages/UserHome/Demo';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<UserHome />}>
          <Route index element={<DashboardHome />} />
          <Route path="dfa" element={<DFA />} />
          <Route path="er-diagram" element={<ERDiagram />} />
          <Route path="flowchart" element={<Flowchart />} />
          <Route path="coming-soon" element={<ComingSoon />} />
          <Route path="demo" element={<Demo />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
