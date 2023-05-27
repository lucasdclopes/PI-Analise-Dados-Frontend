import { Component } from "react";
import { Container, Table, Form, Row, Col, InputGroup, FormControl, ButtonGroup, ToggleButton, Card } from 'react-bootstrap';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import './index.css';
import queryString from 'query-string';
import HttpService from '../../services/HttpService';
import HttpServiceHandler from '../../services/HttpServiceHandler';
import ErroModal from '../ErroModal';
import Button from 'react-bootstrap/Button';
import MenuLogado from '../MenuLogado';
import { Modal } from 'react-bootstrap';
import ConfirmacaoModal from "../ConfirmacaoModal";
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Paginacao from '../Paginacao';
import AsyncSelect from 'react-select/async';


export default class CadastroBeneficios extends Component{

  constructor(props){
    super(props);

    this.state = {
      idBeneficio : 0,
      nome : "",
      nis : "",
      dtRecebimento : "",
      responsavelRecebimento : "", 
      descBeneficio : "",  
      beneficios : [],   
      idAluno : 0, 
      textoBusca : null, 
      paramBusca : null, 
      paramBuscaAluno : "1", 
      filtros : {
        idAluno : null,
        dtRecebimentoInicio : null,
        dtRecebimentoFim : null,
        responsavelRecebimento : null,
        paginacaoRequest : {
          size: 15,
          page: 1
        },
        paginacaoResponse : {
          quantidade : null,
          hasProxima : null
        }
      },
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

    this.obterLista = () => {
      console.log('obterLista');
      HttpService.listarBeneficios(this.state.filtros)
      .then((response) => {
        if (response){
          this.setState(prevState => ({
            ...prevState,
            beneficios : response.data,
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
            alunos : []
          }));
        }
      })
      this.limparFiltros();
    }

    this.abrirConfirmacaoModal = () => {
      this.setState({
        confirmacaoModal : {
          perguntaConfirmacao : 'Deseja realmente excluir o benefício? Isto NÃO poderá ser desfeito',
          show : true,
          titulo : 'Deletar Benefício',
        }
      });
    }

    this.handleSimConfirmacaoModal = () => {
      HttpService.deletarBeneficio(this.state.idBeneficio)
      .then((response) => {
        if (response) {
          this.setState({
            sucessoModal : {
              mensagem : 'Benefício removido com sucesso.',
              show : true
            }
          });

        this.setState(prevState => ({
          ...prevState,
          idBeneficio : 0,
          isEdicao : false,
          beneficios : []
        }), () => {
          this.obterLista();
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

    this.abrirSucessoModal = (msg,redirect) => {
      this.setState({
        sucessoModal : {
          mensagem : msg,
          show : true,
          redirect : redirect
        }
      });
    }

    this.novoBeneficio = () => {
        this.setState({
            idBeneficio : 0,
            isEdicao: true
          });
    }

    this.handlerSelecionarAluno = (e) => {

      let idAluno = e.value;
      console.log('buscando aluno');
      HttpService.exibirAluno(idAluno)
      .then((response) => {

        let data = response.data;
        this.setState(prevState => ({
          ...prevState,  
          idAluno : data.idAluno,
          nome : data.nome,
          nis : data.nis,
          responsavelRecebimento : data.mae === null? null : data.mae.nome, //bota a mãe com default
          isEdicao : true
        }));
      })
      .catch((error) => {
        new HttpServiceHandler().validarExceptionHTTP(error.response, this);
      });
    }

    this.exibirBeneficio = (idBeneficio) => {
      console.log('buscando bene');
      this.limparDados();
      HttpService.exibirBeneficio(idBeneficio)
      .then((response) => {

        let data = response.data;
        this.setState(prevState => ({
          ...prevState, 
          idBeneficio : data.idBeneficio,
          nome : data.aluno.nome,
          nis : data.aluno.nis,
          dtRecebimento : data.dtRecebimento,
          responsavelRecebimento : data.responsavelRecebimento, 
          descBeneficio : data.descBeneficio,  
          idAluno : data.aluno.idAluno, 
          isEdicao: true
        }));
      })
      .catch((error) => {
        new HttpServiceHandler().validarExceptionHTTP(error.response, this);
      });
    }


    this.salvarBeneficio = (e) => {

      HttpService.salvarBeneficio({
        idAluno : this.state.idAluno,
        dtRecebimento : this.state.dtRecebimento,
        responsavelRecebimento : this.state.responsavelRecebimento,
        descBeneficio : this.state.descBeneficio
      },
      this.state.idBeneficio
      )
      .then((response) => {
        if (response) {
          this.setState({
            sucessoModal : {
              mensagem : 'Benefício cadastrado com sucesso.',
              show : true
            }
          });
        }

      this.setState(prevState => ({
        ...prevState,
        idBeneficio : 0,
        nome : "",
        nis : "",
        dtRecebimento : "",
        responsavelRecebimento : "",
        idAluno : 0,
        descBeneficio : "",
        isEdicao : false,
        beneficios : []
      }), () => {
        this.obterLista();
      });

      })
      .catch((error) => {
        new HttpServiceHandler().validarExceptionHTTP(error.response, this);
      }); 


    }
    this.deletarBeneficio = (e) => {
      this.abrirConfirmacaoModal();
    }

    this.abrirTurmas = () => {
      window.location = './lista-turmas?idAluno=' + this.state.idAluno;
    }

    this.handleChange = (e) => {
      /*
      console.log(this.state.paramBusca);
      console.log(e.target.type);
      console.log(e.target.value);
      console.log('e.target.name ' + e.target.name);*/

      const name = e.target.name;
      const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
      this.setState(prevState => ({
        ...prevState,
        [name]: value
      }));
    }

    this.handleChangeNumerico = (e) => {
    /*  
      console.log('num ' + this.state.paramBusca);
      console.log('num ' + e.target.type);
      console.log('num ' + e.target.value);
      console.log('num e.target.name ' + e.target.name);*/

      const re = /^[0-9\b]+$/;
      if (e.target.value === '' || re.test(e.target.value)) {
        console.log('noif');
        const name = e.target.name;
        const value =
        e.target.type === "checkbox" ? e.target.checked : e.target.value;
        this.setState({ 
          [name]: value 
        });
     } 
    }
  
    this.limparFiltros = (e) => {
      console.log('limpando filtros');
      this.setState(prevState => ({
        ...prevState,
        filtros : {
          ...prevState.filtros,
          idAluno : null,
          dtRecebimentoInicio : null,
          dtRecebimentoFim : null,
          responsavelRecebimento : null
          }
        }
      ));
    }

    this.limparDados = (e) => {
      console.log('limpando dados');
      this.setState(prevState => ({
        ...prevState,
        idBeneficio : 0,
        nome : "",
        nis : "",
        dtRecebimento : "",
        responsavelRecebimento : "",
        idAluno : 0,
        descBeneficio : ""
      }  
      )
      );
    }

    this.gerarFiltroBuscaAluno = (textoParaBusca) => {

      
      let filtrosAluno = {
        cpf : null,
        nome : null,
        nomePai : null,
        nomeMae : null,
        nis : null,
        paginacaoRequest : {
          size: 15,
          page: 1
        },
        paginacaoResponse : {
          quantidade : null,
          hasProxima : null
        }
      };

      console.log('paramBusca ' + this.state.paramBuscaAluno);
      console.log('textoBusca ' + textoParaBusca);

      if (textoParaBusca === null){
        console.log('this.state.textoBusca === null ');
        return filtrosAluno;
      }

      switch (this.state.paramBuscaAluno) {
        case '1':
          console.log('s1');
          filtrosAluno.nome = textoParaBusca;
          break;
        case '2':
          console.log('s2');
          filtrosAluno.cpf = textoParaBusca;
          break;
        case '3':
          console.log('s3');
          filtrosAluno.nomeMae = textoParaBusca;
          break;
        case '4':
          console.log('s4');
          filtrosAluno.nomePai = textoParaBusca;
          break;
        case '5':
          filtrosAluno.nis = textoParaBusca;
          break;
        default:
          filtrosAluno.nome = textoParaBusca;
        } 
        return filtrosAluno;
    }

    this.getByValue = (map, searchValue) => {
      for (var i=0; i < map.length; i++) {
        if (map[i].value === searchValue) {
            return map[i].name;
        }
      }
    }
    
    this.radiosBuscaAluno = [
      { name: 'Nome', value: '1' },
      { name: 'CPF', value: '2' },
      { name: 'Nome da Mãe', value: '3' },
      { name: 'Nome do Pai', value: '4' },
      { name: 'NIS', value: '5' },
    ];

    

  }


  

  render(){

    const promiseOptionsAlunoNome = (inputValue) => {
      // new Promise((resolve) => {
      //   setTimeout(() => {
      //     resolve(filterColors(inputValue));
      //   }, 1000);
      // }

      let listaAlunos = [];
      let request = this.gerarFiltroBuscaAluno(inputValue);
      request.paginacaoRequest.size = 30;

      return HttpService.listarAlunos(request)      
      .then((response) => {
        response.data.forEach((aluno) => {
          listaAlunos.push({
            value : aluno.idAluno,
            label : aluno.nome
          });          
        });
        return listaAlunos;
      });
    };

    return (
      <div>

        <Container className="containerCadastroBeneficios" fluid>

          <Row>
            <Col xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 10, offset: 1}} lg={{span: 10, offset: 1}}>
              <MenuLogado/>
            </Col>
          </Row>

          <Row>
            <Col xs={{span: 6, offset: 0}} sm={{span : 6, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 10, offset: 1}}>
              <h3 className="Aluno">Benefícios</h3>
            </Col>
          </Row>

          <Col style={{marginTop : "60px"}} xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 10, offset: 1}}>
          <ButtonGroup>
            {this.radiosBuscaAluno.map((radio, idx) => (
              <ToggleButton
                key={idx}
                id={`radio-${idx}`}
                type="radio"
                variant={this.state.paramBuscaAluno === radio.value ? 'outline-primary' : 'outline-secondary'}
                name="paramBuscaAluno"
                value={radio.value}
                checked={this.state.paramBuscaAluno === radio.value}
                onChange={this.handleChange}
              >
                {radio.name}
              </ToggleButton>
            ))}
          </ButtonGroup>
          </Col>

          <Row className="mb-3">
            <Col style={{marginTop : "10px"}} xs={{span: 4, offset: 0}} sm={{span : 4, offset: 0}}  md={{span : 4, offset: 0}} lg={{span: 4, offset: 1}}>
              <AsyncSelect placeholder={'Buscar aluno beneficiado usando o ' + this.getByValue(this.radiosBuscaAluno,this.state.paramBuscaAluno)}  
              noOptionsMessage={() => {return "Nenhum aluno encontrado"}} onChange={this.handlerSelecionarAluno} loadOptions={promiseOptionsAlunoNome} 
              />         
            </Col>
          </Row>

        
          <Row className="mb-3">
            <Col xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 10, offset: 1}}>
              <Form>
                <Row>
                  <Col xs={3}>
                    <OverlayTrigger
                      key="bottom"
                      placement="bottom"
                      overlay={
                      <Tooltip id="tooltip-disabled">
                      <strong>Este dado é obtido do cadastro. Para altera-lo é necessário alterar o cadastro do aluno</strong>
                      </Tooltip>}
                    >  
                      <Form.Group className="inputBeneficio" controlId="beneficiosForm.dadosPessoais">
                          <Form.Label>Nome</Form.Label>
                          <Form.Control type="text" disabled="true" value={this.state.nome} name="nome" required autoComplete="false" maxLength="100"
                          />
                      </Form.Group>
                    </OverlayTrigger>
                  </Col>
                  <Col xs={3}>
                    <OverlayTrigger
                      key="bottom"
                      placement="bottom"
                      overlay={
                      <Tooltip id="tooltip-disabled">
                      <strong>Este dado é obtido do cadastro. Para altera-lo é necessário alterar o cadastro do aluno</strong>
                      </Tooltip>}
                    >  
                      <Form.Group className="inputBeneficio" controlId="beneficiosForm.dadosPessoais">
                          <Form.Label>NIS</Form.Label>
                          <Form.Control type="text" disabled="true" value={this.state.nis} name="nis" required autoComplete="false" maxLength="11"
                          />
                      </Form.Group>
                    </OverlayTrigger>
                  </Col>

                  <Col xs={3}>
                    <Form.Group className="inputBeneficio" controlId="beneficiosForm.dtRecebimento">
                        <Form.Label>Data do Recebimento</Form.Label>
                        <Form.Control type="text" placeholder={"DD/MM/AAAA"} disabled={!this.state.isEdicao}  
                        onChange={this.handleChange} value={this.state.dtRecebimento} name="dtRecebimento" required autoComplete="false" maxLength="10"
                        />  
                    </Form.Group>
                  </Col>

                  <Col xs={3}>
                    <Form.Group className="inputBeneficio" controlId="beneficiosForm.responsavelRecebimento">
                        <Form.Label>Responsável pelo recebimento</Form.Label>
                        <Form.Control type="text" placeholder={"Responsável"} disabled={!this.state.isEdicao} onChange={this.handleChange} 
                        value={this.state.responsavelRecebimento} name="responsavelRecebimento" required autoComplete="false" maxLength="100"
                        />
                    </Form.Group>
                  </Col>
                </Row>


                <Form.Group as={Col} className="inputBeneficio" controlId="beneficiosForm.descBeneficio">
                    <Form.Label>Detalhamento</Form.Label>
                    <Form.Control as="textarea" rows={4} disabled={!this.state.isEdicao}  placeholder={"Descreva qual foi o benefício fornecido, máximo de 500 caractéres"} onChange={this.handleChange}
                    value={this.state.descBeneficio} name="descBeneficio" required autoComplete="false" maxLength="500"
                    />
                </Form.Group>
                
              </Form>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 10, offset: 1}}>
              <Button onClick={this.novoBeneficio} disabled={this.state.isEdicao}>Novo</Button>
              <Button variant="success" className="btnSalvarBeneficio" onClick={this.salvarBeneficio} disabled={!this.state.isEdicao}>Salvar</Button>
              <Button variant="secondary" className="btnCancelar" onClick={() => {window.location = './cadastro-beneficios'}} disabled={!this.state.isEdicao}>Cancelar</Button>
              <Button variant="danger" className="btnDeletarBeneficio" onClick={this.deletarBeneficio} disabled={this.state.idBeneficio == 0}>Deletar</Button>            
            </Col>
          </Row>

          <Row style={{marginTop : "60px"}}>
            <Col xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 10, offset: 1}}>
              <h4>Benefícios Cadastrados </h4>
              <Table responsive="sm" striped bordered hover>
                <thead>
                  <tr>
                      <th>#</th>
                      <th>Nome</th>
                      <th>NIS</th>
                      <th>Data do Recebimento</th>
                      <th>Responsável pelo Recebimento</th>
                      <th>Detalhes</th>
                  </tr>
                </thead>

                <tbody>
                {
                    this.state.beneficios.map((beneficio) => {
                    return (
                        
                        <tr key={beneficio.idBeneficio}>
                        <td>{beneficio.idBeneficio}</td>
                        <td>{beneficio.nomeAluno}</td>
                        <td>{beneficio.nisAluno}</td>
                        <td>{beneficio.dtRecebimento}</td>
                        <td>{beneficio.responsavelRecebimento}</td>
                        <td style={{textAlign : "center"}}>
                            {/* <Button onClick={() => {this.visualizarAula(aula.idAula)}}>Visualizar Aula</Button> */}
                            <Button onClick={() => {this.exibirBeneficio(beneficio.idBeneficio)}}>Editar/Ver Detalhes</Button>
                        </td>
                        </tr>
                    )
                    })
                }
                </tbody>
              </Table>
            </Col>
          </Row>

          <Paginacao there={this} />

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
            
            <ErroModal closeErroModal={this.closeErroModal} erroModal={this.state.erroModal}/>
            <ConfirmacaoModal closeConfirmacaoModal={this.closeConfirmacaoModal} handleSimConfirmacaoModal={this.handleSimConfirmacaoModal} confirmacaoModal={this.state.confirmacaoModal}></ConfirmacaoModal>
          </Container>
      </div>
    )
  }

  componentDidMount() {
    //const parsed = queryString.parse(window.location.search);

      
    this.obterLista();

    //if (parsed.idAluno !== null && typeof parsed.idAluno != "undefined") {
     // this.exibirAluno(parsed.idAluno);
   // }
    
  }


}