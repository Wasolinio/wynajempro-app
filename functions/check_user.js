const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const app = initializeApp();
const db = getFirestore(app);

async function check() {
  const uid = "aMm3xhYiEgfTZK7Hj6Rf3GD3YnN2";
  const doc = await db.collection("users").doc(uid).get();
  console.log("User data:", doc.data());

  const rentals = await db.collection("users").doc(uid).collection("rentals").get();
  console.log("Rentals count:", rentals.size);

  const settings = await db.collection("users").doc(uid).collection("settings").get();
  console.log("Settings count:", settings.size);
}
check().catch(console.error);
