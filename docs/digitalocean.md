# نشر الموقع على DigitalOcean App Platform

الإعداد الحالي يدعم Web Service يعمل بـ Node.js 22 دون حزم إضافية.

- المستودع: `altaweel-thrill/Kaizen`، الفرع: `main`.
- Source Directory: جذر المشروع `/`، وليس مجلد `functions`.
- Build Command: `npm run build`، ويمكن ترك المنصة تستخدم الإعداد الافتراضي.
- Run Command: `npm start`.
- HTTP Port: `8080`، أو قيمة `PORT` التي توفرها المنصة.

ملف `package-lock.json` موجود في الجذر كي يعمل تثبيت npm أثناء البناء. ملف `server.js` هو مدخل التشغيل، ويستمع على `0.0.0.0` مع منفذ المنصة. إعداد `npm run dev` المحلي يبقى على `localhost:8765`.

الخادم يعرض ملفات الموقع واللوحة العامة فقط، ولا يعرض ملفات Firebase الخاصة أو `.env` أو `node_modules`.

## ربط النموذج بعد النشر

الدومين الحالي هو `https://kaizenfit.sa`، وأُضيف هو ونسخة `www` إلى أصول Firebase المسموح بها.

رابط المعاينة `https://jellyfish-app-mrvsn.ondigitalocean.app` مسموح أيضًا. لوحة التحكم تُفتح على `/admin/`؛ الخادم يحوّل `/admin` تلقائيًا إلى هذا المسار كي تُحمّل ملفات التنسيق وJavaScript بشكل صحيح.

أضف أصل رابط DigitalOcean أو الدومين النهائي (مثل `https://example.com`، دون مسار أو شرطة مائلة في النهاية) إلى `ALLOWED_ORIGINS` في `functions/.env`، ثم أعد نشر وظائف Firebase. بدون ذلك سترفض Firebase طلبات النموذج من الرابط الجديد.

```bash
firebase deploy --only functions:kaizen-leads --project kaizen-44bef
```

إذا استخدمت لوحة التحكم على الدومين الجديد، أضف اسم الدومين أيضًا إلى Authorized domains في Firebase Authentication عند الحاجة إلى تأكيد البريد واستعادة كلمة المرور.

مرجع: [Node.js Buildpack](https://docs.digitalocean.com/products/app-platform/reference/buildpacks/nodejs/).
