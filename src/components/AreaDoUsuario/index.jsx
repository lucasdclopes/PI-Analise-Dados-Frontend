import { Component } from "react";
import MenuLogado from "../MenuLogado";
import CalendarioAulas from "../CalendarioAulas";
import CadastroAlunos from "../CadastroAlunos";

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