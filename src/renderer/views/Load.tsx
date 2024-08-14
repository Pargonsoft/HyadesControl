import React, { Component } from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Table from 'react-bootstrap/Table';

import LoadList from '../elements/LoadList';

import bg from '../../assets/img/background.jpg';

class Load extends Component {
  constructor(props) {
    super(props);

    this.state = {
      scores: [],
      lastGameConfig: '',
    };
    this.loadClick = this.loadClick.bind(this);
    this.deleteClick = this.deleteClick.bind(this);
  }

  loadClick = (event) => {
    alert(`load: ${event.target.id}`);
  };

  deleteClick(event) {
    alert(`delete: ${event.target.id}`);
  }

  render() {
    return (
      <Container
        fluid
        style={{ backgroundImage: `url(${bg}`, backgroundSize: 'cover' }}
      >
        <Row>
          <Col>
            <Card className="load-card text-center" bg="dark" text="white">
              <Card.Header>Load</Card.Header>
              <Card.Body>
                <Table
                  striped
                  bordered
                  hover
                  variant="dark"
                  size="sm"
                  className="load-list"
                >
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <LoadList
                      saves={this.props.saves}
                      fload={this.loadClick}
                      fdel={this.deleteClick}
                    />
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Load;
