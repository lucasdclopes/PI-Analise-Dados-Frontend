import React, { Component } from 'react';
import { Container, Table } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import HttpService from '../../services/HttpService';
import userLogado from '../../dto/UsuarioLogadoDto';
import ErroModal from '../ErroModal';
import HttpServiceHandler from '../../services/HttpServiceHandler';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';
import DateHelper from '../../helpers/DateHelper';
import MenuLogado from '../../components/MenuLogado';
import Paginacao from '../Paginacao';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import AsyncSelect from 'react-select/async';

import './index.css';
import { createPortal } from 'react-dom';

export default class CalendarioAulas extends Component {

  constructor(props){
    

    super(props);

    this.state = {
      calendarioAulas : [],
      filtros : {
        idProfessor : null,
        idTurma : null,
        diaSemana : false,
        paginacaoRequest : {
          size: 15,
          page: 1
        },
        paginacaoResponse : {
          quantidade : null,
          hasProxima : null
        }
      },
      erroModal : {
        mensagemErro : '',
        show : false,
        titulo : ''
      },      
    };

    this.closeErroModal = () => {
      this.setState({
        erroModal : {
          mensagemErro : '',
          showModalErro : false,
          titulo : ''
        }
      });
    }
   

    this.definirFiltroInicial = () => {
      if (userLogado.getTipoCadastro() === 'PROFESSOR')
        this.state.filtros.idProfessor = userLogado.getIdCadastro();
    }

    this.definirFiltroInicial();

    this.obterLista = () => {
      HttpService.listarCalendarioAulas(this.state.filtros)
      .then((response) => {
        if (response){
          this.setState(prevState => ({
            ...prevState,
            calendarioAulas : response.data,
            filtros : {
              ...prevState.filtros,
              paginacaoResponse : {
                quantidade : parseInt(response.headers['page-quantidade']),
                hasProxima : response.headers['page-has-proxima'] === 'true' ? true : false
              }
            }
          }));
        }
      })
      .catch((error) => {
        let httpServiceHandler = new HttpServiceHandler();
        httpServiceHandler.validarExceptionHTTP(error.response,this);

        if (error.response.status == 404){
          this.setState(prevState => ({
            ...prevState,
            calendarioAulas : []
          }));
        }
      })
    }

    this.selecionarPagina = (numeroPagina) => {
      this.setState(prevState => ({
        ...prevState,
        filtros : {
          ...prevState.filtros,
          paginacaoRequest : {
            ...prevState.filtros.paginacaoRequest,
            page : numeroPagina
          }
        }
      }), () => {
        this.obterLista();
      });
    }

    this.incrementarPagina = (incremento) => {
      let incrementoPagina = this.state.filtros.paginacaoRequest.page + incremento;

      if (incrementoPagina > 0)
        this.selecionarPagina(incrementoPagina);
    }

    this.toggleExibirAulasDoDia = (e) => {
      if (e.target.checked){
        this.setState(prevState => ({
          filtros : {
            ...prevState.filtros,
            diaSemana : true
          }
        }), () => {
          this.obterLista();
        });
        
      }
      else {
        this.setState(prevState => ({
          filtros : {
            ...prevState.filtros,
            diaSemana : false
          }
        }), () => {
          this.obterLista();
        });
      }
    }

    this.iniciarAula = (idCalendarioAula) => {
      const dataAtual = DateHelper.dateParaFormatoPtBr(new Date());

      HttpService.iniciarAula({
        "dtAula" : dataAtual,
        "idCalendarioAula" : idCalendarioAula
      })
      .then((response) => {
        window.location = './aula?idAula='+response.data.idAula;
      })
      .catch((error) => {
        new HttpServiceHandler().validarExceptionHTTP(error.response, this);
      });
    }

    this.handleBuscaTurma = (e) => {

      HttpService.listarCalendarioAulas({
        idTurma : e.value
      })
      .then((response) => {
        if (response){
          this.setState(prevState => ({
            ...prevState,
            calendarioAulas : response.data,
            filtros : {
              ...prevState.filtros,
              paginacaoResponse : {
                quantidade : parseInt(response.headers['page-quantidade']),
                hasProxima : response.headers['page-has-proxima'] === 'true' ? true : false
              }
            }
          }));
        }
      })
      .catch((error) => {
        new HttpServiceHandler().validarExceptionHTTP(error.response, this);
      });

    }
  }


  

  render(){
    
    const promiseOptions = (inputValue) => {
      // new Promise((resolve) => {
      //   setTimeout(() => {
      //     resolve(filterColors(inputValue));
      //   }, 1000);
      // }

      let listaTurmas = [];

      return HttpService.listarTurmas({
        descTurma : inputValue
      })      
      .then((response) => {
        response.data.forEach((turma) => {
          listaTurmas.push({
            value : turma.idTurma,
            label : turma.descTurma + ' do ' + turma.tpNivelEnsino
          });          
        });
        return listaTurmas;
      });
    };

    return (   
      <Container className="containerCalendarioAulas" fluid>

        <Row>
          <Col xs={{span: 12, offset: 0}} sm={{span : 10, offset: 1}}  md={{span : 10, offset: 1}} lg={{span: 8, offset: 2}}>
            <MenuLogado/>
          </Col>
        </Row>

        <Row>
          <Col xs={{span: 6, offset: 0}} sm={{span : 6, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 4, offset: 2}}>
            <h3 className="tituloModulo">Calendário de aulas</h3>
          </Col>

          <Col xs={{span: 6, offset: 0}} sm={{span : 6, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 2, offset: 2}}>
            <AsyncSelect placeholder="Digite a turma" noOptionsMessage={() => {return "Nenhuma turma encontrada"}} onChange={this.handleBuscaTurma} loadOptions={promiseOptions} />         
          </Col>
        </Row>

        <Row>
          <Col xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 8, offset: 2}}>
            <Form.Check 
              type={"checkbox"}
              id={1}
              label={"Exibir somente aulas de hoje"}
              checked={this.state.filtros.diaSemana}
              onChange={this.toggleExibirAulasDoDia}
            />

            {
              <span>{this.state.filtros.diaSemana}</span>
            }
          </Col>
        </Row>
        <Row>
          <Col xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 8, offset: 2}}>
            {
              (this.state.calendarioAulas.length > 0) &&
              <Table responsive="sm" striped bordered hover>
                <thead>
                  <tr>
                  <th>Dia Semana</th>
                  <th>Turma</th>  
                  <th>Ensino</th>
                  <th>Inicio</th>
                  <th>Fim</th>
                  <th>Materia</th>
                  <th>Professor</th>
                  <th></th>
                  </tr>
                </thead>
                <tbody>
                  {
                    this.state.calendarioAulas.map((aula) => {
                      return(
                        <tr key={aula.idCalendarioAula}>
                          <td className="align-middle">{aula.diaSemana}</td>
                          <td className="align-middle">{aula.descTurma}</td>
                          <td className="align-middle">{aula.tpNivelEnsino}</td>
                          <td className="align-middle">{aula.hrInicio}</td>
                          <td className="align-middle">{aula.hrFim}</td>
                          <td className="align-middle">{aula.descMateria}</td>
                          <td className="align-middle">{aula.nomeProfessor}</td>
                          <td className="align-middle" style={{textAlign: "center"}}>
                            <Button onClick={() => {this.iniciarAula(aula.idCalendarioAula)}}>Iniciar aula</Button>
                          </td>
                        </tr>
                      )
                    })
                  }          
                </tbody>
              </Table>
            }

            {
              (this.state.calendarioAulas.length == 0) &&
              <Alert variant={"danger"}>
                Nenhuma aula encontrada.
              </Alert>


            }
          </Col>
        </Row>
      
        <ErroModal closeErroModal={this.closeErroModal} erroModal={this.state.erroModal}/>

        <Paginacao there={this} />
      
      </Container>
      
    );
  }

  componentDidMount(){
    this.obterLista();
  }
}