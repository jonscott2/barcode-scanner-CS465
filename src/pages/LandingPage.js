import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider.jsx';
import './LandingPage.css';

export default function LandingPage() {
  const [imageLoaded, setImageLoaded] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading delay for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const teamMembers = [
    {
      name: 'Samuel Kwibe',
      role: 'Front End & Back End Developer',
      description: 'API integration & database management',
      email: 'samual.kwibe@snhu.edu',
      image: '../assets/team/samuel-kwibe.jpg'
    },
    {
      name: 'Jon Scott',
      role: 'Back End Developer',
      description: 'UPC API & Recipe API integration',
      email: 'jonathan.scott6@snhu.edu',
      image: '../assets/team/jon-scott.jpg'
    },
    {
      name: 'Jonathan Corwin',
      role: 'Design & Testing',
      description: 'UI/UX design & test implementation',
      email: 'jonathan.corwin@snhu.edu',
      image: '../assets/team/jonathan-corwin.jpg'
    },
    {
      name: 'Isaac Akhtar Zada',
      role: 'Front End Developer',
      description: 'Timer features & mobile development',
      email: 'isacc.akhtarzada@snhu.edu',
      image: '../assets/team/isaac-zada.jpg'
    },
    {
      name: 'Elena Guzman',
      role: 'Website Design',
      description: 'Landing page & visual design',
      email: 'elena.guzman@snhu.edu',
      image: '../assets/team/elena-guzman.jpg'
    }
  ];

  const features = [
    {
      icon: '📷',
      title: 'Instant Scanning',
      description:
        "Scan any barcode with your phone's camera. Get product information instantly - no typing, no searching.",
      color: 'var(--food-mint)',
      image:
        'https://images.unsplash.com/photo-1583451132570-d2912012473f?w=900&h=900&fit=crop&auto=format',
      paragraph: 'Point and scan—works instantly in any lighting condition.'
    },
    {
      icon: '📦',
      title: 'Product Details',
      description:
        "See product name, brand, description, and images automatically. Know exactly what you're buying.",
      color: 'var(--food-green)',
      image:
        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=900&h=900&fit=crop&auto=format',
      paragraph:
        'Full ingredient lists, nutrition facts, and allergen warnings instantly displayed.'
    },
    {
      icon: '⏰',
      title: 'Expiration Tracking',
      description:
        'Set custom expiration dates and get notified before items expire. Never waste food again.',
      color: 'var(--food-mint)',
      image:
        'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=900&h=900&fit=crop&auto=format',
      paragraph: 'Get notified before items expire and reduce food waste automatically.'
    },
    {
      icon: '☁️',
      title: 'Cloud Sync',
      description:
        'All your scans are saved securely in the cloud. Access them from any device, anytime.',
      color: 'var(--food-green)',
      image:
        'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=900&h=900&fit=crop&auto=format',
      paragraph: 'Sync across all devices with secure cloud storage and encryption.'
    },
    {
      icon: '📚',
      title: 'Smart History',
      description:
        'Search and filter your scan history. Find items quickly with powerful search tools.',
      color: 'var(--food-mint)',
      image:
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&h=900&fit=crop&auto=format',
      paragraph: 'Search by name, brand, or date to find any item in your history instantly.'
    },
    {
      icon: '🍳',
      title: 'Recipe Discovery',
      description:
        'Get recipe suggestions based on your scanned ingredients. Cook amazing meals with what you have.',
      color: 'var(--food-green)',
      image:
        'https://images.unsplash.com/photo-1512621776951-a5739dfd84f4?w=900&h=900&fit=crop&auto=format',
      paragraph: 'Discover recipes based on your scanned ingredients and reduce waste.'
    }
  ];

  const stats = [
    {
      number: '10K+',
      label: 'Products Scanned',
      icon: '📊',
      image:
        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=800&fit=crop&auto=format',
      description: 'Thousands of products from your favorite brands at your fingertips.'
    },
    {
      number: '500+',
      label: 'Active Users',
      icon: '👥',
      image:
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=800&fit=crop&auto=format',
      description: 'Join a community reducing food waste every day.'
    },
    {
      number: '99%',
      label: 'Accuracy Rate',
      icon: '✅',
      image:
        'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=800&fit=crop&auto=format',
      description: 'Industry-leading scanning accuracy you can trust.'
    },
    {
      number: '24/7',
      label: 'Available',
      icon: '🌐',
      image:
        'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&h=800&fit=crop&auto=format',
      description: 'Access your inventory anywhere, anytime.'
    }
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Scan Barcode',
      description: 'Point your camera at any product barcode or upload an image',
      icon: '📸',
      image:
        'https://images.unsplash.com/photo-1583451132570-d2912012473f?w=900&h=900&fit=crop&auto=format',
      paragraph: 'Point and scan—works instantly in any lighting.'
    },
    {
      step: '2',
      title: 'Get Info',
      description: 'Instantly receive product details, ingredients, and nutritional information',
      icon: '📋',
      image:
        'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=900&h=900&fit=crop&auto=format',
      paragraph: 'Complete product details including ingredients and nutrition in seconds.'
    },
    {
      step: '3',
      title: 'Track & Manage',
      description: 'Set expiration dates, view history, and discover recipes',
      icon: '📱',
      image:
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=900&h=900&fit=crop&auto=format',
      paragraph: 'Organize items, track expiration dates, and discover recipes from your inventory.'
    }
  ];

  const handleImageLoad = name => {
    setImageLoaded(prev => ({ ...prev, [name]: true }));
  };

  const handleImageError = (e, member) => {
    e.target.onerror = null; // Prevent infinite loop
    // Use green-themed avatar fallback
    const roleColor = member.role.split(' ')[0].toLowerCase();
    const colorMap = {
      back: '2d5016', // food-green
      design: '7ed957', // food-mint
      front: '52b788', // food-herb
      website: '4a702c' // food-green-light
    };

    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=200&background=${colorMap[roleColor] || '2d5016'}&color=fff&bold=true&font-size=0.5`;
    handleImageLoad(member.name);
  };

  // Generic image error handler to prevent console errors
  const handleGenericImageError = e => {
    e.target.onerror = null; // Prevent infinite loop
    // Hide broken images or use a placeholder
    e.target.style.display = 'none';
    // Optionally add a placeholder div
    if (!e.target.nextElementSibling?.classList.contains('image-placeholder')) {
      const placeholder = document.createElement('div');
      placeholder.className = 'image-placeholder';
      placeholder.style.cssText = `
        width: 100%;
        height: 100%;
        background: linear-gradient(135deg, var(--food-green) 0%, var(--food-mint) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 2rem;
      `;
      placeholder.textContent = '📷';
      e.target.parentNode?.appendChild(placeholder);
    }
  };

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    const element = document.querySelector(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleGetStarted = () => {
    if (user) {
      navigate('/app/home');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="landing-page">
      {/* Navigation Bar */}
      <nav className="landing-nav">
        <div className="landing-nav-container">
          <Link to="/" className="landing-nav-logo">
            Sifts
          </Link>
          <div className="landing-nav-links">
            <a href="#home" onClick={e => handleNavClick(e, '#home')} className="landing-nav-link">
              Home
            </a>
            <a
              href="#features"
              onClick={e => handleNavClick(e, '#features')}
              className="landing-nav-link"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={e => handleNavClick(e, '#how-it-works')}
              className="landing-nav-link"
            >
              How It Works
            </a>
            <a href="#team" onClick={e => handleNavClick(e, '#team')} className="landing-nav-link">
              Team
            </a>
            <Link to="/about" className="landing-nav-link">
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

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">Never Waste Food Again</h1>
          <p className="hero-subtitle">
            Track your groceries, manage expiration dates, discover recipes, and keep your kitchen
            organized with smart barcode scanning.
          </p>
          <div className="cta-buttons">
            <button onClick={handleGetStarted} className="cta-button primary">
              Get Started
            </button>
            <Link to="/signup" className="cta-button secondary">
              Sign Up Free
            </Link>
          </div>
        </div>
        <div className="scroll-indicator">
          <div className="scroll-arrow"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-image-wrapper">
                  <img
                    src={stat.image}
                    alt={stat.label}
                    className="stat-image"
                    onError={handleGenericImageError}
                    loading="lazy"
                  />
                </div>
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
                <p className="stat-description">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works">
        <div className="how-it-works-container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Get started in three simple steps</p>
          <div className="steps-grid">
            {howItWorks.map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-image-wrapper">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="step-image"
                    loading="lazy"
                    onError={handleGenericImageError}
                  />
                </div>
                <div className="step-number">{step.step}</div>
                <div className="step-icon">{step.icon}</div>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-description">{step.description}</p>
                <p className="step-paragraph">{step.paragraph}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="features-container">
          <h2 className="section-title">Everything You Need</h2>
          <p className="section-subtitle">
            Smart features to help you manage your kitchen and reduce food waste
          </p>

          <div className="features-intro">
            <p className="features-paragraph">
              Our comprehensive barcode scanning solution empowers you to take control of your
              kitchen inventory. With advanced technology and intuitive design, you can effortlessly
              track products, monitor expiration dates, and discover new recipes based on what you
              have. Say goodbye to wasted food and hello to a smarter, more organized kitchen
              experience.
            </p>
            <p className="features-paragraph">
              Whether you're a busy parent managing a household, a health-conscious individual
              tracking nutrition, or someone passionate about reducing food waste, our app provides
              the tools you need to make informed decisions about the products you buy and consume.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-image-wrapper">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="feature-image"
                    onError={handleGenericImageError}
                    loading="lazy"
                  />
                </div>
                <div className="feature-icon" style={{ color: feature.color }}>
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <p className="feature-paragraph">{feature.paragraph}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-choose-us" className="why-choose-us">
        <div className="why-choose-us-container">
          <h2 className="section-title">Why Choose Our App?</h2>
          <p className="section-subtitle">
            Discover what makes our barcode scanner the best choice for managing your kitchen
          </p>

          <div className="why-choose-hero-image">
            <img
              src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=500&fit=crop"
              alt="People cooking together"
              className="why-choose-image"
            />
          </div>

          <div className="why-choose-content">
            <div className="why-choose-text">
              <p className="why-choose-paragraph">
                In today's fast-paced world, managing household inventory and reducing food waste
                has never been more important. Our barcode scanner app combines cutting-edge
                technology with user-friendly design to provide you with a seamless experience. We
                understand that every second counts, which is why we've built an app that delivers
                instant results with just a simple scan.
              </p>
              <p className="why-choose-paragraph">
                Our platform integrates with powerful APIs to provide comprehensive product
                information, including detailed ingredient lists, nutritional facts, and allergen
                warnings. This means you can make informed decisions about what you're buying and
                consuming, helping you maintain a healthier lifestyle while being mindful of your
                dietary restrictions and preferences.
              </p>
              <p className="why-choose-paragraph">
                Beyond just scanning, our app offers intelligent features like expiration tracking
                and recipe suggestions. By setting custom expiration dates for your products, you'll
                receive timely notifications that help prevent food waste. Our recipe discovery
                feature analyzes your scanned ingredients and suggests delicious meals you can
                prepare, making meal planning easier and more creative.
              </p>
              <p className="why-choose-paragraph">
                Security and privacy are at the core of our design. All your data is securely stored
                in the cloud using industry-standard encryption, ensuring your personal information
                and scan history remain private and protected. You can access your data from any
                device, anytime, knowing that your information is safe and secure.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="team">
        <div className="team-container">
          <h2 className="team-title">Meet Our Team</h2>
          <p className="team-subtitle">The talented developers behind this project</p>

          <div className="team-grid">
            {teamMembers.map((member, index) => (
              <div key={index} className="team-card">
                <div className="team-image-wrapper">
                  {!imageLoaded[member.name] && (
                    <div
                      className="skeleton"
                      style={{ width: '100%', height: '100%', borderRadius: '50%' }}
                    ></div>
                  )}
                  <img
                    src={member.image}
                    alt={member.name}
                    className="team-image"
                    loading="lazy"
                    onLoad={() => handleImageLoad(member.name)}
                    onError={e => handleImageError(e, member)}
                    style={{
                      opacity: imageLoaded[member.name] ? 1 : 0,
                      transition: 'opacity 0.3s ease'
                    }}
                  />
                </div>
                <h3 className="team-member-name">{member.name}</h3>
                <p className="team-member-role">{member.role}</p>
                <p className="team-member-description">{member.description}</p>
                <a href={`mailto:${member.email}`} className="team-member-email">
                  📧 {member.email}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-main">
            <div className="footer-section">
              <h3 className="footer-heading">About Our App</h3>
              <p className="footer-text">
                Sifts is a comprehensive solution designed to help you manage your
                kitchen inventory, reduce food waste, and make informed decisions about the products
                you consume. Built with modern web technologies and powered by Firebase, we provide
                a secure, fast, and user-friendly experience.
              </p>
            </div>

            <div className="footer-section">
              <h3 className="footer-heading">Quick Links</h3>
              <nav className="footer-nav">
                <a href="#home" onClick={e => handleNavClick(e, '#home')}>
                  Home
                </a>
                <a href="#features" onClick={e => handleNavClick(e, '#features')}>
                  Features
                </a>
                <a href="#how-it-works" onClick={e => handleNavClick(e, '#how-it-works')}>
                  How It Works
                </a>
                <a href="#team" onClick={e => handleNavClick(e, '#team')}>
                  Team
                </a>
                <Link to="/about">About</Link>
                <Link to="/contact">Contact</Link>
                <Link to="/faq">FAQ</Link>
              </nav>
            </div>

            <div className="footer-section">
              <h3 className="footer-heading">Get Started</h3>
              <p className="footer-text">
                Ready to transform your kitchen management experience? Join thousands of users who
                are already benefiting from our smart barcode scanning technology. Start tracking
                your products today and discover a new way to manage your kitchen.
              </p>
              <div className="footer-cta">
                <button onClick={handleGetStarted} className="footer-button">
                  Get Started Now
                </button>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-title">Sifts - Smart Food & Product Tracking</p>
            <p className="footer-subtitle">
              Built with ❤️ for CS465 | Powered by Firebase & Modern Web Technologies
            </p>
            <div className="footer-copyright">
              © {new Date().getFullYear()} Sifts. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
