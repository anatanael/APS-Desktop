import axios from "axios";

const instance = axios.create({
  baseURL: `http://${process.env.REACT_APP_IP_SERVER}:${process.env.REACT_APP_PORT_SERVER}`,
});

export default instance;
