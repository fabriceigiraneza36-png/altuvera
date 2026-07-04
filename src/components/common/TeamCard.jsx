import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiAward,
  FiCheck,
  FiInstagram,
  FiLinkedin,
  FiMail,
  FiMapPin,
  FiTwitter,
  FiUsers,
} from 'react-icons/fi';

const TeamCard = ({ member }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  const expertise = Array.isArray(member?.expertise) ? member.expertise : [];
  const languages = Array.isArray(member?.languages) ? member.languages : [];
  const initials = member?.name
    ? member.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const socials = [
    member?.linkedin_url && { href: member.linkedin_url, icon: <FiLinkedin size={14} />, label: 'LinkedIn' },
    member?.twitter_url && { href: member.twitter_url, icon: <FiTwitter size={14} />, label: 'Twitter' },
    member?.instagram_url && { href: member.instagram_url, icon: <FiInstagram size={14} />, label: 'Instagram' },
    member?.email && { href: `mailto:${member.email}`, icon: <FiMail size={14} />, label: 'Email' },
  ].filter(Boolean);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -6, scale: 1.01 }}
      style={{
        position: 'relative',
        height: '100%',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fffb 100%)',
        border: '1.5px solid #d1fae5',
        borderRadius: 24,
        padding: '28px 22px 22px',
        boxShadow: '0 10px 32px rgba(5, 150, 105, 0.08)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at top right, rgba(16, 185, 129, 0.10), transparent 48%)',
          pointerEvents: 'none',
        }}
      />

      {member?.is_featured && (
        <div
          style={{
            position: 'absolute', top: 14, right: 14,
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '5px 10px', borderRadius: 999,
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            color: '#92400e', fontSize: 10.5, fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '0.05em',
            border: '1px solid #fde68a',
          }}
        >
          <FiAward size={10} /> Featured
        </div>
      )}

      <div style={{ position: 'relative', width: 112, height: 112, marginBottom: 16 }}>
        <div
          style={{
            width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden',
            border: '4px solid #d1fae5', boxShadow: '0 0 0 6px rgba(5, 150, 105, 0.08)',
            background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}
        >
          {!imgLoaded && !imgErr && (
            <div
              style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(110deg, #d1fae5 8%, #ecfdf5 18%, #d1fae5 33%)',
                backgroundSize: '200% 100%',
                animation: 'sv-shimmer 1.4s linear infinite',
              }}
            />
          )}

          {imgErr || !member?.image_url ? (
            <div style={{ fontSize: 28, fontWeight: 800, color: '#059669', fontFamily: 'Playfair Display, serif' }}>
              {initials}
            </div>
          ) : (
            <img
              src={member.image_url}
              alt={member.name}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => {
                setImgErr(true);
                setImgLoaded(true);
              }}
              style={{
                width: '100%', height: '100%', objectFit: 'cover', opacity: imgLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }}
            />
          )}
        </div>

        <div
          style={{
            position: 'absolute', bottom: 4, right: 4,
            width: 16, height: 16, borderRadius: '50%',
            border: '3px solid white',
            backgroundColor: member?.is_active === false ? '#9ca3af' : '#10b981',
            boxShadow: '0 2px 8px rgba(0,0,0,0.16)',
          }}
        />
      </div>

      <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, color: '#064e3b', marginBottom: 5, lineHeight: 1.25 }}>
        {member?.name || 'Team Member'}
      </h3>

      <p style={{ fontSize: 14, fontWeight: 700, color: '#059669', marginBottom: 8 }}>
        {member?.role || 'Travel Specialist'}
      </p>

      {member?.department && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: '#f0fdf4', border: '1px solid #d1fae5', color: '#047857', fontSize: 11.5, fontWeight: 700, marginBottom: 12 }}>
          <FiUsers size={11} /> {member.department}
        </span>
      )}

      {member?.bio && (
        <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#6b7280', marginBottom: 12, minHeight: 64 }}>
          {member.bio}
        </p>
      )}

      {expertise.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
          {expertise.slice(0, 3).map((item, i) => (
            <span key={`${item}-${i}`} style={{ padding: '4px 9px', borderRadius: 999, background: '#ecfdf5', border: '1px solid #d1fae5', color: '#059669', fontSize: 10.5, fontWeight: 700 }}>
              {item}
            </span>
          ))}
          {expertise.length > 3 && (
            <span style={{ padding: '4px 9px', borderRadius: 999, background: '#f3f4f6', color: '#6b7280', fontSize: 10.5, fontWeight: 700 }}>
              +{expertise.length - 3}
            </span>
          )}
        </div>
      )}

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#64748b', fontSize: 12, marginBottom: 14 }}>
        <FiMapPin size={12} /> {member?.location || 'East Africa'}
      </div>

      {languages.length > 0 && (
        <div style={{ fontSize: 11.5, color: '#64748b', marginBottom: 14 }}>
          {languages.slice(0, 3).join(' • ')}
        </div>
      )}

      {socials.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 8, marginTop: 'auto', paddingTop: 12, borderTop: '1px solid #d1fae5', width: '100%' }}>
          {socials.map((social, i) => (
            <a
              key={`${social.label}-${i}`}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              aria-label={social.label}
              style={{
                width: 34, height: 34, borderRadius: '50%', border: '1.5px solid #a7f3d0',
                background: '#f0fdf4', color: '#047857', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'transform 0.2s ease, background 0.2s ease, color 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #059669, #065f46)';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = '#f0fdf4';
                e.currentTarget.style.color = '#047857';
              }}
            >
              {social.icon}
            </a>
          ))}
        </div>
      )}
    </motion.article>
  );
};

export default TeamCard;
