import "./index.scss";
import {Button} from 'antd';
import React, {Suspense, Fragment} from 'react';
import superMan from './img/super.png'
import TableComponent from "./components/Table";
import styles from './styles.module.scss'
import {SVGIcon} from './svgIcon/SVGIcon'

const App = () => {
    return (
        <Fragment>
            <Suspense fallback={<div>Loading...</div>}>
                <main>
                    <Button type={"primary"}>Antd button</Button>
                    <img 
                    className={styles.super} 
                    src={superMan} alt=""/>
                    <TableComponent/>
                    <SVGIcon/>
                </main>
            </Suspense>
        </Fragment>
    );
};

export default App;