# نظام ساهر لإدارة الرخص التجارية والأنشطة والعقود
# SAHER License & Contract Management System

نظام مؤسسي متكامل ومتجاوب لإدارة ومتابعة وتجديد الرخص التجارية والتشغيلية، شهادات الدفاع المدني، عقود الإيجار، عقود الموردين، الوكالات الخاصة، والعلامات التجارية، مع لوحة معلومات تفاعلية وتوزيع مالي ذكي للتكاليف المتوقعة.

---

## 🚀 التشغيل محلياً (Run Locally)

### المتطلبات الأساسية (Prerequisites)
- [Node.js](https://nodejs.org/) (الإصدار 18 أو أحدث / Version 18+)
- [npm](https://www.npmjs.com/)

### الخطوات (Steps)
1. **تثبيت الحزم البرمجية (Install dependencies):**
   ```bash
   npm install
   ```

2. **تشغيل الخادم المحلي للتطوير (Start development server):**
   ```bash
   npm run dev
   ```
   افتح المتصفح على: `http://localhost:3000`

3. **التحقق من صحة الكود والأنواع (Type Check / Lint):**
   ```bash
   npm run lint
   ```

4. **بناء المشروع للإنتاج (Build for Production):**
   ```bash
   npm run build
   ```
   المخرجات ستكون في مجلد `dist/`.

---

## 🌐 النشر على GitHub & GitHub Pages (Deploy to GitHub)

المشروع جاهز ومضبوط تلقائياً للعمل والنشر المباشر على **GitHub Pages**:

### 1. رفع المشروع إلى GitHub:
```bash
git init
git add .
git commit -m "Initial commit - Saher Management System"
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY>.git
git push -u origin main
```

### 2. تفعيل النشر التلقائي عبر GitHub Pages:
1. توجّه إلى مستودع المشروع على GitHub.
2. اضغط على **Settings** > ثم اختر **Pages** من القائمة الجانبية.
3. تحت خيار **Build and deployment**:
   - في خانة **Source** اختر: **GitHub Actions**.
4. بمجرد دفع أي تعديل لفرع `main`، سيعمل سير العمل (`.github/workflows/deploy.yml`) تلقائياً لبناء التطبيق ونشره على الرابط:
   `https://<YOUR_USERNAME>.github.io/<YOUR_REPOSITORY>/`

---

## 🛠 التقنيات المستخدمة (Tech Stack)
- **React 18** & **TypeScript**
- **Vite** (مع دعم المسارات النسبية `base: './'`)
- **Tailwind CSS** (تصميم متجاوب بالكامل لكافة الشاشات)
- **Recharts** (مخططات بيانية تفاعلية للتكاليف والانتهاء)
- **XLSX** (تصدير واستيراد البيانات)
