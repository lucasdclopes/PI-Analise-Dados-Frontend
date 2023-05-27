import './App.css';
import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import MenuNaoLogado from './components/MenuNaoLogado';

import imgBackgroundMain from './assets/images/background_main.png';
import imgNotebook from './assets/images/notebook.png';
import Footer from './components/Footer'

export default class App extends Component {
  render() {
    return (

      <div>
        <MenuNaoLogado/>
        
        
        <Container id="contanierTelaInicial" fluid> 
          <Row>
            <Col xs={12} sm={12} md={12} lg={12}>
              <img id="imgBackgroundMain" src={imgBackgroundMain} />
            </Col>
          </Row>

          <Row>
            <Col xs={{span: 12, offset: 0}} sm={{span : 8, offset: 2}} md={{span : 10, offset: 1}} lg={{span: 12, offset: 0}} className="text-center">
              <h2>Informações sobre o Sistema de Gestão Escolar</h2>
            </Col>
          </Row>

          <Row>
            <Col xs={12} sm={{span: 8, offset : 2}} md={{span : 6, offset: 3}} lg={{span : 4, offset : 4}} className="text-center">
              <img style={{width : "75%"}} src={imgNotebook} alt="notebook aberto."/>
            </Col>
          </Row>

          <Row>
            <Col xs={{span : 12, offset: 0}} sm={{span: 12, offset : 0}} md={{span: 12, offset: 0}} lg={{span: 6, offset : 3}}>
              <p>Este sistema deve ser usado por professores e secretários escolares para fornecer e gerenciar as informações dos alunos produzidas em classe.</p>
              <p>Para utilizar o sistema, faça o login no topo da página. Os <strong>secretários escolares</strong> podem inserir as informações dos alunos e utilizar estas informações para gerar relatórios. Os <strong>professores</strong> inserem as informações referentes as chamadas diárias, além das notas dos alunos.</p>
            </Col>
          </Row>

          <Row>
            <Col xs={12} sm={12} md={12} lg={12} className="text-center beneficiosSistema paddingContainer">
              <h2>Benefícios do Sistema</h2>
              <ul style={{display : "inline-block"}}>
                <li className="listItem">Gestão digital dos procedimentos da secretaria da escola</li>
                <li className="listItem">Facilidade no preenchimento da lista de chamada</li>
                <li className="listItem">Controle da presença dos alunos</li>
                <li className="listItem">Fácil alocação dos professores nas turmas</li>
                <li className="listItem">Gestão dos horários e disciplinas</li>
              </ul>

            </Col>
          </Row>

          <Row>
            <Col xs={12} sm={{span : 10, offset: 1}} md={{span : 12, offset: 0}} lg={12} className="text-center paddingContainer">
              <h3>Este sistema foi desenhado para o projeto PI Univesp</h3>
            </Col>          
          </Row>

          <Row>
            <Col xs={12} sm={12} md={12} lg={12}>
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14629.110509232349!2d-46.72552257330005!3d-23.558470445306767!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce57c2aeeace6b%3A0xe2ea1dd666944780!2sUniversidade%20Virtual%20do%20Estado%20de%20S%C3%A3o%20Paulo%20-%20Univesp!5e0!3m2!1spt-BR!2sbr!4v1656981582628!5m2!1spt-BR!2sbr" width="100%" height="450" style={{border:0}} allowFullScreen loading="lazy"></iframe>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}
