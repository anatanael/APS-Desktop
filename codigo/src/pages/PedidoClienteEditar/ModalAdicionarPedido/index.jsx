import { useEffect, useState, useRef } from "react";

import Modal from "react-bootstrap/Modal";
import { Button } from "../../../components/Button";
import { toast } from "react-toastify";
import { Table } from "react-bootstrap";
import { updateToast } from "../../../global/util";

import axios from "../../../config/axios";

export const ModalAdicionarPedido = ({
  show,
  onClodeModal,
  codFilial,
  codCliente,
  adicionarProduto,
  codTabelaPrecos,
  tipoCliente,
  numRegiao,
}) => {
  const [codProduto, setCodProduto] = useState("");
  const [descricaoProduto, setDescricaoProduto] = useState("");

  const [produtos, setProdutos] = useState([]);

  const toastProduto = useRef(null);

  const onChangeCodProduto = (e) => {
    const codProd = e.target.value;
    if (Number.isInteger(Number(codProd))) {
      setCodProduto(codProd);
    }

    setDescricaoProduto("");
  };

  const onChangeDescricaoProduto = (e) => {
    const newValue = e.target.value;
    setDescricaoProduto(newValue);

    setCodProduto("");
  };

  const onKeyDownCodProduto = (value) => {
    if (value === "Enter") {
      procurarProdutos();
    }
  };

  const onKeyDownDescricaoProduto = (value) => {
    if (value === "Enter") {
      procurarProdutos();
    }
  };

  const initToastProcurarProduto = (textToast) => {
    toast.dismiss(toastProduto.current);
    toastProduto.current = toast(textToast, { autoClose: false });
  };

  const addPrecoVendaByTabelaPreco = (produtos) => {
    return produtos.map((produto) => {
      let pvenda = produto[`pvenda${codTabelaPrecos}`];

      if (tipoCliente === "F") {
        pvenda *= 1 + produto.percentualAcrescimoPf / 100;
      }

      produto.pvenda = pvenda.toFixed(2);
      return produto;
    });
  };

  const procurarProdutosMix = async () => {
    initToastProcurarProduto("Procurando mix cliente");

    try {
      const response = await axios.get("/produto/filial/mixCliente", {
        params: { codCli: codCliente, codFilial, numRegiao },
      });

      if (response && response.data) {
        setProdutos(addPrecoVendaByTabelaPreco(response.data));

        updateToast(toastProduto, "Produto(s) encontrado(s)", "INFO");
      } else {
        updateToast(toastProduto, "Não encontrado", "WARNING");
      }
    } catch (err) {
      updateToast(toastProduto, "Erro ao procurar", "ERROR");
    }
  };

  const procurarProdutos = async () => {
    if (!codProduto && !descricaoProduto) {
      toast.warning("Preencha algum campo");
      return;
    }

    initToastProcurarProduto("Procurando produto");

    let routerFilter = "";
    let paramsRoute = { codFilial, numRegiao };
    if (codProduto) {
      routerFilter = "/produto/filial/codigo";
      paramsRoute.codProd = codProduto;
    } else if (descricaoProduto) {
      routerFilter = "/produto/filial/descricao";
      paramsRoute.descricaoProduto = descricaoProduto;
    }

    try {
      const response = await axios.get(routerFilter, {
        params: { ...paramsRoute },
      });

      if (response && response.data) {
        setProdutos(addPrecoVendaByTabelaPreco(response.data));

        updateToast(toastProduto, "Produto(s) encontrado(s)", "INFO");
      } else {
        updateToast(toastProduto, "Não encontrado", "WARNING");
      }
    } catch (err) {
      updateToast(toastProduto, "Erro ao procurar", "ERROR");
    }
  };

  async function handleAddProduto(produto) {
    adicionarProduto(
      produto.codProd,
      produto.descricao,
      produto.pesoBruto,
      produto.estoque,
      produto.pvenda
    );
  }

  useEffect(() => {
    setProdutos([]);
    setCodProduto("");
    setDescricaoProduto("");
  }, []);

  return (
    <Modal className="modal" show={show} onHide={onClodeModal}>
      <Modal.Header closeButton>
        <Modal.Title>Adicionar Novo Produto</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row d-flex justify-content-center mx-5 my-2">
          <div className="col-2">
            <label htmlFor="codProd">Código</label>
            <input
              id="codProd"
              type="text"
              className={`form-control`}
              onChange={onChangeCodProduto}
              value={codProduto}
              onKeyDown={(e) => onKeyDownCodProduto(e.key)}
            />
          </div>

          <div className="col-10">
            <label htmlFor="inDescProd">Descrição</label>
            <input
              className="form-control"
              id="inDescProd"
              type="text"
              value={descricaoProduto}
              onChange={onChangeDescricaoProduto}
              onKeyDown={(e) => onKeyDownDescricaoProduto(e.key)}
            />
          </div>
        </div>

        <div className="col-6 mt-2 d-flex justify-content-end gap-2 float-end">
          <Button text="Mix Cliente" handleClick={procurarProdutosMix} />
          <Button text="Buscar" handleClick={procurarProdutos} />
        </div>

        <Table>
          <thead>
            <tr>
              <th scope="col">Cod</th>
              <th scope="col">Descrição</th>
              <th scope="col">Estoque</th>
              <th scope="col">Valor</th>
              <th scope="col"></th>
            </tr>
          </thead>

          <tbody>
            {produtos.map((produto) => {
              const existeEstoque = produto.estoque > 0;
              const styleSemEstoque =
                "text-danger text-decoration-line-through";

              return (
                <tr key={produto.codProd}>
                  <td>{produto.codProd}</td>
                  <td className={!existeEstoque ? styleSemEstoque : ""}>
                    {produto.descricao}
                  </td>
                  <td>{produto.estoque}</td>
                  <td>R$ {produto.pvenda}</td>
                  <td>
                    <span className={`${produto.estoque <= 0 ? "d-none" : ""}`}>
                      <Button
                        text="Escolher"
                        color="secondary"
                        handleClick={() => handleAddProduto(produto)}
                      />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer></Modal.Footer>
    </Modal>
  );
};
