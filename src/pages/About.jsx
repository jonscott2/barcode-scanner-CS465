import { Link } from 'react-router-dom';
import './About.css';

export default function About() {
  const stats = [
    { number: '$2,000', label: 'Annual Food Waste Per Household', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop' },
    { number: '$408B', label: 'Annual Food Waste in the U.S.', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop' },
    { number: '40%', label: 'Of Food Produced Goes to Waste', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop' }
  ];

  const features = [
    {
      icon: '📱',
      title: 'Scan & Track',
      description: 'Instantly scan barcodes and track all your food items',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=200&fit=crop'
    },
    {
      icon: '⏰',
      title: 'Expiration Alerts',
      description: 'Get notified before items expire to reduce waste',
      image: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=300&h=200&fit=crop'
    },
    {
      icon: '🍳',
      title: 'Recipe Discovery',
      description: 'Find recipes based on what you have available',
      image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=300&h=200&fit=crop'
    }
  ];

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    const element = document.querySelector(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="about-page">
      {/* Navigation Bar */}
      <nav className="landing-nav">
        <div className="landing-nav-container">
          <Link to="/" className="landing-nav-logo">
            Barcode Scanner
          </Link>
          <div className="landing-nav-links">
            <Link to="/" className="landing-nav-link">
              Home
            </Link>
            <a href="/#features" onClick={(e) => { e.preventDefault(); window.location.href = '/#features'; }} className="landing-nav-link">
              Features
            </a>
            <a href="/#how-it-works" onClick={(e) => { e.preventDefault(); window.location.href = '/#how-it-works'; }} className="landing-nav-link">
              How It Works
            </a>
            <a href="/#team" onClick={(e) => { e.preventDefault(); window.location.href = '/#team'; }} className="landing-nav-link">
              Team
            </a>
            <Link to="/about" className="landing-nav-link active">
              About
            </Link>
            <Link to="/contact" className="landing-nav-link">
              Contact
            </Link>
            <Link to="/faq" className="landing-nav-link">
              FAQ
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section with Food Image */}
      <section className="about-hero">
        <div className="about-hero-image">
          <img 
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=600&fit=crop" 
            alt="Fresh food ingredients"
            className="hero-food-image"
          />
          <div className="about-hero-overlay"></div>
        </div>
        <div className="about-hero-content">
          <h1 className="about-hero-title">About Our Mission</h1>
          <p className="about-hero-subtitle">
            Fighting food waste, one scan at a time
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="about-container">
        {/* Problem Statement with Image */}
        <section className="about-section about-section-split">
          <div className="about-section-image">
            <img 
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=400&fit=crop" 
              alt="Food waste problem"
              className="section-food-image"
            />
          </div>
          <div className="about-section-content">
            <h2 className="about-section-title">The Problem</h2>
            <p className="about-paragraph">
              The average American throws away around <strong>$2,000</strong> of edible food every year. 
              Nationally, <strong>$408 billion</strong> in groceries is wasted annually, impacting both 
              household budgets and the environment.
            </p>
            <p className="about-paragraph">
              Our app helps you track food items, monitor expiration dates, and discover recipes to 
              reduce waste and save money.
            </p>
          </div>
        </section>

        {/* Statistics Section with Food Images */}
        <section className="about-stats-section">
          <h2 className="about-section-title">Food Waste by the Numbers</h2>
          <div className="about-stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="about-stat-card">
                <div className="about-stat-image">
                  <img src={stat.image} alt={stat.label} />
                </div>
                <div className="about-stat-number">{stat.number}</div>
                <div className="about-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section with Images */}
        <section className="about-section">
          <h2 className="about-section-title">How We Help</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-item">
                <div className="feature-item-image">
                  <img src={feature.image} alt={feature.title} />
                </div>
                <div className="feature-item-content">
                  <div className="feature-item-icon">{feature.icon}</div>
                  <h3 className="feature-item-title">{feature.title}</h3>
                  <p className="feature-item-description">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Call to Action with Food Image */}
        <section className="about-cta">
          <div className="about-cta-image">
            <img 
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=400&fit=crop" 
              alt="Delicious food"
              className="cta-food-image"
            />
            <div className="about-cta-overlay"></div>
          </div>
          <div className="about-cta-content">
            <h2 className="about-cta-title">Join the Fight Against Food Waste</h2>
            <p className="about-cta-text">
              Start tracking your food items today and make a difference
            </p>
            <div className="about-cta-buttons">
              <Link to="/login" className="about-cta-button primary">
                Get Started
              </Link>
              <Link to="/" className="about-cta-button secondary">
                Learn More
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
