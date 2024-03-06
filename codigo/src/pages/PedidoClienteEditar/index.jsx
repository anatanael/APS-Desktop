import styles from "./styles.module.css";

import { useEffect, useState, useCallback } from "react";
import { convertDecimal, gerarImagemByIdHtml } from "../../global/util";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Button } from "../../components/Button";

import { NavBarMain } from "../../components/NavBarMain";
import { Table } from "react-bootstrap";
import axios from "../../config/axios";

import {
  faListOl,
  faUser,
  faCircle,
  faCalendar,
  faMoneyBill1,
  faWeightHanging,
  faCaretUp,
  faCaretDown,
  faFileInvoiceDollar,
  faTable,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { ModalAdicionarPedido } from "./ModalAdicionarPedido";

const IconDesc = () => (
  <span
    className={styles.colorDesconto}
    title="Alteração no desconto do produto"
  >
    <FontAwesomeIcon icon={faCircle} />
  </span>
);

const IconNovoProduto = () => (
  <span className={`text-success`} title="Produto adicionado ao pedido">
    <FontAwesomeIcon icon={faCircle} />
  </span>
);

const IconAddQtdProduto = () => (
  <span className={`text-success`} title="Aumentar quantidade produto">
    <FontAwesomeIcon icon={faCaretUp} />
  </span>
);

const IconSubQtdProduto = () => (
  <span className={`text-danger`} title="Diminuir quantidade produto">
    <FontAwesomeIcon icon={faCaretDown} />
  </span>
);

export const PedidoClienteEditar = () => {
  const navigate = useNavigate();
  const { numPed } = useParams();

  const [cliente, setCliente] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [pedidoCabecalho, setPedidoCabecalho] = useState(false);
  const [valorTotal, setValorTotal] = useState(0);
  const [pesoTotal, setPesoTotal] = useState(0);
  const [descontoPedido, setDescontoPedido] = useState(false);

  const [adicionarProdutoModal, setAdicionarProdutoModal] = useState(false);
  const [isGerarImagem, setIsGerarImagem] = useState(false);
  const [isMostarEstoque0, setIsMostrarEstoque0] = useState(false);

  const onLoadPedido = useCallback(async () => {
    try {
      const response = await axios.get(`/pedido/cliente/numPed/${numPed}`);

      if (response && response.data) {
        const responseData = response.data;
        const dataCliente = responseData.cliente;
        const dataProdutos = responseData.produtos;
        const dataPedidoCab = responseData.pedidoCabecalho;

        const listProdutos = dataProdutos.map((produto) => {
          const qtEstoqueMaximo =
            produto.qtEstoque + produto.qtPedido >= 0
              ? produto.qtEstoque + produto.qtPedido
              : produto.qtPedido;

          produto.qtEstoqueMaximo = qtEstoqueMaximo;
          produto.qtAlterada = produto.qtPedido;
          produto.descontoAlterado = produto.desconto;
          return produto;
        });

        setCliente(dataCliente);
        setProdutos(listProdutos);
        setPedidoCabecalho(dataPedidoCab);
      }
    } catch (err) {
      toast.error("Erro ao conectar");
    }
  }, [numPed]);

  function changeQtdProduto(codProd, value) {
    const newProdutoQt = parseInt(value);

    setProdutos((prevProdutosEdicao) => {
      const produtoEdicao = prevProdutosEdicao.find(
        (produto) => produto.codProd === codProd
      );

      return prevProdutosEdicao.map((produto) => {
        if (produto.codProd === codProd) {
          if (
            newProdutoQt > produtoEdicao.qtEstoqueMaximo ||
            newProdutoQt < 0
          ) {
            return produto;
          }

          if (!newProdutoQt) {
            produto.qtAlterada = 0;
          } else {
            produto.qtAlterada = newProdutoQt;
          }
        }
        return produto;
      });
    });
  }

  function changeDescontoProduto(codProd, desconto) {
    const newProdutoDesconto = parseInt(desconto);

    setProdutos((prevProdutos) => {
      return prevProdutos.map((produto) => {
        if (produto.codProd === codProd) {
          if (newProdutoDesconto < 0 || newProdutoDesconto > 100) {
            return produto;
          }

          if (!newProdutoDesconto) {
            produto.descontoAlterado = 0;
          } else {
            produto.descontoAlterado = newProdutoDesconto;
          }
        }
        return produto;
      });
    });
  }

  function goPageBack() {
    navigate(-1);
  }

  function closeModalAdicionarProduto() {
    setAdicionarProdutoModal(false);
  }

  function openModalAdicionarProduto() {
    setAdicionarProdutoModal(true);
  }

  const adicionarProduto = (
    codProd,
    descricao,
    pesoBruto,
    qtEstoque,
    precoUnit
  ) => {
    const existeProduto = produtos.find(
      (produto) => produto.codProd === codProd
    );

    if (!existeProduto) {
      setProdutos((prevProdutos) => {
        return [
          {
            codProd,
            descricao,
            desconto: 0,
            descontoAlterado: 0,
            pesoBruto,
            precoUnit,
            precoUnitDesc: precoUnit,
            qtAlterada: 1,
            qtEstoque: qtEstoque - 1,
            qtEstoqueMaximo: qtEstoque,
            qtPedido: 1,
            isNovoProduto: true,
          },
          ...prevProdutos,
        ];
      });

      setAdicionarProdutoModal(false);

      toast.success("Produto adiconado");
    } else {
      toast.warning("Erro, produto já está no pedido do cliente");
    }
  };

  const onChangeDescontoPedido = (desconto) => {
    if (desconto < 0 || desconto > 100) {
      return;
    }

    setDescontoPedido(desconto);

    setProdutos((prevProdutos) =>
      prevProdutos.map((produto) => {
        produto.descontoAlterado = desconto ? desconto : 0;

        return produto;
      })
    );
  };

  const gerarImagemTabela = async () => {
    setIsGerarImagem(true);
    gerarImagemByIdHtml("dadosEdicaoPedido");
    await new Promise((resolve) => setTimeout(resolve, 100));
    setIsGerarImagem(false);
  };

  const onChangeCheckBoxMostrarEstoque0NaImagem = (event) => {
    setIsMostrarEstoque0(event.target.checked);
  };

  useEffect(() => {
    onLoadPedido();
  }, [numPed, onLoadPedido]);

  useEffect(() => {
    let somaPeso = 0;
    let somaValor = 0;
    for (let produto of produtos) {
      if (produto.qtAlterada > 0) {
        const valorComDesconto = (
          produto.precoUnit -
          produto.precoUnit * (produto.descontoAlterado / 100)
        ).toFixed(2);

        const valorComEstoque = valorComDesconto * produto.qtAlterada;

        somaValor += valorComEstoque;
      }

      somaPeso += produto.qtAlterada * produto.pesoBruto;
    }

    somaValor = somaValor.toFixed(2);
    somaPeso = somaPeso.toFixed(2);

    setValorTotal(somaValor);
    setPesoTotal(somaPeso);
  }, [produtos]);

  return (
    <>
      <ModalAdicionarPedido
        show={adicionarProdutoModal}
        onClodeModal={closeModalAdicionarProduto}
        codFilial={pedidoCabecalho.codFilial}
        codCliente={cliente.codCli}
        codTabelaPrecos={pedidoCabecalho.codTabelaPrecos}
        tipoCliente={cliente.tipoCliente}
        numRegiao={pedidoCabecalho.numRegiao}
        adicionarProduto={adicionarProduto}
      />

      <NavBarMain />

      <div className={`container ${styles.container}`}>
        <div className="my-2">
          <Button text="Voltar" handleClick={goPageBack} color="secondary" />
        </div>

        <h3 className="text-center">Editar Pedido</h3>

        <div className="my-2 float-end d-flex gap-2 flex-column ">
          <div className="d-flex gap-2 justify-content-end">
            <Button
              text="Adicionar Item"
              handleClick={openModalAdicionarProduto}
              color="success"
            />
            <Button
              text="Copiar Imagem"
              handleClick={gerarImagemTabela}
              color="primary"
            />
          </div>

          <div className={`mt-2 ${isGerarImagem ? "d-none" : ""} `}>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="checkboxIsEstoque0NaImagem"
                onChange={onChangeCheckBoxMostrarEstoque0NaImagem}
              />
              <label
                className="form-check-label"
                htmlFor="checkboxIsEstoque0NaImagem"
                value={isMostarEstoque0}
              >
                Considerar estoque 0 na imagem
              </label>
            </div>
          </div>
        </div>

        <div id="dadosEdicaoPedido">
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
                <FontAwesomeIcon icon={faListOl} /> Pedido: {numPed} - Filial:{" "}
                {pedidoCabecalho.codFilial} - Situação:{" "}
                {pedidoCabecalho.posicao}
              </h6>

              <h6>
                <FontAwesomeIcon icon={faCalendar} /> Data:{" "}
                {pedidoCabecalho.data}
              </h6>

              <h6>
                <FontAwesomeIcon icon={faFileInvoiceDollar} /> Cobrança:{" "}
                {pedidoCabecalho.codCob} - {pedidoCabecalho.cobranca} - Plano
                Pagamento: {pedidoCabecalho.planoPag}
              </h6>
            </>
          )}

          <h6>
            <FontAwesomeIcon icon={faMoneyBill1} /> Valor: R$ {valorTotal} -{" "}
            <FontAwesomeIcon icon={faWeightHanging} /> Peso: {pesoTotal} Kg(s)
          </h6>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Cód</th>
                <th>Produto</th>
                <th>Qtd</th>
                <th className={`${isGerarImagem ? "d-none" : ""}`}>Est.Máx</th>
                <th>Val Únit</th>
                <th>Val Total</th>
                <th>Desconto</th>
              </tr>
            </thead>

            <tbody>
              {produtos.map((produto) => {
                const qtAtualProduto = produto.qtAlterada || 0;
                const diferencaAtualPedido =
                  produto.qtAlterada - produto.qtPedido;
                const descontoProduto = produto.descontoAlterado || 0;
                const mudancaoDesconto =
                  produto.desconto === produto.descontoAlterado;

                const aumentarQtdProduto = diferencaAtualPedido > 0;
                const diminuitQtdProduto = diferencaAtualPedido < 0;

                let styleDescricao = "";
                if (aumentarQtdProduto) {
                  styleDescricao = "text-success";
                } else if (diminuitQtdProduto) {
                  styleDescricao = "text-danger";
                }

                const styleRemoveProduto =
                  qtAtualProduto === 0 ? "text-decoration-line-through" : "";

                const isNovoProduto = produto.isNovoProduto;

                const precoProduto = (
                  (produto.precoUnit * (100 - produto.descontoAlterado)) /
                  100
                ).toFixed(2);
                const totalProduto = precoProduto * qtAtualProduto;

                const mostrarProduto =
                  isGerarImagem && !isMostarEstoque0 && qtAtualProduto <= 0
                    ? "d-none"
                    : "";

                return (
                  <tr key={produto.codProd} className={`${mostrarProduto}`}>
                    <th scope="row">
                      {produto.codProd}{" "}
                      {!mudancaoDesconto && !isNovoProduto && <IconDesc />}{" "}
                      {isNovoProduto && <IconNovoProduto />}{" "}
                      {aumentarQtdProduto && !isNovoProduto && (
                        <IconAddQtdProduto />
                      )}
                      {diminuitQtdProduto && <IconSubQtdProduto />}
                    </th>
                    <td className={`${styleDescricao} ${styleRemoveProduto}`}>
                      {produto.descricao}
                    </td>
                    <td>
                      <input
                        value={qtAtualProduto}
                        type="number"
                        className={`form-control ${styles.inputQtEst}`}
                        onChange={(e) =>
                          changeQtdProduto(produto.codProd, e.target.value)
                        }
                      />
                    </td>
                    <td className={`${isGerarImagem ? "d-none" : ""}`}>
                      {produto.qtEstoqueMaximo}
                    </td>
                    <td>R$ {convertDecimal(precoProduto)}</td>
                    <td>R$ {convertDecimal(totalProduto)}</td>
                    <td>
                      <input
                        value={descontoProduto}
                        type="number"
                        className={`form-control ${styles.inputQtEst}`}
                        onChange={(e) =>
                          changeDescontoProduto(produto.codProd, e.target.value)
                        }
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>

        <div className="d-flex gap-2 align-items-center justify-content-end mb-5">
          Desconto em todo o pedido
          <input
            className={`form-control ${styles.inputQtEst}`}
            type="number"
            value={descontoPedido}
            onChange={(e) => onChangeDescontoPedido(e.target.value)}
          />
        </div>
      </div>
    </>
  );
};
