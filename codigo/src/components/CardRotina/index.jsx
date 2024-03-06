import styles from "./styles.module.css";

import { Link } from "react-router-dom";

export const CardRotina = ({ title, description, page }) => {
  return (
    <div className={`card ${styles.card}`}>
      <div className="card-body text-center">
        <h5 className="card-title">{title}</h5>
        <p className="card-text">{description}</p>
        <Link to={`/${page}`}>
          <button className="btn btn-primary">Abrir</button>
        </Link>
      </div>
    </div>
  );
};
