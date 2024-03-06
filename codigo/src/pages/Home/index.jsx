//import styles from "./styles.module.css";

import { CardRotina } from "../../components/CardRotina";
import { NavBarMain } from "../../components/NavBarMain";

export const Home = () => {
  return (
    <>
      <NavBarMain />
      <div className="container">
        <CardRotina
          title={"Consultar Pedido"}
          description={"Verificar dados do pedido já existente!"}
          page={"pedido/cliente"}
        />
      </div>
    </>
  );
};
