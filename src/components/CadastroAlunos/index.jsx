import { Component } from "react";
import { Container, Table, Row, Col, InputGroup, FormControl } from 'react-bootstrap';
import './index.css';
import HttpService from '../../services/HttpService';
import HttpServiceHandler from '../../services/HttpServiceHandler';
import ErroModal from '../ErroModal';
import Button from 'react-bootstrap/Button';
import MenuLogado from '../MenuLogado';
import Paginacao from '../Paginacao';
import { Modal } from 'react-bootstrap';

import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, CategoryScale, Legend } from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Legend, Title);


export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Dados de PIB',
    },
  },
};


export default class CadastroAlunos extends Component{

  constructor(props){
    super(props);

    this.state = {
      data: null,
      dadosPaises: [],
      dadosGrafico: [],
      filtros : {
        paginacaoRequest : {
          size: 50,
          page: 1
        },
        paginacaoResponse : {
          quantidade : null,
          hasProxima : null
        },
        idPaises : [],
        minAno : null,
        maxAno : null
      },
      erroModal : {
        mensagemErro : '',
        show : false,
        titulo : ''
      },
      sucessoModal : {
        mensagem : '',
        show : false,
        redirect : ''
      }   
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

    this.obterLista = () => {
      console.log('obterLista');
      HttpService.listarPibPaises(this.state.filtros)
      .then((response) => {
        if (response){
          this.setState(prevState => ({
            ...prevState,
            //dadosGrafico : response.data.map((item) => item.idPais = this.state.dadosPaises.find((el) => el.idPais == item.idPais).nomePais),
            dadosGrafico : response.data.map((item) => {
              return {...item, nomePais: this.state.dadosPaises.find((el) => el.idPais == item.idPais).nomePais}
            }),
            //dadosGrafico : response.data,
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
            dadosGrafico : []
          }));
        }
      })
      //this.limparFiltros();
    }

    this.obterPaises = () => {
      console.log('obterPaises');
      const filtroLocal = {paginacaoRequest:{size:15000,page:1}};
      HttpService.listarPaises(filtroLocal)
      .then((response) => {
        if (response){
          this.setState(prevState => ({
            ...prevState,
            dadosPaises : response.data,
            filtros : {
              ...prevState.filtros
            }
          }));
        }
      })
      .catch((error) => {
        console.log('obterPaisesErro');
        let httpServiceHandler = new HttpServiceHandler();
        httpServiceHandler.validarExceptionHTTP(error.response,this);

        if (error.response.status == 404){
          this.setState(prevState => ({
            ...prevState,
            dadosPaises : []
          }));
        }
      })
      this.limparFiltros();
    }


    this.buscarPais = (e) => {

      
      console.log('textoBusca ' + this.state.textoBusca);
      console.log('filtros ' + this.state.filtros);

      let textoParaBusca = this.state.textoBusca;
      let minAnoBusca = this.state.minAnoBusca;

      if (!this.state.textoBusca){
        console.log('this.state.textoBusca not null ');
        this.setState(prevState => ({
          ...prevState,
          filtros : {
            ...prevState.filtros,
            idPaises : null
          }
          }
        ),() => {this.obterLista();}
        );
      }

      if (!this.state.minAnoBusca){
        console.log('this.state.minAnoBusca not null ');
        this.setState(prevState => ({
          ...prevState,
          filtros : {
            ...prevState.filtros,
            minAno : null
          }
          }
        ),() => {this.obterLista();}
        );
      }

      this.setState(prevState => ({
        ...prevState,
        data : {
          labels: this.state.dadosGrafico.map((el) => el.Ano),
          //labels: [10,20,30,40,155,900],
          datasets: [
            {
              label: 'PIB',
              backgroundColor: 'rgba(194, 116, 161, 0.5)',
              borderColor: 'rgb(194, 116, 161)',
              data: this.state.dadosGrafico.map((el) => el.pibTotal),
            },
            {
              label: 'PIB Per Capita',
              backgroundColor: 'rgba(71, 225, 167, 0.5)',
              borderColor: 'rgb(71, 225, 167)',
              data: this.state.dadosGrafico.map((el) => el.pibPerCapita),
            },
          ]
        },
        filtros : {
          ...prevState.filtros,
          idPaises : textoParaBusca ? textoParaBusca.split(','):null,
          minAno : minAnoBusca,
          paginacaoRequest : {
            ...prevState.filtros.paginacaoRequest,
            page: 1
          }
          }
        }
      ),() => {this.obterLista();}
      );
    }

    this.handleChange = (e) => {
      
      console.log(e.target.type);
      console.log(e.target.value);
      console.log('e.target.name ' + e.target.name);

      const name = e.target.name;
      const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
      this.setState(prevState => ({
        ...prevState,
        [name]: value
      }));
    }

  
    this.limparFiltros = (e) => {
      console.log('limpando filtros');
      this.setState(prevState => ({
        ...prevState,
        filtros : {
          ...prevState.filtros,
          idPaises: [],
          minAno: null,
          maxAno: null
          }
        }
      ));
    }

    this.limparDados = (e) => {
      console.log('limpando dados');
      this.setState(prevState => ({
        ...prevState,
        dadosGrafico:[]
      }  
      )
      );
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
              <h3 className="Aluno">Dados</h3>
            </Col>
          </Row>

          <Col style={{marginTop : "60px"}} xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 10, offset: 1}}>
          <Row>
          <Col style={{marginTop : "60px"}}>
            <h6>Busque pelo código dos países </h6>
            <InputGroup >
              <FormControl 
                placeholder="Exemplo: 1, 4, 50"
                aria-label="Buscar por país"
                aria-describedby="Buscar"
                name = "textoBusca"
                value = {this.textoBusca}
                onChange={this.handleChange} 
              />

              <Button id="btnBuscar"
              onClick={this.buscarPais}
              >
                Buscar
              </Button>
            </InputGroup>
          </Col>
          </Row>
          <Row>
          <Col style={{marginTop : "60px"}}>
          <h6>Busque pelo ano mínimo de corte </h6>
            <InputGroup >
              <FormControl 
                placeholder="Exemplo: 1990"
                aria-label="Ano mínimo"
                aria-describedby="Buscar"
                name = "minAnoBusca"
                value = {this.minAnoBusca}
                onChange={this.handleChange} 
              />

              <Button id="btnBuscar"
              onClick={this.buscarPais}
              >
                Buscar
              </Button>
            </InputGroup>
          </Col>
          </Row>
          <br></br>
          <h5>Busque por somente um país para ver o gráfico </h5>
          </Col>

          {
          (this.state.filtros.idPaises) && (this.state.filtros.idPaises.length == 1) &&
          <Col xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 10, offset: 1}}>
          <Line 
            data={this.state.data} options={options} />
            </Col>
        }

          <Row style={{marginTop : "60px"}}>
            <Col xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 10, offset: 1}}>
              <h4>Dados de PIB Cadastrados </h4>
              <Table responsive="sm" striped bordered hover>
                <thead>
                  <tr>
                      <th>Ano</th>
                      <th>País</th>
                      <th>Pib</th>
                      <th>Variacao Pib</th>
                      <th>Pib Per Capita</th>
                  </tr>
                </thead>

                <tbody>
                {
                    this.state.dadosGrafico.map((dado) => {
                    return (
                        
                      <tr key={dado.Ano + dado.nomePais}>
                        <td>{dado.Ano}</td>
                        <td>{dado.nomePais}</td>
                        <td>{dado.pibTotal}</td>
                        <td>{dado.variacaoPib}</td>
                        <td>{dado.pibPerCapita}</td>
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
            
            <ErroModal closeErroModal={this.closeErroModal} erroModal={this.state.erroModal}/>
            <Paginacao there={this} />
          </Container>
      </div>
    )
  }

  componentDidMount() {
      
    this.obterPaises();
    this.obterLista();
    
  }


}