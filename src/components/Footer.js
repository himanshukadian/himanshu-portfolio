import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import {
  AiFillGithub,
  AiOutlineMail,
  AiOutlinePhone,
} from "react-icons/ai";
import { FaLinkedinIn } from "react-icons/fa";
import { resumeData } from "../data/resume";

function Footer() {
  let date = new Date();
  let year = date.getFullYear();
  return (
    <Container fluid className="footer">
      <Row>
        <Col md="4" className="footer-copywright">
          <h3>Designed and Developed by {resumeData.name}</h3>
        </Col>
        <Col md="4" className="footer-copywright">
          <h3>Copyright © {year} HC</h3>
        </Col>
        <Col md="4" className="footer-body">
          <ul className="footer-icons">
            <li className="social-icons">
              <a
                href={resumeData.github}
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="GitHub Profile"
              >
                <AiFillGithub />
              </a>
            </li>
            <li className="social-icons">
              <a
                href={resumeData.linkedin}
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="LinkedIn Profile"
              >
                <FaLinkedinIn />
              </a>
            </li>
            <li className="social-icons">
              <a
                href={`mailto:${resumeData.email}`}
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Email Contact"
              >
                <AiOutlineMail />
              </a>
            </li>
            <li className="social-icons">
              <a
                href={`tel:${resumeData.phone}`}
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Phone Contact"
              >
                <AiOutlinePhone />
              </a>
            </li>
          </ul>
        </Col>
      </Row>
    </Container>
  );
}

export default Footer;
