import "./index.scss";
import { Button } from "antd";
import React, { Suspense } from "react";
import superMan from "./img/super.png";
import TableComponent from "./components/Table";
import styles from "./styles.module.scss";
import { SVGIcon } from "./svgIcon/SVGIcon";

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <main>
        <Button type="primary">Antd button</Button>
        <img className={styles.super} src={superMan} alt="" />
        <TableComponent />
        <SVGIcon />
      </main>
    </Suspense>
  );
}

export default App;
