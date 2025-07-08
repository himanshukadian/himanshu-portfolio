import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { resumeData } from '../data/resume';

const SEO = ({ 
  title, 
  description, 
  image, 
  type = 'website',
  author = resumeData.name,
  keywords = [],
  noindex = false 
}) => {
  const location = useLocation();
  const siteUrl = process.env.REACT_APP_SITE_URL || 'https://himanshuchaudhary.dev';
  const currentUrl = `${siteUrl}${location.pathname}`;
  
  // Default values using resume data
  const siteTitle = `${resumeData.name} - ${resumeData.title}`;
  const defaultDescription = resumeData.summary;
  const defaultImage = `${siteUrl}/og-image.jpg`;
  const defaultKeywords = [
    resumeData.name,
    resumeData.title,
    ...resumeData.skills.languages,
    ...resumeData.skills.technologies.slice(0, 5), // First 5 technologies
    ...resumeData.experience.map(exp => exp.company), // Company names
    'Portfolio',
    'Software Engineer',
    'Full Stack Developer'
  ];

  const finalTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const finalDescription = description || defaultDescription;
  const finalImage = image || defaultImage;
  const finalKeywords = [...defaultKeywords, ...keywords].join(', ');

  // Structured Data (JSON-LD) using resume data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: resumeData.name,
    jobTitle: resumeData.title,
    worksFor: {
      '@type': 'Organization',
      name: resumeData.experience[0]?.company || 'Current Company'
    },
    alumniOf: resumeData.education.map(edu => ({
      '@type': 'Organization',
      name: edu.institution
    })),
    url: siteUrl,
    image: finalImage,
    email: resumeData.email,
    telephone: resumeData.phone,
    address: {
      '@type': 'PostalAddress',
      addressLocality: resumeData.location
    },
    sameAs: [
      resumeData.linkedin,
      resumeData.github
    ],
    knowsAbout: [
      ...resumeData.skills.languages,
      ...resumeData.skills.technologies.slice(0, 8)
    ],
    description: finalDescription
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={currentUrl} />
      
      {/* Robots */}
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      <meta name="googlebot" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Language and Locale */}
      <meta name="language" content="en-US" />
      <meta httpEquiv="content-language" content="en-US" />

      {/* OpenGraph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${finalTitle} - Portfolio Screenshot`} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@himanshuc_dev" />
      <meta name="twitter:creator" content="@himanshuc_dev" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      <meta name="twitter:image:alt" content={`${finalTitle} - Portfolio Screenshot`} />

      {/* Mobile and Responsive */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      <meta name="theme-color" content="#00e6fe" />
      <meta name="color-scheme" content="light dark" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Himanshu's Portfolio" />

      {/* Performance and Security */}
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="msapplication-tap-highlight" content="no" />

      {/* Favicons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />

      {/* Preconnect to External Domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://api.github.com" />
      <link rel="preconnect" href="https://vercel.live" />

      {/* DNS Prefetch for Performance */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="dns-prefetch" href="//api.github.com" />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      {/* Additional Meta for Better SEO */}
      <meta name="classification" content="Personal Portfolio" />
      <meta name="category" content="Technology" />
      <meta name="coverage" content="Worldwide" />
      <meta name="distribution" content="Global" />
      <meta name="rating" content="General" />
      <meta name="revisit-after" content="7 days" />
    </Helmet>
  );
};

export default SEO; 