import { HashRouter, Routes, Route } from "react-router-dom";

import { Home } from "./pages/Home";
import { PedidosCliente } from "./pages/PedidosCliente";
import { PedidoClienteEditar } from "./pages/PedidoClienteEditar";

function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route exact path="/pedido/cliente" element={<PedidosCliente />} />
        <Route
          exact
          path="/pedido/editar/:numPed"
          element={<PedidoClienteEditar />}
        />
      </Routes>
    </HashRouter>
  );
}

export default AppRoutes;
