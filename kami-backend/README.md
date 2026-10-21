# KAMI Assessment

Laravel 12 API and React/Vite frontend for the KAMI assessment application.

## Deploy to Vercel

This project uses the community `vercel-php` runtime because Vercel does not provide an official PHP runtime. The runtime configuration is in `vercel.json`; the PHP function entrypoint is `api/index.php`.

Before deploying, prepare:

- A managed MySQL database reachable from Vercel Functions.
- An S3-compatible bucket for evidence uploads. Vercel Function filesystems are temporary; local uploads do not persist between invocations.
- A production `APP_KEY` generated with `php artisan key:generate --show`.

### Import the project

1. Push this repository to GitHub. Do not commit `.env` or credentials.
2. In Vercel, import the repository and set the project root to `kami-backend` if the Laravel app is inside a parent repository folder.
3. Use the `Other` framework preset. `vercel.json` runs `npm run vercel-build`, creates the Vite build, and stages public assets in `vercel-public` while excluding PHP entrypoints and local storage.
4. Add the production environment variables below for Production, Preview, and Development as needed.

### Environment variables

Set these in Vercel Project Settings. Never put production secrets in `vercel.json` or Git.

```text
APP_NAME=Indeks KAMI
APP_ENV=production
APP_DEBUG=false
APP_URL=https://website-assesment.vercel.app
APP_KEY=base64:GENERATED_KEY

DB_CONNECTION=mysql
DB_HOST=YOUR_DATABASE_HOST
DB_PORT=3306
DB_DATABASE=YOUR_DATABASE_NAME
DB_USERNAME=YOUR_DATABASE_USER
DB_PASSWORD=YOUR_DATABASE_PASSWORD

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax
SANCTUM_STATEFUL_DOMAINS=YOUR-PROJECT.vercel.app

CACHE_STORE=database
QUEUE_CONNECTION=sync
LOG_CHANNEL=stderr

EVIDENCE_FILESYSTEM_DRIVER=s3
AWS_ACCESS_KEY_ID=YOUR_S3_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YOUR_S3_SECRET
AWS_DEFAULT_REGION=YOUR_BUCKET_REGION
AWS_BUCKET=YOUR_BUCKET_NAME
AWS_URL=https://YOUR_PUBLIC_BUCKET_URL
AWS_ENDPOINT=
AWS_USE_PATH_STYLE_ENDPOINT=false
```

Add the final custom domain to `SANCTUM_STATEFUL_DOMAINS` too, without `https://`. For a regional S3-compatible provider, set its endpoint and path-style setting according to that provider's instructions. The evidence URLs are public in the current application; use a private bucket only after changing the file URL/authorization flow.

Set `APP_URL` to the HTTPS URL that users open. The application also trusts Vercel's forwarded protocol header in production so Laravel generates HTTPS asset URLs when requests arrive through Vercel's HTTPS proxy.

### Initialize the database

After setting environment variables, run these commands once from a trusted environment that can connect to the production database:

```bash
php artisan migrate --force
php artisan db:seed --class=QuestionSeeder --force
```

Do not use `migrate:fresh` on a database containing data. Do not run migrations from every serverless request.

### Deploy and smoke-test

Deploy from the Vercel dashboard or with the Vercel CLI. After deployment, verify `/login`, registration/login, assessment creation, answer saving, calculation, result display, and evidence upload/download. Check the Vercel Function logs if a request fails.

The PHP runtime is community-maintained, not an official Vercel runtime. Verify the deployment with your actual Vercel account before using it for production data.

## Local development

```powershell
npm.cmd install
npm.cmd run dev
```

Run Laravel from the project directory in a separate terminal:

```powershell
php artisan serve
```

---

<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework. You can also check out [Laravel Learn](https://laravel.com/learn), where you will be guided through building a modern Laravel application.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
