import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter,Routes,Route} from "react-router-dom";
import { Outlet } from 'react-router';
import { Container } from 'react-bootstrap';

import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import App from './App';

import reportWebVitals from './reportWebVitals';

import Pib from './components/Pib';
import Co2 from './components/Co2';
import PibxCo2 from './components/PibxCo2';



ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}></Route>
      <Route path="/pib" element={<Pib />}></Route>
      <Route path="/co2" element={<Co2 />}></Route>
      <Route path="/pib-x-co2" element={<PibxCo2 />}></Route>
    </Routes>

    {
      // (isLogado) &&
      // <div>
      //   
      // </div>
    }

    {
      // (!isLogado) &&
      
    }
    <div>
      <Container fluid>
        <Outlet />
      </Container>
    </div>
    
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
