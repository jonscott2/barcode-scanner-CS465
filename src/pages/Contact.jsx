import { Link } from 'react-router-dom';

export default function Contact() {
  const teamMembers = [
    {
      name: 'Samuel Kwibe',
      role: 'Front End & Back End Developer',
      email: 'samual.kwibe@snhu.edu'
    },
    {
      name: 'Jon Scott',
      role: 'Back End Developer',
      email: 'jonathan.scott6@snhu.edu'
    },
    {
      name: 'Jonathan Corwin',
      role: 'Design & Testing',
      email: 'jonathan.corwin@snhu.edu'
    },
    {
      name: 'Isaac Akhtar Zada',
      role: 'Front End Developer',
      email: 'isacc.akhtarzada@snhu.edu'
    },
    {
      name: 'Elena Guzman',
      role: 'Website Design',
      email: 'elena.guzman@snhu.edu'
    }
  ];

  return (
    <div className="contact-page">
      <div className="contact-container">
        <div className="contact-header">
          <h1>Contact Us</h1>
          <p>Get in touch with our team for inquiries, support, or feedback</p>
        </div>

        <div className="contact-content">
          <section className="contact-section">
            <h2>Project Team</h2>
            <p className="contact-intro">
              This is a CS465 project by a team of students. For inquiries, please contact any team member below.
            </p>
            <div className="team-contact-grid">
              {teamMembers.map((member, index) => (
                <div key={index} className="team-contact-card">
                  <h3>{member.name}</h3>
                  <p className="team-role">{member.role}</p>
                  <a href={`mailto:${member.email}`} className="team-email">
                    📧 {member.email}
                  </a>
                </div>
              ))}
            </div>
          </section>

          <section className="contact-section">
            <h2>Support</h2>
            <p>
              For technical support or feature requests, please email one of our team members listed above.
              We'll do our best to respond to your inquiries in a timely manner.
            </p>
          </section>

          <section className="contact-section">
            <h2>Back to Home</h2>
            <Link to="/" className="btn btn-primary">
              Return to Homepage
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
