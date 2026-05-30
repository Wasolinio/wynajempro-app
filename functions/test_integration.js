const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');

// Since we are running on the user's dev machine, we might be able to use Application Default Credentials
// or we can just require the user to provide a service account key. 
// But wait, the firebase CLI is logged in. 
// If we just initializeApp without args, it might pick up GOOGLE_APPLICATION_CREDENTIALS.
async function runTests() {
  console.log("Rozpoczynam testy integracyjne...");
  
  try {
    initializeApp();
    console.log("Firebase Admin zainicjowany poprawnie.");
  } catch (e) {
    console.error("Brak dostępu administracyjnego:", e.message);
    return;
  }

  const auth = getAuth();
  const db = getFirestore();
  
  const testUid = "test_user_" + Date.now();
  console.log(`1. Tworzenie użytkownika testowego: ${testUid}`);
  
  try {
    await auth.createUser({
      uid: testUid,
      email: `${testUid}@example.com`,
      emailVerified: true,
      password: "password123"
    });
    console.log("✅ Użytkownik testowy utworzony.");
    
    console.log("2. Symulacja rejestracji frontendu (tworzenie doc users/{uid} ze statusem trialing)");
    await db.collection("users").doc(testUid).set({
      status: "trialing",
      trialEndsAt: Timestamp.fromMillis(Date.now() + 14 * 24 * 60 * 60 * 1000)
    });
    console.log("✅ Dokument użytkownika utworzony.");
    
    console.log("3. Oczekiwanie na Cloud Function onUserDocumentCreated (5 sekund)...");
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const userRecord = await auth.getUser(testUid);
    if (userRecord.customClaims && userRecord.customClaims.stripeStatus === 'trialing') {
      console.log("✅ Custom Claims dla triala zostały poprawnie nadane!");
    } else {
      console.warn("⚠️ Custom Claims NIE zostały nadane. Sprawdź logi Cloud Functions.");
      console.warn("Obecne claims:", userRecord.customClaims);
    }
    
    console.log("4. Sprzątanie - usuwanie użytkownika testowego...");
    await db.collection("users").doc(testUid).delete();
    await auth.deleteUser(testUid);
    console.log("✅ Posprzątane.");
    
  } catch (err) {
    console.error("❌ Błąd podczas testu:", err);
  }
}

runTests();
