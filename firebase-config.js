const firebaseConfig = {
  apiKey: "AIzaSyAfPSbhfu17Z4k-Q3UkE_I8hpWnIof2yjA",
  authDomain: "berberpro-71b37.firebaseapp.com",
  projectId: "berberpro-71b37",
  storageBucket: "berberpro-71b37.firebasestorage.app",
  messagingSenderId: "633237645513",
  appId: "1:633237645513:web:a4315bc1588b6d8fe94518"
};

firebase.initializeApp(firebaseConfig);

// App Check (reCAPTCHA Enterprise): desligado por padrão, porque travava o login.
// Para testar, abra o site com ?appcheck=1 no final do endereço.
var APPCHECK_PULADO = !/[?&]appcheck=1/.test(location.search);
if (!APPCHECK_PULADO) {
  try {
    firebase.appCheck().activate(
      new firebase.appCheck.ReCaptchaEnterpriseProvider('6LcqJ5wtAAAAALka6U0BcNjF-h2t9Th_P4NMAwOi'),
      true
    );
  } catch (e) {
    window.APPCHECK_ERRO = String(e && (e.code || e.message) || e);
    console.error('App Check não pôde ser ativado:', e);
  }
}

const auth = firebase.auth();
const db = firebase.firestore();
