import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'How do I scan a barcode?',
      answer: 'You can scan barcodes in two ways: 1) Use the camera scanner by clicking the "Use webcam" tab and pointing your camera at a barcode, or 2) Upload an image containing a barcode using the "Use image" tab. Make sure to allow camera permissions if using the webcam.'
    },
    {
      question: 'Do I need to create an account?',
      answer: 'No, you can use the app as a guest. However, creating an account allows you to sync your scan history across devices and access your data from anywhere. Guest accounts store data locally in your browser.'
    },
    {
      question: 'How does the expiration tracking work?',
      answer: 'After scanning a product, you can set a custom expiration date. The app will track these dates and can notify you before items expire. This feature helps reduce food waste by reminding you to use items before they go bad.'
    },
    {
      question: 'Can I access my scans on multiple devices?',
      answer: 'Yes, if you create an account, your scans are synced to the cloud and can be accessed from any device where you\'re logged in. Guest accounts are stored locally and only available on the device where they were created.'
    },
    {
      question: 'What happens if I\'m offline?',
      answer: 'The app works offline! Scans made while offline are saved locally and will automatically sync to the cloud when you come back online. This ensures you never lose your scan history.'
    },
    {
      question: 'How do I generate recipes?',
      answer: 'The recipe feature analyzes your scanned ingredients and suggests recipes you can make with what you have. Click on the Recipes page and use the "Generate Recipes" button to get suggestions based on your ingredient list.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we use Firebase for secure authentication and data storage. All your data is encrypted and stored securely. We respect your privacy and only use your data to provide the app\'s functionality.'
    },
    {
      question: 'What barcode formats are supported?',
      answer: 'The app supports many common barcode formats including UPC, EAN, Code 128, QR codes, and more. You can configure which formats to scan in the Settings page. By default, all supported formats are enabled.'
    },
    {
      question: 'How long is my session active?',
      answer: 'For security, your session will automatically expire after 10 minutes of inactivity. You\'ll receive a warning 2 minutes before logout. Simply interact with the app to keep your session active.'
    },
    {
      question: 'Can I delete my scan history?',
      answer: 'Yes, you can manage your scan history from the History page. Individual scans can be removed, and you can clear your entire history if needed.'
    }
  ];

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <div className="faq-container">
        <div className="faq-header">
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about our barcode scanner app</p>
        </div>

        <div className="faq-content">
          {faqs.map((faq, index) => (
            <div key={index} className={`faq-item ${openIndex === index ? 'open' : ''}`}>
              <button
                className="faq-question"
                onClick={() => toggleFaq(index)}
                aria-expanded={openIndex === index}
              >
                <span>{faq.question}</span>
                <svg
                  width="1.25em"
                  height="1.25em"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  className={`faq-icon ${openIndex === index ? 'rotated' : ''}`}
                >
                  <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="faq-footer">
          <p>Still have questions?</p>
          <Link to="/contact" className="btn btn-primary">
            Contact Us
          </Link>
          <Link to="/" className="btn btn-secondary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
