import { Component } from "react";
import { Container, Table } from 'react-bootstrap';
import HttpService from "../../services/HttpService";
import HttpServiceHandler from "../../services/HttpServiceHandler";
import MenuLogado from "../MenuLogado";
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import ListaPresencaModal from "../ListaPresencaModal";
import ErroModal from "../ErroModal";

import './index.css';
import Paginacao from "../Paginacao";

export default class ListaAulas extends Component {
  constructor(){
    super();

    this.state = {
      listaAulas : [],
      filtros : {
        idProfessor : null,
        statusAula : null,
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
      detalheAulaModal : {
        idAula : 0,
        show : false,
      }
    };

    this.obterLista = () => {
      HttpService.listarAulas(this.state.filtros)
      .then((response) => {
        if (response) {

          this.setState(prevState => ({
            ...prevState,
            listaAulas : response.data,
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

    this.handleFiltroStatusChange = (e) => {
      this.setState(prevState => ({
        ...prevState,
        filtros : {
          ...prevState.filtros,
          statusAula : e.target.value
        }
      }), () => {
        this.obterLista();
      })
    }

    this.visualizarAula = (idAula) => {
      window.location = './aula?idAula='+idAula;
    }

    this.abrirDetalhesAula = (idAula) => {
      this.setState( prevState => ({
        ...prevState,
        detalheAulaModal : {
          ...prevState.detalheAulaModal,
          show : true,
          idAula : idAula
        }
      }));

      console.log("detalheAulaModal -> ",this.state);
    }

    this.closeErroModal = () => {
      this.setState({
        erroModal : {
          mensagemErro : '',
          showModalErro : false,
          titulo : ''
        }
      });
    }

    this.closeDetalheAulaModal = () => {
      this.setState({
        detalheAulaModal : {
          idAula : 0,
          show : false,
        }
      });
      this.obterLista();
    }

  }

  render(){
    return (
      <Container className="containerListaAulas" fluid>
        <Row>
          <Col xs={{span: 12, offset: 0}} sm={{span : 10, offset: 1}}  md={{span : 10, offset: 1}} lg={{span: 8, offset: 2}}>
            <MenuLogado/>
          </Col>
        </Row>
        

        <Row style={{marginBottom: "20px", marginTop: "20px"}}>
          <Col xs={{span: 6, offset: 0}} sm={{span : 6, offset: 0}}  md={{span : 6, offset: 0}} lg={{span: 2, offset: 2}}>
            <h1>Lista de aulas</h1>
          </Col>
          <Col className="align-right" xs={{span: 6, offset: 0}} sm={{span : 6, offset: 0}}  md={{span : 6, offset: 0}} lg={{span: 2, offset: 4}}>
            <FloatingLabel controlId="floatingSelectGrid" label="Filtro de status">
              <Form.Select aria-label="Floating label select example" onChange={this.handleFiltroStatusChange}>
                <option value="">Nenhum</option>
                <option value="INICIADA">Iniciada</option>
                <option value="FINALIZADA">Finalizada</option>
                {/* <option value="AGENDADA">Agendada</option> */}
              </Form.Select>
            </FloatingLabel>
          </Col>
        </Row>

        <Row>
          <Col xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 8, offset: 2}}>
            <Table striped bordered hover responsive="lg">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Matéria</th>
                    <th>Turma</th>
                    <th>Professor</th>
                    <th>Data Início</th>
                    <th>Data Fim</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {
                    this.state.listaAulas.map((aula) => {
                      return (
                        <tr key={aula.idAula}>
                          <td className="align-middle">{aula.idAula}</td>
                          <td className="align-middle">{aula.materia.descMateria}</td>
                          <td className="align-middle">{aula.turma.descTurma+ ' - '+aula.materia.tpNivelEnsino}</td>
                          <td className="align-middle">{aula.professor.nome}</td>
                          <td className="align-middle">{aula.dtHrIniciada}</td>
                          <td className="align-middle">{aula.dtHrFinalizada ? aula.dtHrFinalizada : '-'}</td>
                          <td className="align-middle">{aula.statusAula}</td>
                          <td className="align-middle" style={{textAlign : "center"}}>
                            {/* <Button onClick={() => {this.visualizarAula(aula.idAula)}}>Visualizar Aula</Button> */}
                            <Button onClick={() => {this.abrirDetalhesAula(aula.idAula)}}>Visualizar Aula</Button>
                          </td>
                        </tr>
                      )
                    })
                  }
                </tbody>

              </Table>
            </Col>
          </Row>

          <Paginacao there={this}/>

          <ListaPresencaModal closeDetalheAulaModal={this.closeDetalheAulaModal} detalheAulaModal={this.state.detalheAulaModal} />
          <ErroModal closeErroModal={this.closeErroModal} erroModal={this.state.erroModal}/>

      </Container>
    );
  }

  componentDidMount() {
    this.obterLista();
  }
}