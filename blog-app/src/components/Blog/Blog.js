import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { FaSearch, FaCalendarAlt, FaClock, FaTag } from 'react-icons/fa';
import aboutImg from '../../Assets/about.png';
import './Blog.css';
import blogPosts from './blogPostsData';

const categories = ["All", "React", "TypeScript", "JavaScript", "Web Development"];

const Blog = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { isDark } = useTheme();

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="resume-section" id="blog">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Search Bar */}
          <div className="search-container mb-4">
            <InputGroup className="search-input-group">
              <InputGroup.Text className={`search-icon ${isDark ? 'bg-dark text-light' : 'bg-light'}`}>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`search-input ${isDark ? 'bg-dark text-light' : 'bg-light'}`}
              />
            </InputGroup>
          </div>

          {/* Category Filter */}
          <div className="category-filter mb-5">
            {categories.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`category-btn ${selectedCategory === category ? 'active' : ''} ${isDark ? 'dark' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </motion.button>
            ))}
          </div>

          {/* Blog Posts Grid */}
          <AnimatePresence>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="blog-posts-grid"
            >
              <Row>
                {filteredPosts.map((post) => (
                  <Col key={post.id} md={6} lg={4} className="mb-4 d-flex align-items-stretch">
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="w-100"
                    >
                      <Card className="project-card-view h-100 d-flex flex-column justify-content-between">
                        <Card.Img variant="top" src={post.image} alt={post.title} className="card-img-top" />
                        <Card.Body className="d-flex flex-column">
                          <Card.Title className="h4 mb-3">{post.title}</Card.Title>
                          <Card.Text className="mb-4">{post.excerpt}</Card.Text>
                          <div className="post-meta mb-3">
                            <span className="me-3">
                              <FaCalendarAlt className="me-1" />
                              {post.date}
                            </span>
                            <span>
                              <FaClock className="me-1" />
                              {post.readTime}
                            </span>
                          </div>
                          <div className="tags-container mb-3">
                            {post.tags.map((tag, index) => (
                              <span key={index} className="tag">
                                <FaTag className="me-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                          <Button 
                            variant="primary" 
                            className="w-100 read-more-btn mt-auto"
                            onClick={() => window.location.href = `/${post.slug}`}
                          >
                            Read Article
                          </Button>
                        </Card.Body>
                      </Card>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </motion.div>
          </AnimatePresence>

          {filteredPosts.length === 0 && (
            <div className="text-center py-5">
              <h3>No articles found</h3>
              <p className="text-muted">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </motion.div>
      </Container>
    </section>
  );
};

export default Blog; 