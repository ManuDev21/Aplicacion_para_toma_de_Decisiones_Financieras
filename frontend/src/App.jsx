import { useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import AnalizarOferta from "./pages/AnalizarOferta.jsx";
import Perfil from "./pages/Perfil.jsx";

export default function App() {
  const [ruta, setRuta] = useState("analizar");

  return (
    <div className="layout">
      <Sidebar ruta={ruta} onNavegar={setRuta} />
      <main style={{ flex: 1, minWidth: 0 }}>
        {ruta === "analizar" ? <AnalizarOferta /> : <Perfil />}
      </main>
    </div>
  );
}
