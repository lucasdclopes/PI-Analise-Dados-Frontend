import { Component } from "react";
import { Container, Table, Row, Col, InputGroup, FormControl } from 'react-bootstrap';
import './index.css';
import HttpService from '../../services/HttpService';
import HttpServiceHandler from '../../services/HttpServiceHandler';
import ErroModal from '../ErroModal';
import Button from 'react-bootstrap/Button';
import MenuLogado from '../MenuLogado';
import { Modal } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';

import { default as ReactSelect } from "react-select";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, Title, CategoryScale, Legend } from 'chart.js';
import { components } from "react-select";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Legend, Title);


export const options = {
  responsive: true,
  scales: {
    yCo2: {
      type: 'linear',
      display: true,
      position: 'left',
      title: {
        display: true,
        text: 'CO2'
      },
    },
    yPibPerCapita: {
      type: 'linear',
      display: true,
      position: 'right',
      title: {
        display: true,
        text: 'PIB Per Capita'
      },
      // grid line settings
      grid: {
        drawOnChartArea: false, // only want the grid lines for one axis to show up
      },
    },
  },
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Dados de PIB x CO2',
    },
    tooltip: {
      mode: 'index',
      intersect: false
    },
    hover: {
      mode: 'index',
      intersect: false
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



export default class PibxCo2 extends Component{

  constructor(props){
    super(props);

    this.state = {
      data: null,
      paisesSelecionados: null,
      dadosPaisesSelect:[],
      dadosGrafico: [],
      filtros : {
        idPaises : [],
        minAno : null,
        maxAno : null,
        normalizar: false,
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
      let normalizar = this.state.filtros.normalizar;
      HttpService.calcularPibCo2Paises(this.state.filtros)
      .then((response) => {
        if (response){
          this.setState(prevState => ({
            ...prevState,
            dadosGrafico : response.data,
            data : {
              labels: response.data.map((el) => el.ano),
              datasets: [
                {
                  label: 'Emissão CO2',
                  backgroundColor: 'rgba(194, 116, 161, 0.5)',
                  borderColor: 'rgb(194, 116, 161)',
                  data: response.data.map(
                    (el) => normalizar ? 
                      el.co2.tendenciaCentralNormalizado : el.co2.tendenciaCentral
                    ),
                  pointBorderColor: 'rgba(0, 0, 0, 0)',
                  pointBackgroundColor: 'rgba(0, 0, 0, 0)',
                  yAxisID: 'yCo2',
                },
                {
                  label: 'PIB Per Capita',
                  backgroundColor: 'rgba(71, 225, 167, 0.5)',
                  borderColor: 'rgb(71, 225, 167)',
                  data: response.data.map(
                    (el) => normalizar ? 
                      el.pibPerCap.tendenciaCentralNormalizado 
                      : el.pibPerCap.tendenciaCentral
                    ),
                  pointBorderColor: 'rgba(0, 0, 0, 0)',
                  pointBackgroundColor: 'rgba(0, 0, 0, 0)',
                  yAxisID: 'yPibPerCapita',
                }
              ]
            },
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
            dadosPaisesSelect :  response.data.map((el) => { return {value:el.idPais, label:el.nomePais} } ),
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
      console.log('filtros ' + this.state.minAnoBusca);

      let minAnoBusca = this.state.minAnoBusca;
      let maxAnoBusca = this.state.maxAnoBusca;

      this.setState(prevState => ({
        ...prevState,
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

    this.handleChange = (e) => {
      
      console.log('e.target.name ' + e.target.name);
      console.log(e.target.type);
      console.log(e.target.value);

      const name = e.target.name;
      const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
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

    this.handleChangeCheckedSelect = (e) => {
      console.log(e);
      console.log('idPaises',this.state.filtros.idPaises);
      this.setState(prevState => ({
        ...prevState,
        paisesSelecionados : e
      }));
    }

    this.toggleExibirNormalizado = (e) => {
      if (e.target.checked){
        this.setState(prevState => ({
          filtros : {
            ...prevState.filtros,
            normalizar : true
          }
        }), () => {
          this.obterLista();
        });
        
      }
      else {
        this.setState(prevState => ({
          filtros : {
            ...prevState.filtros,
            normalizar : false
          }
        }), () => {
          this.obterLista();
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

        <Container className="containerCalcPibCo2" fluid>

          <Row>
            <Col xs={{span: 12, offset: 0}} sm={{span : 12, offset: 0}}  md={{span : 10, offset: 1}} lg={{span: 10, offset: 1}}>
              <MenuLogado/>
            </Col>
          </Row>

          <Row>
            <Col xs={{span: 6, offset: 0}} sm={{span : 6, offset: 0}}  md={{span : 12, offset: 0}} lg={{span: 10, offset: 1}}>
              <h3 className="Dados">Dados</h3>
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
          <Row>

            <Form.Check 
              type={"checkbox"}
              id={1}
              label={"normalizar os dados"}
              checked={this.state.filtros.normalizar}
              onChange={this.toggleExibirNormalizado}
            />

            {
              <span>{this.state.filtros.diaSemana}</span>
            }
            </Row>
          </Col>


          { this.state.data &&
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
                      <th>Pib - USD</th>
                      <th>Pib (máximo)</th>
                      <th>Pib (mínimo)</th>
                      <th>Pib Per Capita - USD</th>
                      <th>Pib Per Capita (máximo)</th>
                      <th>Pib Per Capita (mínimo)</th>
                      <th>Emissão CO2 - toneladas</th>
                      <th>Emissão CO2 (máximo)</th>
                      <th>Emissão CO2 (mínimo)</th>
                  </tr>
                </thead>

                <tbody>
                {
                    this.state.dadosGrafico.map((dado) => {
                    return (
                      <tr key={dado.ano + dado.pib.tendenciaCentral + dado.co2.tendenciaCentral}>
                        <td>{dado.ano}</td>
                        <td>{dado.pib.tendenciaCentral}</td>
                        <td>{dado.pib.max}</td>
                        <td>{dado.pib.min}</td>
                        <td>{dado.pibPerCap.tendenciaCentral}</td>
                        <td>{dado.pibPerCap.max}</td>
                        <td>{dado.pibPerCap.min}</td>
                        <td>{dado.co2.tendenciaCentral}</td>
                        <td>{dado.co2.max}</td>
                        <td>{dado.co2.min}</td>
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
          </Container>
      </div>
    )
  }

  componentDidMount() {
      
    this.obterPaises();
    this.obterLista();
    
  }


}