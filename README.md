# Verified Text Editor - Frontend

## Installation

```bash
npm install
```

## Running

```bash
npm start
```

Opens at `http://localhost:3000`

## We Don't Store Your Data!

This application runs completely client-side:
- All keystroke tracking happens in the browser
- Certificates are generated locally
- Verification is done with local crypto functions
- Your data stays on your device

## Features

- Real-time keystroke tracking
- Typing speed calculation
- Copy/paste detection
- Version history
- Self-contained certificate generation
- File upload verification
- Cryptographic signature checking (SHA256)

## Usage

### Creating a Document
1. Type in the editor
2. System automatically tracks keystrokes
3. Click "Generate Certificate" when done
4. Download the certificate file

### Verifying a Document
1. Click "Verify Document"
2. Upload a certificate JSON file
3. See instant verification results

## Technologies

- React 18
- CryptoJS (SHA256 hashing)
- Axios (optional, for future API features)
- CSS3 (Airbnb-inspired minimalist design)
