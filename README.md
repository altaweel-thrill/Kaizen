# Kaizen Fitness

موقع Kaizen Fitness ثابت وجاهز للنشر عبر GitHub Pages.

النشر على DigitalOcean للدومين `https://kaizenfit.sa`: ملف التشغيل `server.js` وأمر `npm start`، مع دعم `PORT`. [إعدادات DigitalOcean](docs/digitalocean.md).

لوحة طلبات التقييم: [فتح لوحة الإدارة](https://kaizen-44bef.web.app/admin/). الدخول مخصص لبريد المدير `altaweel@thrillagency.net` بالإيميل وكلمة المرور، مع تأكيد البريد. [تعليمات الحساب واللوحة](docs/admin-dashboard.md).

## التشغيل المحلي

من مجلد المشروع شغّل `npm run dev`، ثم افتح `http://localhost:8765`.
لا تحتاج تثبيت حزم. حدّث المتصفح بعد تعديل الملفات، واستخدم `Ctrl+C` لإيقاف الخادم.

## النشر على GitHub

1. أنشئ مستودعًا جديدًا وفارغًا في GitHub.
2. انسخ رابط المستودع، ثم افتح Terminal داخل مجلد المشروع وشغّل:

```bash
git remote add origin https://github.com/YOUR_USERNAME/kaizen-fitness.git
git push -u origin main
```

3. من إعدادات المستودع افتح **Settings → Pages** واختر **GitHub Actions** كمصدر النشر.
4. انتظر انتهاء مهمة النشر من تبويب **Actions**؛ بعدها سيظهر رابط الموقع.

## هيكل المشروع

- `index.html`: مدخل الموقع عند فتح رابط GitHub Pages.
- `fit-and-you.webflow.io/`: ملفات الصفحة الرئيسية وملفات CSS وJavaScript المخصصة.
- مجلدات CDN المحلية: الصور، الفيديو، الخطوط، والمكتبات اللازمة لتشغيل نسخة Webflow.
- `.github/workflows/pages.yml`: مهمة النشر التلقائي بعد كل تحديث على فرع `main`.

## قبل الإطلاق النهائي

- خدمة حفظ **Book Free Assessment** نُشرت على Firebase Firestore عبر Cloud Functions في المشروع `kaizen-44bef`، واختُبر الحفظ الفعلي ومنع التكرار ورفض القراءة العامة. لا ترسل بريدًا. ملفات الموقع المحلية مربوطة بالخدمة؛ ارفع تحديثات الموقع لتعمل النسخة المنشورة. راجع [تعليمات Firebase](docs/firebase-setup.md). يبقى واتساب رابطًا احتياطيًا عند فشل الطلب.
- ملفات Aeonik المرفقة تحمل اسم Trial. تأكد من امتلاك ترخيص الاستخدام التجاري قبل نشر الموقع رسميًا.
# Kaizen
