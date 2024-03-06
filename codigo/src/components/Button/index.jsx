import { Button as ButtonBootstrap } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const styleButton = "d-flex gap-1 align-items-center";

export const Button = ({
  color = "primary",
  bold = false,
  handleClick,
  text,
  disabled = false,
}) => (
  <ButtonBootstrap
    className={`${bold && "fw-bold"} btn-${color} ${styleButton} `}
    onClick={handleClick}
    disabled={disabled}
  >
    {text}
  </ButtonBootstrap>
);

export const ButtonIcon = ({
  color = "primary",
  bold = false,
  handleClick,
  text,
  icon,
  disabled = false,
}) => (
  <ButtonBootstrap
    className={`${bold && "fw-bold"} btn-${color}  ${styleButton} `}
    onClick={handleClick}
    disabled={disabled}
  >
    {text}

    {icon && <FontAwesomeIcon icon={icon} />}
  </ButtonBootstrap>
);
