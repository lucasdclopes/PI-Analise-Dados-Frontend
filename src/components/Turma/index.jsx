import { Component } from "react";
import { Container, Table, Form, Row, Col } from 'react-bootstrap';
import './index.css';
import queryString from 'query-string';
import HttpService from '../../services/HttpService';
import HttpServiceHandler from '../../services/HttpServiceHandler';
import ErroModal from '../ErroModal';
import Button from 'react-bootstrap/Button';
import MenuLogado from '../MenuLogado';
import { Modal } from 'react-bootstrap';
import DateHelper from '../../helpers/DateHelper';
import ConfirmacaoModal from "../ConfirmacaoModal";
import FloatingLabel from 'react-bootstrap/FloatingLabel';


export default class Turma extends Component{

  constructor(props){
    super(props);

    this.state = {
      idTurma : 0,
      descTurma  : '',
      tpPeriodo : '',
      tpNivelEnsino : '',
      totalFaltas : 0,
      alunosTurma : [],
      isEdicao: false,
      erroModal : {
        mensagemErro : '',
        show : false,
        titulo : ''
      },
      sucessoModal : {
        mensagem : '',
        show : false,
        redirect : ''
      }, 
      faltasAlunoModal : {
        idAluno : 0,
        detalhesAluno: null,
        show : false,
      },
      confirmacaoModal : {
        perguntaConfirmacao : '',
        show : false,
        titulo : '',
        callBackSim : null
      },    
      confirmacaoModalRemoverAluno : {
        perguntaConfirmacao : '',
        show : false,
        titulo : '',
        callBackSim : null,
        idAluno : null
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

    this.closeSucessoModal = () => {
      if (this.state.sucessoModal.redirect) {
        window.location = this.state.sucessoModal.redirect;
      }

      this.setState({
        sucessoModal : {
          mensagem : '',
          show : false
        }
      });
    }

    this.abrirConfirmacaoModal = () => {
      this.setState({
        confirmacaoModal : {
          perguntaConfirmacao : 'Deseja realmente excluir a turma?',
          show : true,
          titulo : 'Deletar turma',
        }
      });
    }

    this.abrirConfirmacaoModalRemoverAluno = (idAluno) => {
      this.setState({
        confirmacaoModalRemoverAluno : {
          perguntaConfirmacao : 'Deseja realmente remover este aluno desta turma?',
          show : true,
          titulo : 'Remover Aluno',
          idAluno : idAluno
        }
      });
    }

    this.handleSimConfirmacaoModal = () => {
      HttpService.deletarTurma(this.state.idTurma)
      .then((response) => {
        if (response) {
          this.setState({
            sucessoModal : {
              mensagem : 'Turma deletada com sucesso.',
              show : true,
              redirect : './lista-turmas'
            }
          });
        }
      })
      .catch((error) => {
        new HttpServiceHandler().validarExceptionHTTP(error.response, this);
      })
      .finally(() => {
        this.closeConfirmacaoModal();
      });
    }


    this.handleSimConfirmacaoModalRemoverAluno = () => {
      HttpService.deletarAlunoTurma(this.state.idTurma, this.state.confirmacaoModalRemoverAluno.idAluno)
      .then((response) => {
        if (response) {
          this.setState({
            sucessoModal : {
              mensagem : 'Aluno removido com sucesso.',
              show : true
            }
          });
        }
      })
      .catch((error) => {
        new HttpServiceHandler().validarExceptionHTTP(error.response, this);
      })
      .finally(() => {
        this.closeConfirmacaoModalRemoverAluno();
      });
    }

    this.closeConfirmacaoModal = () => {
      this.setState({
        confirmacaoModal : {
          perguntaConfirmacao : '',
          show : false,
          titulo : '',
          callBackSim : null
        }
      });
    }

    this.closeConfirmacaoModalRemoverAluno = () => {
      this.setState({
        confirmacaoModalRemoverAluno : {
          perguntaConfirmacao : '',
          show : false,
          titulo : '',
          callBackSim : null
        }
      }, () => {
        this.exibirTurma(this.state.idTurma);
      });
    }

    this.abrirSucessoModal = (msg,redirect) => {
      this.setState({
        sucessoModal : {
          mensagem : msg,
          show : true,
          redirect : redirect
        }
      });
    }

    this.abrirFaltasAlunoModal = (idAluno) => {
        HttpService.exibirAluno(idAluno)
        .then((response) => {
            console.log(response);
          this.setState({
            faltasAlunoModal : {
                idAluno : idAluno,
                show : true,
                detalhesAluno : response.data
            }
          });
  
        })
        .catch((error) => {
          new HttpServiceHandler().validarExceptionHTTP(error.response, this);
        });
    }

    this.fecharFaltasAlunoModal = () => {
        this.setState({
            faltasAlunoModal : {
                idAluno : 0,
                show : false,
            }
          });
    }


    this.habilitarEdicao = () => {
        this.setState({
            idTurma : 0,
            isEdicao: true,
            alunosTurma : [],
            totalFaltas : 0,
            descTurma  : '',
            tpPeriodo : '',
            tpNivelEnsino : '',
          });
    }

    this.exibirTurma = (idTurma) => {
      HttpService.exibirTurma(idTurma)
      .then((response) => {

        let data = response.data;
        this.setState(prevState => ({
          ...prevState,
          idTurma : idTurma,
          descTurma  : data.descTurma,
          tpPeriodo : data.tpPeriodo,
          tpNivelEnsino : data.tpNivelEnsino,
          totalFaltas : data.totalFaltas,
          alunosTurma : data.alunos
        }));

      })
      .catch((error) => {
        new HttpServiceHandler().validarExceptionHTTP(error.response, this);
      });
    }

    this.handleDescTurma = (e) => {
        this.setState({
            descTurma : e.target.value
        }); 
    }
    this.salvarTurma = (e) => {

      HttpService.salvarTurma({
        descTurma : this.state.descTurma,
        tpPeriodo : this.state.tpPeriodo,
        tpNivelEnsino : this.state.tpNivelEnsino,
      })
      .then((response) => {
        if (response) {
          this.setState({
            sucessoModal : {
              mensagem : 'Turma cadastrada com sucesso.',
              show : true,
              redirect : './lista-turmas'
            }
          });
        }
      })
      .catch((error) => {
        new HttpServiceHandler().validarExceptionHTTP(error.response, this);
      });
      
    }
    this.deletarTurma = (e) => {
      this.abrirConfirmacaoModal();
    }

    this.removerAlunoDaTurma = (idAluno) => {
      this.abrirConfirmacaoModalRemoverAluno(idAluno);
    }

    this.handleTpPeriodo = (e) => {
      this.setState({
        tpPeriodo : e.target.value
      });
    }

    this.handleTpNivelEnsino = (e) => {
      this.setState({
        tpNivelEnsino : e.target.value
      });
    }

    
  }

  

  render(){
    return (
      <div>

        <Container className="containerListaAlunosTurma" fluid>

          <Row>
            <Col xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 10, offset: 1}} lg={{span: 10, offset: 1}}>
              <MenuLogado/>
            </Col>
          </Row>

          <Row>
            <Col xs={{span: 6, offset: 0}} sm={{span : 6, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 10, offset: 1}}>
              <h3 className="tituloModulo">Turma</h3>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 10, offset: 1}}>
              <Form>
                <Form.Group as={Col} className="inputNovaTurma" controlId="turmaForm.descTurma">
                    <Form.Label>Turma</Form.Label>
                    <Form.Control type="text" placeholder={"Digite a turma"} disabled={!this.state.isEdicao}  
                    onChange={this.handleDescTurma} value={this.state.descTurma} required autoComplete="false"
                    />
                </Form.Group>
                {
                  (!this.state.isEdicao) &&
                  <div>
                    <Form.Group as={Col} controlId="turmaForm.tpPeriodo">
                        <Form.Label>Ensino</Form.Label>
                        <Form.Control type="text" placeholder={this.state.tpPeriodo} disabled value={this.state.tpPeriodo}/>
                    </Form.Group>
                  

                    <Form.Group as={Col} controlId="turmaForm.tpNivelEnsino">
                        <Form.Label>Período</Form.Label>
                        <Form.Control type="text" placeholder={this.state.tpNivelEnsino} disabled value={this.state.tpNivelEnsino}/>
                    </Form.Group>
                  </div>
                }

                {
                  (this.state.isEdicao) &&
                  <div>

                    <FloatingLabel className="inputNovaTurma" controlId="floatingSelectGrid" label="Período">
                      <Form.Select aria-label="Floating label" onChange={this.handleTpPeriodo}>
                        <option value="">Nenhum</option>
                        <option value="MATUTINO">Matutino</option>
                        <option value="VESPERTINO">Vespertino</option>
                        <option value="NOTURNO">Noturno</option>
                        <option value="INTEGRAL">Integral</option>
                      </Form.Select>
                    </FloatingLabel>

                    <FloatingLabel className="inputNovaTurma" controlId="floatingSelectGrid" label="Ensino">
                      <Form.Select aria-label="Floating label" onChange={this.handleTpNivelEnsino}>
                        <option value="">Nenhum</option>
                        <option value="Infantil">Infantil</option>
                        <option value="Fundamental I">Fundamental I</option>
                        <option value="Fundamental II">Fundamental II</option>
                        <option value="Médio">Médio</option>
                      </Form.Select>
                    </FloatingLabel>
                    
                  </div>
                }
              
                <Form.Group className="mb-3" controlId="turmaForm.totalFaltas">
                    <Form.Label>Total de faltas na turma</Form.Label>
                    <Form.Control type="text" placeholder={this.state.totalFaltas} disabled />
                </Form.Group>
              </Form>
            </Col>
          </Row>

          <Row>
            <Col xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 10, offset: 1}}>
              <Button onClick={this.habilitarEdicao} disabled={this.state.isEdicao}>Nova</Button>
              <Button variant="success" className="btnSalvarTurma" onClick={this.salvarTurma} disabled={!this.state.isEdicao}>Salvar</Button>
              <Button variant="secondary" className="btnDeletarTurma" onClick={() => {window.location = './lista-turmas'}} disabled={!this.state.isEdicao}>Cancelar</Button>
              <Button variant="danger" className="btnDeletarTurma" onClick={this.deletarTurma} disabled={this.state.isEdicao}>Deletar</Button>
              
            </Col>
          </Row>

          <Row style={{marginTop : "60px"}}>
            <Col xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 10, offset: 1}}>
              <h4>Alunos desta turma </h4>
              <Table responsive="sm" striped bordered hover>
                <thead>
                  <tr>
                      <th>#</th>
                      <th>Nome</th>
                      <th>Número de Matricula</th>
                      <th>Número do RA</th>
                      <th>Faltas</th>
                      <th>Remover</th>
                  </tr>
                </thead>

                <tbody>
                {
                    this.state.alunosTurma.map((aluno) => {
                    return (
                        
                        <tr key={aluno.idAluno}>
                        <td>{aluno.idAluno}</td>
                        <td>{aluno.nome}</td>
                        <td>{aluno.nroMatricula}</td>
                        <td>{aluno.ra}</td>
                        <td style={{textAlign : "center"}}>
                            {/* <Button onClick={() => {this.visualizarAula(aula.idAula)}}>Visualizar Aula</Button> */}
                            <Button onClick={() => {this.abrirFaltasAlunoModal(aluno.idAluno)}}>Calcular faltas</Button>
                        </td>
                        <td style={{textAlign : "center"}}>
                            {/* <Button onClick={() => {this.visualizarAula(aula.idAula)}}>Visualizar Aula</Button> */}
                            <Button variant="danger" className="btnDeletarTurma" onClick={() => {this.removerAlunoDaTurma(aluno.idAluno)}}>Remover da turma</Button>
                        </td>
                        </tr>
                    )
                    })
                }
                </tbody>
              </Table>
            </Col>
          </Row>

            <Modal show={this.state.sucessoModal.show} onHide={this.closeSucessoModal}>
              <Modal.Header closeButton>
                <Modal.Title>Sucesso</Modal.Title>
              </Modal.Header>
              <Modal.Body>{this.state.sucessoModal.mensagem}</Modal.Body>
              <Modal.Footer>
                  <Button variant="secondary" onClick={this.closeSucessoModal}>
                  Ok
                  </Button>
              </Modal.Footer>
              </Modal>

              <Modal show={this.state.faltasAlunoModal.show} onHide={this.fecharFaltasAlunoModal}>
                <Modal.Header closeButton>
                  <Modal.Title>Total de faltas</Modal.Title>
                </Modal.Header>
                {this.state.faltasAlunoModal.detalhesAluno &&
                <Modal.Body>
                    <h5>Data da consulta: {DateHelper.dateParaFormatoPtBr(new Date())}</h5>
                    <br/>
                    <h5>Informações do aluno:</h5>
                    <br/>
                    <p><strong>Total de faltas</strong>: {this.state.faltasAlunoModal.detalhesAluno.totalFaltas}</p>
                    <p><strong>Nome</strong>: {this.state.faltasAlunoModal.detalhesAluno.nome} </p>
                    <p><strong>CPF</strong>: {this.state.faltasAlunoModal.detalhesAluno.cpf} </p>
                    <p><strong>Data de Nascimento</strong>: {this.state.faltasAlunoModal.detalhesAluno.dtNascimento}</p>
                    <p><strong>Sexo</strong>: {this.state.faltasAlunoModal.detalhesAluno.sexo}</p>
                    <p><strong>Número de Matricula</strong>: {this.state.faltasAlunoModal.detalhesAluno.nroMatricula}</p>
                    <p><strong>Número de RA</strong>: {this.state.faltasAlunoModal.detalhesAluno.ra}</p>
                    <p><strong>Email</strong>: {this.state.faltasAlunoModal.detalhesAluno.emailContato}</p>
                </Modal.Body>
                }
                <Modal.Footer>
                  <Button variant="secondary" onClick={this.fecharFaltasAlunoModal}>
                  Fechar
                  </Button>
                </Modal.Footer>
            </Modal>
            
            <ErroModal closeErroModal={this.closeErroModal} erroModal={this.state.erroModal}/>
            <ConfirmacaoModal closeConfirmacaoModal={this.closeConfirmacaoModal} handleSimConfirmacaoModal={this.handleSimConfirmacaoModal} confirmacaoModal={this.state.confirmacaoModal}></ConfirmacaoModal>
            <ConfirmacaoModal closeConfirmacaoModal={this.closeConfirmacaoModalRemoverAluno} handleSimConfirmacaoModal={this.handleSimConfirmacaoModalRemoverAluno} confirmacaoModal={this.state.confirmacaoModalRemoverAluno}></ConfirmacaoModal>
          </Container>
      </div>
    )
  }

  componentDidMount() {
    const parsed = queryString.parse(window.location.search);

      
    this.exibirTurma(parsed.idTurma);
    
  }


}