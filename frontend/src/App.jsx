import { Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import AnalizarOferta from "./pages/AnalizarOferta.jsx";
import Perfil from "./pages/Perfil.jsx";

export default function App() {
  return (
    <div className="layout">
      <Sidebar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<AnalizarOferta />} />
          <Route path="/perfil" element={<Perfil />} />
        </Routes>
      </main>
    </div>
  );
}
