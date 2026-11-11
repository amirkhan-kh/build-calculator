# Deploy: frontend → Vercel, backend → o'z serveringiz

```
Brauzer ──► Vercel (Next.js, fra1)  ──server-side──►┐
   │                                                 ▼
   └──────────── to'g'ridan-to'g'ri ──────► https://api.SIZNING-DOMEN  (nginx → FastAPI, Postgres, MinIO, Redis, Celery)
```

## 0. Kerak bo'ladigan narsalar

- Ubuntu 22.04/24.04 server (kamida 2 GB RAM), root yoki sudo kirish.
- API uchun domen yoki subdomen, masalan `api.mysite.uz`.
  DNS panelda **A-yozuv** qo'shing: `api` → serveringiz IP manzili.
  Vercel HTTPS'da ishlaydi, shuning uchun backend ham HTTPS bo'lishi shart — domen kerak.
  Domen bo'lmasa, vaqtincha `api.1-2-3-4.sslip.io` ko'rinishidagi bepul manzildan foydalanish mumkin (1-2-3-4 o'rniga server IP, nuqtalar o'rniga chiziqcha).

---

## 1. O'zgarishlarni GitHub'ga push qiling

```bash
git add -A
git commit -m "Vercel + server deploy sozlamalari"
git push origin main
```

---

## 2. Vercel'da frontend

1. [vercel.com/new](https://vercel.com/new) → `build-calculator` reposini **Import** qiling.
2. **Root Directory** → `Edit` → `frontend` ni tanlang (muhim!).
3. Framework avtomatik `Next.js` bo'ladi, build/install buyruqlariga tegmang (`frontend/vercel.json` da bor).
4. **Environment Variables** ga qo'shing:

   | Nomi | Qiymati |
   |---|---|
   | `NEXT_PUBLIC_API_URL` | `https://api.mysite.uz` (oxirida `/` yo'q) |
   | `SECURE_COOKIES` | `true` |

5. **Deploy** ni bosing. Tugagach manzilni ko'chirib oling, masalan `https://build-calculator.vercel.app` — u 3-qadamda kerak bo'ladi.

> Backend hali ishlamagani uchun bu bosqichda login ishlamaydi — bu normal.

Vercel funksiyalari `fra1` (Frankfurt) regionida ishlaydi — Markaziy Osiyo va Yevropadagi serverlarga eng yaqini. Serveringiz boshqa joyda bo'lsa, `frontend/vercel.json` dagi `regions` ni o'zgartiring (masalan AQSh uchun `iad1`). Region qanchalik serverga yaqin bo'lsa, sahifalar shunchalik tez ochiladi.

---

## 3. Serverda backend

### 3.1. Serverga kiring

```bash
ssh root@SERVER_IP
```

### 3.2. Reponi yuklab oling

Repo **public** bo'lsa:

```bash
git clone https://github.com/amirkhan-kh/build-calculator.git /opt/calculator
```

Repo **private** bo'lsa: GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained token** yarating (faqat shu repo, `Contents: Read-only`), keyin:

```bash
git clone https://TOKEN@github.com/amirkhan-kh/build-calculator.git /opt/calculator
```

### 3.3. Serverni tayyorlang (bir marta)

```bash
sudo bash /opt/calculator/scripts/setup-vps.sh
```

Docker, Certbot, firewall (22/80/443), 2 GB swap, `deploy` foydalanuvchisi, kunlik DB backup va SSL avto-yangilash o'rnatiladi.

### 3.4. Deploy

```bash
su - deploy
cd /opt/calculator
bash scripts/deploy-server.sh
```

Skript so'raydi:
- **API domeni** → `api.mysite.uz`
- **Vercel frontend manzili** → 2-qadamdagi manzil
- **Email** → SSL sertifikat uchun

Keyin o'zi: parollarni generatsiya qiladi (`.env`), SSL oladi, image'ni yig'adi, migratsiyalarni qo'llaydi va hamma servislarni ishga tushiradi. Oxirida **superuser** (login/parol) yaratishni so'raydi.

### 3.4.0. Domen yo'q bo'lsa

Skript domen so'raganda shunchaki **Enter** bosing (`PROXY_MODE=http`). API serverning `8080` portida HTTP orqali ishlaydi. Brauzer esa unga Vercel orqali murojaat qiladi: `https://<app>.vercel.app/backend/...`. Shu tufayli HTTPS ham, CORS ham muammo bo'lmaydi. Vercel'da quyidagi o'zgaruvchilarni qo'ying:

| Nomi | Qiymati |
|---|---|
| `NEXT_PUBLIC_API_URL` | `/backend` |
| `BACKEND_ORIGIN` | `http://SERVER_IP:8080` |
| `SECURE_COOKIES` | `true` |

Bu rejimning kamchiligi: Vercel va server orasidagi trafik shifrlanmagan. Keyinchalik domen olsangiz, `.env` ni o'chirib, skriptni domen bilan qayta ishga tushiring. Vercel'da esa `NEXT_PUBLIC_API_URL=https://api.domen` qilib, `BACKEND_ORIGIN` ni o'chiring.

### 3.4.1. Serverda 80/443 ni boshqa loyiha (Caddy) egallagan bo'lsa

Skript buni o'zi aniqlaydi (`PROXY_MODE=external`): nginx va certbot ishlatilmaydi, `calc-api` va `calc-minio` esa `edge` docker tarmog'iga ulanadi. Mavjud Caddy'ni ham shu tarmoqqa ulash kerak:

1. Boshqa loyihaning `docker-compose.yml` faylida, caddy servisiga `edge` tarmog'ini qo'shing. Agar servisda `networks:` bo'lmasa, `default` ni ham yozing, aks holda o'sha loyiha o'z backend'ini ko'rmay qoladi:

   ```yaml
   services:
     caddy:
       networks: [default, edge]

   networks:
     edge:
       external: true
   ```

2. `Caddyfile` ga deploy skripti oxirida chiqargan blokni qo'shing (`api.mysite.uz { ... }`).
3. O'sha loyiha papkasida: `docker compose up -d caddy`. Caddy SSL sertifikatni o'zi oladi.

### 3.5. Tekshiring

- `https://api.mysite.uz/health` → `{"status":"ok"}`
- Vercel manzilini oching → superuser bilan kiring.

---

## 4. Avtomatik deploy (ixtiyoriy, tavsiya etiladi)

- **Frontend:** `main` ga har push'da Vercel o'zi deploy qiladi.
- **Backend:** `backend/`, `nginx/` yoki `docker-compose.server.yml` o'zgarsa, GitHub Actions serverga SSH orqali kirib deploy qiladi. Sozlash:

Serverda (`deploy` foydalanuvchisi):

```bash
ssh-keygen -t ed25519 -f ~/.ssh/github_deploy -N ""
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github_deploy        # shu PRIVATE kalitni ko'chiring
```

GitHub → repo → Settings → Secrets and variables → Actions → **New repository secret**:

| Secret | Qiymati |
|---|---|
| `VPS_HOST` | server IP |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | yuqoridagi private kalit (to'liq, `-----BEGIN` ... `END-----` bilan) |
| `VPS_PORT` | SSH port 22 bo'lmasa |

Private repo bo'lsa, serverdagi `git pull` ishlashi uchun 3.2 dagi token bilan klon qilingan bo'lishi kerak.

Qo'lda yangilash:

```bash
cd /opt/calculator && git pull && bash scripts/deploy-server.sh
```

---

## 5. Foydali buyruqlar (serverda)

```bash
cd /opt/calculator
docker compose -f docker-compose.server.yml ps              # holat
docker compose -f docker-compose.server.yml logs -f api     # API loglari
docker logs calc-migrate                                    # migratsiya loglari
docker exec -it calc-api python scripts/create_superuser.py # yangi superuser
bash scripts/backup.sh                                      # DB backup (/opt/backups/postgres)
ssh -L 9001:localhost:9001 deploy@SERVER_IP                 # MinIO admin: http://localhost:9001
```

---

## 6. Muammolar

| Belgi | Sabab va yechim |
|---|---|
| Brauzer konsolida **CORS** xatosi | Vercel manzili `.env` dagi `ALLOWED_ORIGINS` da yo'q. Qo'shing (vergul bilan) va `docker compose -f docker-compose.server.yml up -d --force-recreate api` |
| Vercel'ga **custom domen** uladingiz | Uni ham `ALLOWED_ORIGINS` ga qo'shing (yuqoridagidek) |
| Login'dan keyin yana `/login` ga qaytaradi | Vercel'da `SECURE_COOKIES=true` va `NEXT_PUBLIC_API_URL` to'g'riligini tekshiring, so'ng **Redeploy** |
| `NEXT_PUBLIC_API_URL` ni o'zgartirdingiz, lekin ta'sir qilmadi | Bu o'zgaruvchi build vaqtida joylanadi — Vercel'da **Redeploy** qiling |
| SSL olinmadi | `nslookup api.mysite.uz` server IP'ni ko'rsatishi va 80-port ochiq bo'lishi kerak |
| 502 Bad Gateway | `docker logs calc-api --tail=100` |
