const admin = require('firebase-admin')
const { google } = require('googleapis')
const drive = google.drive('v3')

// Inisialisasi Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    )
  })
}
const db = admin.firestore()

// Setup JWT auth untuk Drive API
const key = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT)
const jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/drive.file']
)

exports.handler = async function (event) {
  try {
    // 1) Generate backup JSON
    const collections = await db.listCollections()
    const backup = {}
    for (const col of collections) {
      const snap = await col.get()
      backup[col.id] = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    }
    const fileContent = JSON.stringify(backup, null, 2)

    // 2) Upload ke Google Drive
    await jwtClient.authorize()
    const res = await drive.files.create({
      auth: jwtClient,
      requestBody: {
        name: `backup-${Date.now()}.json`,
        parents: ['<FOLDER_ID>']      // ganti dengan ID folder Drive-mu
      },
      media: {
        mimeType: 'application/json',
        body: Buffer.from(fileContent)
      }
    })

    // 3) Dapatkan webViewLink agar bisa diakses
    const fileId = res.data.id
    const meta = await drive.files.get({
      auth: jwtClient,
      fileId,
      fields: 'webViewLink, webContentLink'
    })

    return {
      statusCode: 200,
      body: JSON.stringify({ url: meta.data.webContentLink })
    }
  } catch (err) {
    console.error('Backup to Drive error:', err)
    return { statusCode: 500, body: err.toString() }
  }
}
