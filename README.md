# Kaizen Fitness

موقع Kaizen Fitness ثابت وجاهز للنشر عبر GitHub Pages.

## النشر على GitHub

1. أنشئ مستودعًا جديدًا وفارغًا في GitHub.
2. افتح Terminal داخل مجلد المشروع وشغّل:

```bash
git init -b main
git add .
git commit -m "Prepare Kaizen Fitness website"
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

- نموذج **Book Free Assessment** مضبوط حاليًا على واتساب الاحتياطي، لكن رابط الـ webhook ما زال فارغًا (`data-webhook-url=""`). أضف عنوان webhook حقيقيًا لتفعيل الإرسال إلى WhatsApp API والبريد وGoogle Sheets.
- ملفات Aeonik المرفقة تحمل اسم Trial. تأكد من امتلاك ترخيص الاستخدام التجاري قبل نشر الموقع رسميًا.
