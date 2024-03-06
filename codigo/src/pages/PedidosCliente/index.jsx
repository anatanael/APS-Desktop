import styles from "./styles.module.css";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "../../config/axios";
import { NavBarMain } from "../../components/NavBarMain";
import { Link } from "react-router-dom";

import { ModalPedido } from "./ModalPedido";

import { __PEDIDOS_CLIENTE } from "../../global/localStorage";

export const PedidosCliente = () => {
  const [codCli, setCodCli] = useState("");
  const [nomeCliente, setNomeCliente] = useState("");
  const [listPedidos, setListPedidos] = useState([]);
  const [pedidoModal, setPedidoModal] = useState(false);
  const [txtDataUltimaPesquisa, setTxtDataUltimaPesquisa] = useState("");

  function formatarDataHora(data) {
    const options = {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    };

    const formatoDataHora = new Intl.DateTimeFormat("pt-BR", options).format(
      data
    );
    const partes = formatoDataHora.split(" ");

    return `${partes[0]} as ${partes[1]}`;
  }

  async function getPedidos() {
    setListPedidos([]);

    try {
      const response = await axios.get(`/pedido/cliente/${codCli}`);

      if (response && response.data) {
        const responseData = response.data;
        const cliente = responseData.cliente;
        const pedidos = responseData.pedidos;

        if (!cliente) {
          throw new Error({ message: "Cliente não localizado" });
        }

        setNomeCliente(`${cliente.nome} - ${cliente.fantasia}`);
        setListPedidos(pedidos);

        const dataAgora = new Date();

        setTxtDataUltimaPesquisa(formatarDataHora(dataAgora));
      }
    } catch (err) {
      const statusErr = err && err.response && err.response.status;
      if (statusErr === 404) {
        toast.warning("Cliente não localizado");
        return;
      }

      toast.error("Erro ao conectar");
    }
  }

  function openModalPedido(numPed) {
    setPedidoModal(numPed);
  }

  function closeModalPedido() {
    setPedidoModal(false);
  }

  const onChangeCodCli = (value) => {
    setCodCli(value);
  };

  const onKeyDownCodClid = (value) => {
    if (value === "Enter") {
      getPedidos();
    }
  };

  useEffect(() => {
    const storageData = localStorage.getItem(__PEDIDOS_CLIENTE);
    const jsonData = JSON.parse(storageData);

    if (jsonData && typeof jsonData === "object") {
      setCodCli(jsonData.codCli || "");
      setNomeCliente(jsonData.nomeCliente || "");
      setListPedidos(jsonData.listPedidos || []);
      setPedidoModal(false);
    }
  }, []);

  useEffect(() => {
    if (listPedidos.length > 0) {
      window.localStorage.setItem(
        __PEDIDOS_CLIENTE,
        JSON.stringify({ codCli, nomeCliente, listPedidos })
      );
    }
  }, [listPedidos, codCli, nomeCliente]);

  return (
    <>
      <NavBarMain />

      <ModalPedido numPed={pedidoModal} onClodeModal={closeModalPedido} />

      {txtDataUltimaPesquisa && (
        <div className="clearfix me-4">
          <div className="float-end text-danger">
            Última pesquisa: {txtDataUltimaPesquisa}
          </div>
        </div>
      )}

      <div className={`container ${styles.container}`}>
        <h3 className="text-center">Consultar Pedido</h3>

        <div className="row">
          <div className="col-2">
            <label htmlFor="ex1">Cód. Cliente</label>
            <input
              id="ex1"
              type="text"
              className={`form-control ${styles.inputStyle}`}
              value={codCli}
              onChange={(e) => onChangeCodCli(e.target.value)}
              onKeyDown={(e) => onKeyDownCodClid(e.key)}
            />
          </div>
          <div className="col-10">
            <label htmlFor="ex2">Nome Cliente</label>
            <input
              className="form-control"
              id="ex2"
              type="text"
              disabled
              value={nomeCliente}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-12 d-flex justify-content-between">
            <div className="opacity-0">
              <label htmlFor="ex1">Num Pedido</label>
              <input
                id="ex1"
                type="text"
                className={`form-control ${styles.inputStyle}`}
                disabled
              />
            </div>

            <div className="d-flex align-items-center">
              <button
                type="button"
                className="btn btn-primary"
                onClick={getPedidos}
              >
                Buscar
              </button>
            </div>
          </div>
        </div>

        {listPedidos.length > 0 && (
          <div className="row mt-5">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th scope="col">Num Ped</th>
                  <th scope="col">Filial</th>
                  <th scope="col">Data</th>
                  <th scope="col">Posição</th>
                  <th scope="col">Ação</th>
                </tr>
              </thead>
              <tbody>
                {listPedidos.map((pedido) => (
                  <tr key={pedido.numPed}>
                    <th scope="row">{pedido.numPed}</th>
                    <td>{pedido.codFilial}</td>
                    <td>{pedido.data}</td>
                    <td>{pedido.posicao}</td>
                    <td className="d-flex gap-3">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => openModalPedido(pedido.numPed)}
                      >
                        Abrir
                      </button>

                      {["L", "B", "P"].includes(pedido.posicao) && (
                        <Link to={`/pedido/editar/${pedido.numPed}`}>
                          <button type="button" className="btn btn-warning">
                            Editar
                          </button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};
