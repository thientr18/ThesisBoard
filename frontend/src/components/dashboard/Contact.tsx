import React from 'react';
import { theme } from '../../utils/theme';
import { MailOutlined, PhoneOutlined, EnvironmentOutlined, UserOutlined } from '@ant-design/icons';

const contactCardStyle: React.CSSProperties = {
  background: '#ffffff',
  border: `1px solid ${theme.colors.secondary}22`,
  borderRadius: 8,
  padding: 16,
  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
  height: '100%',
};

const iconStyle: React.CSSProperties = {
  fontSize: 14,
  color: theme.colors.primary,
  marginRight: 6,
};

const labelStyle: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  color: '#888',
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.3px',
  marginBottom: 3,
  display: 'flex',
  alignItems: 'center',
};

const valueStyle: React.CSSProperties = {
  fontFamily: theme.fonts.body,
  color: '#333',
  fontSize: 13,
  marginBottom: 10,
  lineHeight: 1.4,
};

const linkStyle: React.CSSProperties = {
  color: theme.colors.primary,
  textDecoration: 'none',
};

export default function Contact() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <h2 
          style={{ 
            fontFamily: theme.fonts.heading,
            color: theme.colors.secondary,
            fontSize: 26,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Contact Us
        </h2>
        <p 
          style={{ 
            fontFamily: theme.fonts.body,
            color: '#666',
            fontSize: 14,
            maxWidth: 650,
            margin: '0 auto',
            lineHeight: 1.5,
          }}
        >
          This thesis project is developed by <strong>Tran Thien</strong> under the supervision of 
          <strong> Dr. Le Thanh Son</strong> at the School of Computer Science and Engineering, 
          Vietnam National University - International University.
        </p>
      </div>

      {/* Main Grid: Student, CSE Department, and Map in one row */}
      <div 
        style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 16,
        }}
      >
        {/* Student Contact */}
        <div style={contactCardStyle}>
          <h3 
            style={{ 
              fontFamily: theme.fonts.heading,
              color: theme.colors.secondary,
              fontSize: 16,
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              fontWeight: 600,
            }}
          >
            <UserOutlined style={{ fontSize: 18, marginRight: 8, color: theme.colors.primary }} />
            Student Developer
          </h3>
          
          <div style={{ marginBottom: 8 }}>
            <div style={labelStyle}>Name</div>
            <div style={valueStyle}>Tran Thien</div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <div style={labelStyle}>
              <PhoneOutlined style={iconStyle} />
              Phone
            </div>
            <div style={valueStyle}>
              <a href="tel:+84971863707" style={linkStyle}>0971 863 707</a>
            </div>
          </div>

          <div style={{ marginBottom: 0 }}>
            <div style={labelStyle}>
              <MailOutlined style={iconStyle} />
              Email
            </div>
            <div style={{ ...valueStyle, marginBottom: 0 }}>
              <a href="mailto:tranthien1882003@gmail.com" style={linkStyle}>
                tranthien1882003@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* CSE Department Contact */}
        <div style={contactCardStyle}>
          <h3 
            style={{ 
              fontFamily: theme.fonts.heading,
              color: theme.colors.secondary,
              fontSize: 16,
              marginBottom: 12,
              fontWeight: 600,
            }}
          >
            CSE Department
          </h3>

          <div style={{ marginBottom: 8 }}>
            <div style={labelStyle}>
              <EnvironmentOutlined style={iconStyle} />
              Address
            </div>
            <div style={valueStyle}>
              VNUHCM Township, Quarter 33<br />
              Linh Xuan Ward, Thu Duc City
            </div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <div style={labelStyle}>
              <PhoneOutlined style={iconStyle} />
              Contact
            </div>
            <div style={valueStyle}>
              <a href="tel:+842837244270" style={linkStyle}>(028) 3724 4270</a> ext. 3232
            </div>
          </div>

          <div style={{ marginBottom: 0 }}>
            <div style={labelStyle}>
              <MailOutlined style={iconStyle} />
              Email
            </div>
            <div style={{ ...valueStyle, marginBottom: 0 }}>
              <a href="mailto:cse@hcmiu.edu.vn" style={linkStyle}>
                cse@hcmiu.edu.vn
              </a>
            </div>
          </div>
        </div>

        {/* Google Map */}
        <div 
          style={{ 
            background: '#ffffff',
            border: `1px solid ${theme.colors.secondary}22`,
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
            minHeight: 250,
          }}
        >
          <iframe
            title="Vietnam National University - International University Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.3177799369596!2d106.79932107570674!3d10.877170689280378!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3174d8a415a9d221%3A0x550c2b41569376f9!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBRdeG7kWMgVOG6vSAtIMSQ4bqhaSBo4buNYyBRdeG7kWMgZ2lhIFRQLkhDTQ!5e0!3m2!1sen!2s!4v1731587500000!5m2!1sen!2s"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}