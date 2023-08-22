import React from "react";
import ReactDOM from "react-dom";
import Table from "./App";
import { jsonData } from "./data";

ReactDOM.render(
  <React.StrictMode>
    <Table data={jsonData} />
  </React.StrictMode>,
  document.getElementById("root")
);
