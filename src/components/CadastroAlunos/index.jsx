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

import { default as ReactSelect } from "react-select";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, CategoryScale, Legend } from 'chart.js';
import { components } from "react-select";


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

const Option = (props) => {
  return (
    <div>
      <components.Option {...props}>
        <input
          type="checkbox"
          checked={props.isSelected}
          onChange={() => null}
        />{" "}
        <label>{props.label}</label>
      </components.Option>
    </div>
  );
};

const styles = {
  container: base => ({
    ...base,
    flex: 1
  })
};


export default class CadastroAlunos extends Component{

  constructor(props){
    super(props);

    this.state = {
      data: null,
      paisesSelecionados: null,
      dadosPaisesSelect:[],
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
            dadosPaisesSelect : response.data.map((el) => { return {value:el.idPais, label:el.nomePais} } ),
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
      let maxAnoBusca = this.state.maxAnoBusca;

      this.setState(prevState => ({
        ...prevState,
        data : {
          labels: this.state.dadosGrafico.map((el) => el.Ano),
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
          idPaises : this.state.paisesSelecionados ? this.state.paisesSelecionados.map((el) => el.value) : null,
          minAno : minAnoBusca ? minAnoBusca:null,
          maxAno : maxAnoBusca ? maxAnoBusca:null,
          paginacaoRequest : {
            ...prevState.filtros.paginacaoRequest,
            page: 1
          }
          }
        }
      ),() => {this.obterLista();}
      );
    }

    this.handleChangeCheckedSelect = (e) => {
      console.log(e);
      console.log('idPaises',this.state.filtros.idPaises);
      this.setState(prevState => ({
        ...prevState,
        paisesSelecionados : e
      }));
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

    this.handleChangeNumerico = (e) => {

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
            <Col style={{marginTop : "20px"}} >
            <h6>Busque pelo ano mínimo de corte </h6>
              <InputGroup >
                <FormControl 
                  placeholder="Exemplo: 1990"
                  aria-label="Ano mínimo"
                  aria-describedby="Buscar"
                  name = "minAnoBusca"
                  value = {this.minAnoBusca}
                  onChange={this.handleChangeNumerico} 
                  type="number"
                />
              </InputGroup>
            </Col>
            <Col style={{marginTop : "20px"}} >
            <h6>Busque por um ano máximo </h6>
              <InputGroup >
                <FormControl 
                  placeholder="Exemplo: 2020"
                  aria-label="Ano máximo"
                  aria-describedby="Buscar"
                  name = "maxAnoBusca"
                  value = {this.maxAnoBusca}
                  onChange={this.handleChangeNumerico} 
                  type="number"
                />
              </InputGroup>
            </Col>
            <Col style={{marginTop : "20px"}} >
              <h6>Selecione os países </h6>
              <InputGroup >
                <ReactSelect
                  options={this.state.dadosPaisesSelect}
                  styles={styles}
                  isMulti
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                  components={{
                    Option
                  }}
                  onChange={this.handleChangeCheckedSelect}
                  allowSelectAll={true}
                  value={this.state.paisesSelecionados}
                  name = "selectPaises"
                />
              </InputGroup>
            </Col>
          </Row>
          <Row>
          <Col style={{marginTop : "20px"}}>
            <InputGroup >

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
                      <th>Pib - USD</th>
                      <th>Variacao Pib - %</th>
                      <th>Pib Per Capita - USD</th>
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