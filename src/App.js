import './App.css';
import React, { Component } from 'react';

import MenuLogado from "./components/MenuLogado";
import CadastroAlunos from "./components/CadastroAlunos";

export default class AreaDoUsuario extends Component {

  constructor(props){
    super(props);

  }

  render(){
    return (
      <div>
        <MenuLogado/>
        <CadastroAlunos/>
      </div>
    );
  }

}