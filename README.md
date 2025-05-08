# Himanshu Chaudhary's Portfolio

A modern, responsive portfolio website showcasing my work as a Software Engineer II specializing in Generative AI and Full Stack Development.

## 🌟 Features

- **Modern Design**: Clean, minimalist interface with smooth animations
- **Responsive**: Fully responsive design that works on all devices
- **Dark/Light Mode**: Toggle between dark and light themes
- **SEO Optimized**: Built with SEO best practices
- **Performance**: Optimized for speed and performance
- **Accessibility**: WCAG 2.1 compliant
- **Analytics**: Integrated with Google Analytics
- **Contact Form**: Functional contact form with EmailJS integration
- **Smooth Scrolling**: Enhanced navigation experience
- **PDF Resume**: Downloadable resume in PDF format

## 🛠 Tech Stack

- **Frontend Framework**: React.js 18
- **Styling**: 
  - Bootstrap 5
  - Custom CSS with CSS Variables
  - Framer Motion for animations
- **Icons**: React Icons
- **Form Handling**: EmailJS
- **Analytics**: Google Analytics 4
- **SEO**: React Helmet
- **Build Tool**: Vite
- **Deployment**: GitHub Pages

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/himanshukadian/portfolio.git
   cd portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
portfolio/
├── public/              # Static files
├── src/
│   ├── components/      # React components
│   ├── context/         # React context
│   ├── utils/           # Utility functions
│   ├── Assets/          # Images and assets
│   ├── App.js           # Main App component
│   └── main.jsx         # Entry point
├── index.html           # HTML template
└── package.json         # Dependencies and scripts
```

## 🎨 Customization

1. **Personal Information**
   - Update `src/components/Home/Home.js` for hero section
   - Modify `src/components/About/About.js` for about section
   - Edit `src/components/Projects/Projects.js` for projects
   - Update `src/components/Resume/ResumeNew.js` for experience

2. **Styling**
   - Main styles in `src/style.css`
   - Theme colors in CSS variables
   - Component-specific styles in respective files

3. **Contact Form**
   - Configure EmailJS in `src/components/Contact/Contact.js`
   - Update template IDs and service IDs

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints:
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

## 🔒 Security

- Environment variables for sensitive data
- Secure form handling
- Protected API keys
- HTTPS enabled

## 🚀 Deployment

1. **GitHub Pages**
   ```bash
   npm run deploy
   ```

2. **Custom Domain**
   - Add CNAME file in public directory
   - Configure DNS settings
   - Update base URL in vite.config.js

## 📊 Performance Optimization

- Lazy loading of components
- Image optimization
- Code splitting
- Minified assets
- Caching strategies

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

- **Email**: [Your Email]
- **LinkedIn**: [Your LinkedIn]
- **GitHub**: [Your GitHub]
- **Portfolio**: [Your Portfolio URL]

## Hosting Blog and Portfolio on Separate Subdomains

### 1. Split the Codebase
- Create a new directory `blog-app` at the project root.
- Copy all blog-related components (`src/components/Blog`, shared components like `Navbar`, `Footer`, `Loader`, `SEO`, and the markdown files) into `blog-app/src`.
- Copy `public/index.html` to `blog-app/public/index.html`.
- Create a new `blog-app/src/App.js` and `blog-app/src/index.js` that only import and render the blog pages.
- Update navigation in both apps:
  - Portfolio: Navbar "Blog" link → `https://blog.buildwithhimanshu.com`
  - Blog: Navbar "Portfolio" or "Home" link → `https://portfolio.buildwithhimanshu.com`

### 2. Deploy Each App
- Deploy the main portfolio app to `portfolio.buildwithhimanshu.com` (e.g., Netlify, Vercel, or your host).
- Deploy the blog app to `blog.buildwithhimanshu.com`.

### 3. DNS Setup
- In your DNS provider, add CNAME or A records:
  - `portfolio.buildwithhimanshu.com` → your portfolio app host
  - `blog.buildwithhimanshu.com` → your blog app host

### 4. (Optional) Shared Styles/Assets
- If you want to share styles or assets, consider symlinking or copying `src/style.css` and `public` assets to both apps.

---

**After splitting, each app is fully independent and can be updated/deployed separately.**

---

Made with ❤️ by Himanshu Chaudhary 