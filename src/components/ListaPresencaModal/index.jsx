import { Component } from "react";
import Button from "react-bootstrap/Button";
import { Modal } from "react-bootstrap";
import Aula from "../Aula";

import './index.css';

export default class ListaPresencaModal extends Component {
  constructor(props) {
    super(props);


    this.handleClose = () => {
      this.props.closeDetalheAulaModal();
    }
  }

  render(){
    return (
      <Modal dialogClassName="modalDetalheAula" show={this.props.detalheAulaModal.show} onHide={this.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Detalhes da aula {this.props.detalheAulaModal.idAula}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Aula idAula={this.props.detalheAulaModal.idAula} isModal={true}/>
          
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={this.handleClose}>
            Fechar
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  componentDidMount() {

  }
}