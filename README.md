# 📱 Mobilend - Mobile Phone E-commerce Platform
**Version: 1.0.3**

**Modern mobile phone store** built with Next.js 15 App Router, optimized for maximum performance and SEO.

## 🌟 Features

### 🚀 **Tech Stack**
- **Next.js 15** with App Router
- **React 19.1** with modern hooks
- **SCSS** for styling
- **Zustand** for state management
- **Swiper.js** for carousels/sliders
- **Formik + Yup** for forms and validation

### 📈 **SEO & Performance**
- **ISR (Incremental Static Regeneration)** for optimal performance
- **SSG (Static Site Generation)** for all product pages
- **JSON-LD** schemas for search engines
- **Open Graph** and **Twitter Cards**  
- Optimized meta tags for every page

### 📱 **Responsive Design**
- Mobile-first approach
- Adaptation for all devices
- Optimized images with Next.js Image
- Smooth animations and transitions

### 🛒 **Functionality**
- Product catalog with filtering
- Shopping cart
- Order system with forms
- **Blog system** with Markdown support
- Search and product sorting

## 📂 Project Structure

```
📦 mobilend/
├── 📁 data/                    # Project data
│   ├── 📁 blog/
│   │   └── 📁 articles/        # Markdown blog articles
│   └── 📁 gallery/             # Product images
├── 📁 public/                  # Static files
│   └── 📁 images/
│       └── 📁 blog/            # Blog images
├── 📁 src/
│   ├── 📁 app/                 # Next.js App Router
│   │   ├── 📁 blog/
│   │   │   ├── page.js         # Articles list (/blog)
│   │   │   └── 📁 [slug]/
│   │   │       └── page.js     # Article page (/blog/[slug])
│   │   ├── 📁 katalog/
│   │   │   ├── page.js         # Product catalog
│   │   │   └── 📁 [productLink]/
│   │   │       └── page.js     # Product page
│   │   ├── layout.js           # Root layout
│   │   └── page.js             # Homepage
│   ├── 📁 components/          # Reusable components
│   │   ├── 📁 BlogCard/        # Blog article card
│   │   ├── 📁 BlogContent/     # Article content
│   │   ├── 📁 BlogSlider/      # Articles slider
│   │   ├── 📁 Header/          # Site header
│   │   ├── 📁 Footer/          # Site footer
│   │   └── 📁 SEO/             # SEO components
│   ├── 📁 pages/               # Page UI components
│   │   ├── 📁 BlogPage/        # Blog page
│   │   ├── 📁 BlogPostPage/    # Article page
│   │   ├── 📁 HomePage/        # Homepage
│   │   └── 📁 CatalogPage/     # Catalog page
│   ├── 📁 lib/                 # Utilities and services
│   │   └── blog.js             # Blog utilities
│   └── 📁 services/            # Data services
└── 📁 package.json
```

## 🛠️ Installation & Setup

### **Requirements**
- Node.js 18.17+
- npm, yarn, pnpm or bun

### **Quick Start**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mobilend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or  
   pnpm install
   ```

3. **Create blog structure**
   ```bash
   mkdir -p data/blog/articles
   mkdir -p public/images/blog
   ```

4. **Install additional blog dependencies**
   ```bash
   npm install gray-matter marked
   ```

5. **Run the project**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📝 Blog System

### **Adding a New Article**

1. **Create MD file** in `data/blog/articles/`
2. **Use proper frontmatter:**

```markdown
---
title: "Article Title"
description: "Brief article description"
date: "2025-01-15"
slug: "article-url-slug"
image: "/images/blog/image.jpg"
author: "Author Name"
categories: ["Category1", "Category2"]
featured: true
---

# Article Content

Your content in **Markdown** format...
```

3. **Article will automatically appear** in blog via ISR (within 1 hour)

### **Blog Structure**
- **`/blog`** - list of all articles
- **`/blog/[slug]`** - individual article
- **ISR updates** every hour
- **SEO optimization** for each article

## 🎨 Style Customization

### **CSS Variables**
```scss
:root {
  --darkBlue: #1a365d;
  --lightGreen: #38a169;
  --white: #ffffff;
  --gray: #718096;
  --textColor: #2d3748;
}
```

### **Component Styles**
Each component has its own SCSS file:
```scss
// Example: src/components/BlogCard/BlogCard.scss
.BlogCard {
  // Component styles
  &--compact { /* modifier */ }
  &--large { /* modifier */ }
}
```

## ⚙️ Configuration

### **Next.js Configuration** (`next.config.mjs`)
- Image optimization
- SEO headers  
- Compression
- ISR settings

### **Environment Variables**
```env
NEXT_PUBLIC_SITE_URL=https://mobilend.sk
```

## 📊 SEO Optimization

### **Automatic Meta Tags**
- Dynamic title and description
- Open Graph tags
- Twitter Cards
- JSON-LD structured data

### **Performance**
- ISR for automatic updates
- Optimized images
- Static Generation for products
- CSS/JS minification

## 🚀 Deployment

### **Vercel (Recommended)**
```bash
npm run build
```

### **Other Platforms**
```bash
npm run build
npm run start
```

## 🔧 Scripts

```bash
npm run dev        # Run in development mode  
npm run build      # Build for production
npm run start      # Start built project
npm run lint       # ESLint code check
```

## 📋 Dependencies

### **Core**
- `next@15.4.1` - React framework
- `react@19.1.0` - UI library  
- `sass@1.89.2` - CSS preprocessor
- `zustand@5.0.6` - State management
- `swiper@11.2.10` - Carousels and sliders

### **Blog System**
- `gray-matter@4.0.3` - Frontmatter parsing
- `marked@12.0.0` - Markdown to HTML

### **Forms**
- `formik@2.4.6` - Form management
- `yup@1.6.1` - Schema validation

## 🐛 Troubleshooting

### **Error "Module not found: Can't resolve 'fs'"**
- Ensure server utilities are used only in Server Components
- Check imports in client components

### **YAML Exception in blog**
- Check frontmatter syntax
- Ensure closing `---` exists

### **Images not loading**
- Check image paths in `public/`
- Ensure images exist

## 🌐 API Routes

### **Blog API** (if needed)
```bash
GET /api/blog        # Get all articles
GET /api/blog/[slug] # Get specific article
```

### **Products API**
```bash
GET /api/products           # Get all products
GET /api/products/[id]      # Get specific product
POST /api/orders            # Create order
```

## 🔒 Security

### **Headers Configuration**
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: origin-when-cross-origin

### **Content Security Policy**
Configured in `next.config.mjs` for enhanced security.

## 📱 PWA Support (Optional)

The project is ready for PWA implementation:
- Manifest file support
- Service worker ready
- Offline functionality possible

## 🧪 Testing

### **Setup Testing** (Optional)
```bash
npm install --save-dev jest @testing-library/react
```

### **Run Tests**
```bash
npm test
```

## 🚀 Performance Optimization

### **Built-in Optimizations**
- Image optimization with Next.js Image
- Automatic code splitting
- Tree shaking
- ISR for dynamic content

### **Monitoring**
- Core Web Vitals tracking
- Performance metrics
- SEO score monitoring

## 🔄 CI/CD

### **GitHub Actions** (Example)
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
```

## 📈 Analytics

### **Google Analytics Setup**
Add to `layout.js`:
```javascript
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
      <GoogleAnalytics gaId="GA_MEASUREMENT_ID" />
    </html>
  )
}
```

## 🌍 Internationalization (i18n)

The project is ready for internationalization:
- Slovak (sk) - default
- English (en) - can be added
- Multi-language blog support

## 📞 Support

If you have questions or issues:

1. Check [Issues](https://github.com/your-repo/issues)
2. Create a new Issue with detailed description
3. Email: support@mobilend.sk

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is developed for Mobilend company. All rights reserved.

## 🎯 Future Enhancements

- [ ] User authentication
- [ ] Product reviews system
- [ ] Advanced filtering
- [ ] Wishlist functionality
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Admin dashboard
- [ ] API documentation

---

**Mobilend** - Your reliable partner in mobile technology! 📱✨

## 🔗 Links

- **Website**: https://mobilend.sk
- **Documentation**: [Project Wiki](https://github.com/your-repo/wiki)
- **Support**: support@mobilend.sk

---

*Built with ❤️ by the Mobilend development team*