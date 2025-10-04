import React from 'react';
import { Phone, Mail, MapPin, Globe, Building } from 'lucide-react';
import './AboutPage.css';

const AboutPage: React.FC = () => {
  return (
    <div className="about-page">
      <div className="container">
        <div className="page-header">
          <h1>About DM Brands</h1>
          <p>Your trusted partner in premium lifestyle brands</p>
        </div>

        <div className="about-content">
          {/* Contact Information Column */}
          <div className="contact-section">
            <h2>Contact Information</h2>
            
            <div className="contact-card">
              <div className="contact-item">
                <Building className="icon" />
                <div>
                  <h3>Registered Office</h3>
                  <p>DM Brands Limited<br />
                  79 Waterworks Road<br />
                  Worcester<br />
                  WR1 3EZ<br />
                  United Kingdom</p>
                </div>
              </div>

              <div className="contact-item">
                <Phone className="icon" />
                <div>
                  <h3>Phone</h3>
                  <p>+44 (0) 1905 616 006</p>
                </div>
              </div>

              <div className="contact-item">
                <Mail className="icon" />
                <div>
                  <h3>Email</h3>
                  <p>
                    <a href="mailto:sales@dmbrands.co.uk">sales@dmbrands.co.uk</a>
                  </p>
                </div>
              </div>

              <div className="contact-item">
                <Globe className="icon" />
                <div>
                  <h3>Website</h3>
                  <p><a href="https://www.dmbrands.co.uk" target="_blank" rel="noopener noreferrer">www.dmbrands.co.uk</a></p>
                </div>
              </div>
            </div>

            <div className="company-details">
              <h3>Company Details</h3>
              <ul>
                <li><strong>Company Number:</strong> 07517652</li>
                <li><strong>Incorporated:</strong> 15 February 2011</li>
                <li><strong>VAT Number:</strong> GB 123 4567 89</li>
                <li><strong>SIC Code:</strong> 46490 - Wholesale of other household goods</li>
              </ul>
            </div>
          </div>

          {/* Company Information Column */}
          <div className="company-section">
            <h2>Our Story</h2>
            
            <div className="company-description">
              <p>
                DM Brands Limited is a leading distributor of premium lifestyle and homeware brands 
                in the United Kingdom. Since our incorporation in 2011, we have built strong partnerships 
                with carefully selected European brands, bringing their exceptional products to the UK market.
              </p>

              <p>
                Based in Worcester, we specialise in the wholesale distribution of 
                high-quality household goods, with a focus on design-led products that enhance modern living. 
                Our portfolio includes renowned brands from Denmark, Germany, and the Netherlands, 
                each chosen for their commitment to quality, innovation, and sustainable practices.
              </p>

              <h3>What We Do</h3>
              <p>
                We work closely with independent retailers, department stores, and online platforms 
                across the UK, providing them with access to unique, high-quality products that 
                stand out in the marketplace. Our services include:
              </p>

              <ul>
                <li>Exclusive UK distribution rights for select European brands</li>
                <li>Comprehensive product catalogues and marketing support</li>
                <li>Efficient logistics and inventory management</li>
                <li>Trade show representation and brand promotion</li>
                <li>Dedicated customer service and account management</li>
              </ul>

              <h3>Our Values</h3>
              <div className="values-grid">
                <div className="value-item">
                  <h4>Quality</h4>
                  <p>We partner only with brands that meet our high standards for craftsmanship and design</p>
                </div>
                <div className="value-item">
                  <h4>Sustainability</h4>
                  <p>Supporting brands that prioritise eco-friendly materials and responsible manufacturing</p>
                </div>
                <div className="value-item">
                  <h4>Innovation</h4>
                  <p>Bringing fresh, creative products that inspire and delight consumers</p>
                </div>
                <div className="value-item">
                  <h4>Partnership</h4>
                  <p>Building long-term relationships with both our brands and retail partners</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;