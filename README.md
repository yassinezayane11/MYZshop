# DBACH — E-Commerce Mode Masculine 🇹🇳

Application e-commerce full-stack complète pour la vente de vêtements masculins en Tunisie.

---

## 🛠 Stack Technique

| Côté | Technologies |
|------|-------------|
| **Frontend** | React 18 + Vite + TailwindCSS + Redux Toolkit |
| **Backend** | Node.js + Express |
| **Base de données** | MongoDB + Mongoose |
| **Upload fichiers** | Multer |
| **Auth admin** | JWT + bcryptjs |

---

## 📁 Structure du Projet

```
dbach/
├── client/                   # Frontend React
│   ├── src/
│   │   ├── api/              # Appels API Axios
│   │   ├── components/       # Composants réutilisables
│   │   ├── pages/            # Pages publiques
│   │   │   └── admin/        # Pages admin
│   │   └── store/            # Redux slices
│   ├── .env.example
│   └── package.json
├── server/                   # Backend Express
│   ├── middleware/           # Auth + Upload
│   ├── models/               # Modèles Mongoose
│   ├── routes/               # Routes API
│   ├── uploads/              # Images uploadées
│   ├── .env.example
│   ├── index.js
│   └── package.json
├── .gitignore
└── README.md
```

---

## 🚀 Installation & Lancement

### Prérequis
- **Node.js** v18+
- **MongoDB** (local ou Atlas)
- **npm** ou yarn

### 1. Cloner / Extraire le projet

```bash
unzip dbach.zip
cd dbach
```

### 2. Configurer le Backend

```bash
cd server
cp .env.example .env
```

Éditez `server/.env` :

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/dbach
JWT_SECRET=changez_cette_cle_secrete_en_production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

```bash
npm install
npm run dev       # Mode développement (nodemon)
# ou
npm start         # Mode production
```

### 3. Configurer le Frontend

```bash
cd ../client
cp .env.example .env
```

`client/.env` :
```env
VITE_API_URL=http://localhost:5000/api
```

```bash
npm install
npm run dev       # Démarre sur http://localhost:5173
```

### 4. Accès

| URL | Description |
|-----|-------------|
| `http://localhost:5173` | Site client |
| `http://localhost:5173/admin` | Admin panel |
| `http://localhost:5000/api/health` | Health check API |

**Identifiants admin par défaut :**
- Username : `admin`
- Password : `admin123`

> ⚠️ Changez ces identifiants en production !

---

## 🌐 Déploiement en Production

### Frontend → Vercel

1. Créez un compte sur [vercel.com](https://vercel.com)
2. Importez le dossier `/client`
3. Configurez la variable d'environnement :
   ```
   VITE_API_URL=https://votre-api.onrender.com/api
   ```
4. Build command : `npm run build`
5. Output dir : `dist`

### Backend → Render

1. Créez un compte sur [render.com](https://render.com)
2. New Web Service → importez `/server`
3. Build command : `npm install`
4. Start command : `node index.js`
5. Variables d'environnement :
   ```
   MONGODB_URI=mongodb+srv://...  (depuis MongoDB Atlas)
   JWT_SECRET=votre_cle_secrete_longue_et_aléatoire
   CLIENT_URL=https://dbach.vercel.app
   NODE_ENV=production
   ```

### Base de données → MongoDB Atlas

1. Créez un cluster gratuit sur [mongodb.com/atlas](https://mongodb.com/atlas)
2. Créez un utilisateur et notez le mot de passe
3. Copiez l'URI de connexion : `mongodb+srv://user:password@cluster.mongodb.net/dbach`
4. Ajoutez votre IP (ou `0.0.0.0/0` pour tout autoriser)

### Domaine .tn ou .com

1. Achetez votre domaine (ex: `dbach.tn`) sur Tunisie Telecom, Register.tn, ou Namecheap
2. Sur Vercel : Settings → Domains → ajoutez `dbach.tn`
3. Vercel vous donnera des records DNS (A, CNAME) à configurer chez votre registrar
4. Pour l'API, pointez `api.dbach.tn` vers votre service Render via un record CNAME

---

## 📱 Fonctionnalités

### Côté Client (Public)
- ✅ Navigation par catégories
- ✅ Filtres par taille, couleur, recherche
- ✅ Page produit avec sélecteur taille/couleur/quantité
- ✅ Indicateur de stock en temps réel
- ✅ Panier persistant (localStorage)
- ✅ Checkout sans compte (guest checkout)
- ✅ Calcul automatique livraison par ville
- ✅ Page de confirmation avec suivi

### Admin Panel
- ✅ Authentification JWT sécurisée
- ✅ Dashboard avec statistiques
- ✅ CRUD produits avec upload d'images
- ✅ Gestion des variantes (taille/couleur/stock)
- ✅ Liste et détail des commandes
- ✅ Mise à jour des statuts de commande
- ✅ Configuration livraison par ville

---

## 🔐 Sécurité

- Mots de passe hashés avec bcrypt (10 rounds)
- JWT avec expiration 7 jours
- Middleware auth sur toutes les routes admin
- Validation des données côté serveur
- Variables d'environnement pour les secrets

---

## 📦 Modèles de Données

### Product
```js
{ name, description, basePrice, category, images[], 
  variants[{size, color, stock}], featured, active }
```

### Order
```js
{ orderNumber, customerInfo{name,phone,address,city,deliveryType},
  items[{productId,size,color,quantity,price}],
  subtotal, deliveryPrice, totalPrice, status, statusHistory[] }
```

### DeliveryConfig
```js
{ defaultPrice, estimatedDays, freeDeliveryThreshold,
  cityPrices[{city, price, estimatedDays}] }
```

---

## 🎨 Design

- Thème sombre élégant (dark luxury fashion)
- Typographie : Playfair Display + DM Sans
- Palette : tons ambrés/bronze sur fond sombre
- Mobile-first, entièrement responsive
- Animations CSS subtiles

---

Made with ❤️ pour DBACH — Tunisie
