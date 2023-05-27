import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import HttpService from '../../services/HttpService';


export default class CadastroAlunos extends Component {

  constructor(props){
    super(props);

    this.state = {
      email : '',
      senha : '',
    };

    

    this.enviarDados = (e) => {
      e.preventDefault(); // Cancela a ação padrão do submit    

      HttpService.cadastrarUsuario(this.state.email, this.state.senha)
      .then((response) => {

        if (response.data.sucesso){
          alert(response.data.mensagem)
        }
        else {
          alert("Por algum motivo o usuário não foi cadastrado. Por favor, tente mais tarde.");
        }
        
      })
      .catch((error) => {
        console.log("error -> ",error.response)
        // Desenvolve a lógica do erro aqui
      });

      return true;
    }
  }

  onChangeEmail(e) {    
    this.setState({
      email : e.target.value
    });
  }

  onChangeSenha(e) {
    this.setState({
      senha : e.target.value
    });
  }

  render(){
    return (
      <Container>
        <h1>Lista de usuários</h1>
        <Form>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control type="email" value={this.state.email} onChange={this.onChangeEmail.bind(this)} placeholder="Enter email" />
            <Form.Text className="text-muted">
              Nós nunca iremos compartilhar seu e-mail com outras pessoas.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" value={this.state.senha} onChange={this.onChangeSenha.bind(this)} placeholder="Password" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formBasicCheckbox">
            <Form.Check type="checkbox" label="Check me out" />
          </Form.Group>
          <Button onClick={this.enviarDados} variant="primary" type="submit">
            Submit
          </Button>
        </Form>
      </Container>
    );
  }
}