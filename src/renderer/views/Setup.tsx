import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

import bg from '../../assets/img/background.jpg';

class Setup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      scores: [],
      lastGameConfig: '',
    };
  }

  render() {
    return (
      <Container
        flex
        style={{ backgroundImage: `url(${bg}`, backgroundSize: 'cover' }}
      >
        <Row>
          <Col>
            <Card className="setup-card text-center" bg="dark" text="white">
              <Card.Header>Setup</Card.Header>
              <Card.Body>
                {
                  // TODO: Implement Form to define game characteristics before being able to launch.
                }
                <h3>SPACEGAME configurator</h3>
                <br />
                <br />
                <br />
                <Link to="/game">
                  {
                    // TODO: When launching a new game, all characteristics will be set in a redux game config state
                  }
                  <Button>Launch Game</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Setup;
