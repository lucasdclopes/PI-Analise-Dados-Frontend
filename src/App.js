import './App.css';
import React, { Component } from 'react';

import MenuLogado from "./components/MenuLogado";
import Pib from "./components/Pib";

export default class AreaDoUsuario extends Component {

  constructor(props){
    super(props);

  }

  render(){
    return (
      <div>
        <MenuLogado/>
        <Pib/>
      </div>
    );
  }

}