import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import UserHome from './pages/UserHome/UserHome';
import DFA from './pages/DFA/DFA';
import NFA from './pages/NFA/NFA';
import ERDiagram from './pages/ERDiagram/ERDiagram';
import Flowchart from './pages/Flowchart/Flowchart';
import DataStructure from './pages/DataStructure/DataStructure';
import UMLDiagram from './pages/UMLDiagram/UMLDiagram';
import DashboardHome from './pages/UserHome/DashboardHome';
import ComingSoon from './pages/UserHome/ComingSoon';
import Demo from './pages/UserHome/Demo';
import HistoryPage from './pages/History/History';
import ApiKeys from './pages/ApiKeys/ApiKeys';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<UserHome />}>
          <Route index element={<DashboardHome />} />
          <Route path="dfa" element={<DFA />} />
          <Route path="nfa" element={<NFA />} />
          <Route path="er-diagram" element={<ERDiagram />} />
          <Route path="flowchart" element={<Flowchart />} />
          <Route path="data-structure" element={<DataStructure />} />
          <Route path="uml-diagram" element={<UMLDiagram />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="coming-soon" element={<ComingSoon />} />
          <Route path="demo" element={<Demo />} />
          <Route path="api-keys" element={<ApiKeys />} />
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

