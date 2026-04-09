import { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import '../styles/App.css';

const socialLinks = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com' },
  { label: 'Instagram', href: 'https://www.instagram.com' },
  { label: 'GitHub', href: 'https://www.github.com' },
  { label: 'Facebook', href: 'https://www.facebook.com' },
];

function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const { name, email, subject, message } = form;
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      '',
      message,
    ].join('\n');

    const mailto = `mailto:support@healthfitnesspro.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  };

  return (
    <>
      <Navbar />

      <main className="contact-page">
        <section className="contact-section">
          <div className="contact-hero">
            <p className="tagline">Contact Us</p>
            <h1>Let us help you stay on track</h1>
            <p className="contact-subtitle">
              Send us a message for support, account help, or product feedback.
            </p>
          </div>

          <div className="contact-layout">
            <section className="contact-form-panel">
              <h2>Send a Message</h2>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="contact-form-grid">
                  <div className="contact-field">
                    <label htmlFor="name">Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="contact-field">
                    <label htmlFor="email">Email</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="contact-field">
                  <label htmlFor="subject">Subject</label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    value={form.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="contact-field">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={8}
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button type="submit" className="btn">Send Email</button>
              </form>
            </section>
          </div>

          <article className="contact-card contact-social-card">
            <h2>Social Media</h2>
            <ul className="contact-social-list">
              {socialLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href} target="_blank" rel="noreferrer">{item.label}</a>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default ContactPage;
