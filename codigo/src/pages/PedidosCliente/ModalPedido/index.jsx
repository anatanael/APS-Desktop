import { useEffect, useState, useCallback } from "react";

import Modal from "react-bootstrap/Modal";
import { Table } from "react-bootstrap";
import { convertDecimal, gerarImagemByIdHtml } from "../../../global/util";
import { Button } from "../../../components/Button";
import axios from "../../../config/axios";
import {
  faBoxesStacked,
  faListOl,
  faTruck,
  faUser,
  faFileInvoiceDollar,
  faCalendar,
  faTable,
  faMoneyBill1,
  faWeightHanging,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

export const ModalPedido = ({ numPed, onClodeModal }) => {
  const [cliente, setCliente] = useState(false);
  const [pedidoCabecalho, setPedidoCabecalho] = useState(false);
  const [produtos, setProdutos] = useState([]);

  const onLoadPedido = useCallback(async () => {
    try {
      const response = await axios.get(`/pedido/cliente/numPed/${numPed}`);

      if (response && response.data) {
        const responseData = response.data;
        const dataCliente = responseData.cliente;
        const dataPedidoCab = responseData.pedidoCabecalho;
        const dataProdutos = responseData.produtos;

        const vlTotalPedido = dataProdutos.reduce(
          (acumulador, produto) =>
            acumulador + produto.precoUnitDesc * produto.qtPedido,
          0
        );

        const newDataPedidoCab = { ...dataPedidoCab, vlTotalPedido };

        const listProdutos = dataProdutos.map((produto) => {
          const qtEstoqueMaximo =
            produto.qtEstoque + produto.qtPedido >= 0
              ? produto.qtEstoque + produto.qtPedido
              : produto.qtPedido;

          produto.qtEstoqueMaximo = qtEstoqueMaximo;
          return produto;
        });

        setCliente(dataCliente);
        setPedidoCabecalho(newDataPedidoCab);
        setProdutos(listProdutos);
      }
    } catch (err) {
      toast.error("Erro ao conectar");
    }
  }, [numPed]);

  useEffect(() => {
    if (numPed) {
      onLoadPedido();
    }
  }, [numPed, onLoadPedido]);

  return (
    <Modal className="modal" show={numPed} onHide={onClodeModal}>
      <Modal.Header closeButton>
        <Modal.Title>Pedido</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="float-end d-flex gap-2">
          {pedidoCabecalho &&
            pedidoCabecalho.posicao &&
            ["L", "B", "P"].includes(pedidoCabecalho.posicao) && (
              <Link
                to={`/pedido/editar/${numPed}`}
                className="link-underline link-underline-opacity-0"
              >
                <Button text="Editar pedido" color="warning" />
              </Link>
            )}

          <Button
            color="primary"
            handleClick={() => gerarImagemByIdHtml("dadosPedidoCliente")}
            text="Copiar Imagem"
          />
        </div>
        <div id="dadosPedidoCliente" className="p-3">
          <div className="mb-3">
            {cliente && (
              <h5>
                <FontAwesomeIcon icon={faUser} />
                Cliente: {cliente.nome} - {cliente.fantasia}
              </h5>
            )}

            {cliente && (
              <h6>
                <FontAwesomeIcon icon={faTable} /> Código: {cliente.codCli} -{" "}
                {cliente.cpfCnpj}
              </h6>
            )}

            {pedidoCabecalho && (
              <>
                <h6>
                  <FontAwesomeIcon icon={faListOl} /> Pedido:{" "}
                  {pedidoCabecalho.numPed} - Filial: {pedidoCabecalho.codFilial}{" "}
                  - Situação: {pedidoCabecalho.posicao}
                </h6>

                <h6>
                  <FontAwesomeIcon icon={faCalendar} /> Data:{" "}
                  {pedidoCabecalho.data}
                </h6>

                <h6>
                  <FontAwesomeIcon icon={faFileInvoiceDollar} /> Cobrança:{" "}
                  {pedidoCabecalho.codCob} - {pedidoCabecalho.cobranca} -{" "}
                  {pedidoCabecalho.planoPag}
                </h6>

                {pedidoCabecalho.posicao === "F" && (
                  <>
                    {pedidoCabecalho.codTransportadora && (
                      <h6>
                        <FontAwesomeIcon icon={faTruck} /> Transportadora:{" "}
                        {`${pedidoCabecalho.codTransportadora} - ${pedidoCabecalho.transportadora}`}
                      </h6>
                    )}

                    <h6>
                      <FontAwesomeIcon icon={faBoxesStacked} /> Frete: R${" "}
                      {convertDecimal(pedidoCabecalho.frete)} {" - "}
                      Volume(s): {pedidoCabecalho.qtdVolume}
                    </h6>
                  </>
                )}

                <h6>
                  <FontAwesomeIcon icon={faMoneyBill1} /> Valor Total: R${" "}
                  {convertDecimal(pedidoCabecalho.vlTotalPedido)} -{" "}
                  <FontAwesomeIcon icon={faWeightHanging} /> Peso{" "}
                  {convertDecimal(pedidoCabecalho.pesoBruto)} Kg(s)
                </h6>
              </>
            )}
          </div>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Cód</th>
                <th>Produto</th>
                <th>Qtd</th>
                <th>Valor Únit</th>
                <th>Valor Total</th>
                <th>Desconto</th>
              </tr>
            </thead>

            <tbody>
              {produtos.map((produto) => {
                return (
                  <tr key={produto.codProd}>
                    <td>{produto.codProd}</td>
                    <td>{produto.descricao}</td>
                    <td>{produto.qtPedido}</td>
                    <td>R$ {convertDecimal(produto.precoUnitDesc)}</td>
                    <td>
                      R${" "}
                      {convertDecimal(produto.precoUnitDesc * produto.qtPedido)}
                    </td>
                    <td>{produto.desconto} %</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </Modal.Body>
      <Modal.Footer></Modal.Footer>
    </Modal>
  );
};
