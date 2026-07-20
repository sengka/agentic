import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateAgent from "./pages/CreateAgent";
import AgentSources from "./pages/AgentSources";
import Reports from "./pages/Reports";
import Search from "./pages/Search";
import ChatWidget from "./components/ChatWidget";
import AgentReports from "./pages/AgentReports";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-agent" element={<CreateAgent />} />
        <Route path="/agent/:id/sources" element={<AgentSources />} />
        <Route path="/agent/:id/reports" element={<AgentReports />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/search" element={<Search />} />
      </Routes>
      <ChatWidget />
    </BrowserRouter>
  );
}

export default App;