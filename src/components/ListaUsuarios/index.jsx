import React, { Component } from 'react';
import { Table } from 'react-bootstrap';
import HttpService from '../../services/HttpService';

export default class ListaUsuarios extends Component {

  constructor(props){
    super(props);

    this.state = {
      listaUsuarios : []
    };
  }
  
  render(){    
    return (      
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>           
          </tr>
        </thead>
        <tbody>
          {
            this.state.listaUsuarios.map((usuario, index) => {
              return(
                <tr key={index}>
                  <td>{usuario.nome}</td>
                  <td>{usuario.email}</td>
                </tr>
              )
            })
          }          
        </tbody>
      </Table>      
    );
  }

  componentDidMount(){
    HttpService.listarUsuarios()
    .then((response) => {
      if (response.data.sucesso){
        this.setState({
          listaUsuarios : response.data.listaUsuarios
        });
      }
    })
    .catch((error) => {
      console.log("error -> ",error);
    })
  }
}