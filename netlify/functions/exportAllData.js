// netlify/functions/exportAllData.js

const admin = require('firebase-admin')

// Inisialisasi sekali saja
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  })
}
const db = admin.firestore()

exports.handler = async function (event) {
  try {
    // Daftar koleksi yang mau di‐export
    const collections = [
      'users',
      'activities',
      'assets',
      'finances',
      'autoFinanceKeywords'
    ]
    const exportData = {}

    // Ambil data tiap koleksi
    for (const colName of collections) {
      const snap = await db.collection(colName).get()
      exportData[colName] = snap.docs.map(d => ({
        id:        d.id,
        ...d.data()
      }))
    }

    const body = JSON.stringify(exportData, null, 2)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        // Header agar browser langsung download file
        'Content-Disposition': 'attachment; filename="exportAllData.json"'
      },
      body
    }
  } catch (err) {
    console.error('Error exporting data:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    }
  }
}
