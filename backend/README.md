# Backend - Shared Code

Shared Firebase configuration and utilities used by both mobile and web apps.

## Structure

```
backend/
├── firebase/
│   ├── config.js          # Firebase initialization
│   └── cloudStorage.js    # Firestore sync utilities
└── utils/
    ├── storage.js         # Entry storage utilities
    └── platformStorage.js # Cross-platform storage wrapper
```

## Usage

```javascript
import { auth, db, storage } from '../../backend/firebase/config';
import { saveEntry } from '../../backend/utils/storage';
```
