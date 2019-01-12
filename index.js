const fs = require('fs-extra');
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly',
 'https://www.googleapis.com/auth/drive.metadata.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Google Drive API.
  // authorize(JSON.parse(content), listFiles);
  authorize(JSON.parse(content), downloaderPdf);
  // authorize(JSON.parse(content), uploader);
  // authorize(JSON.parse(content), downloader);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the names and IDs of up to 10 files.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
 function listFiles(auth) {
  const drive = google.drive({version: 'v3', auth});
  drive.files.list({
    pageSize: 10,
    fields: 'nextPageToken, files(id, name)',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const files = res.data.files;
    if (files.length) {
      console.log('Files:');
      files.map((file) => {
        console.log(`${file.name} (${file.id})`);
      });
    } else {
      console.log('No files found.');
    }
  });
}
 function downloader(auth) {
  const drive = google.drive({version: 'v3', auth});
  var fileId = '1jHopEYD18z2QVVzdTmzwIqKqN0ZZoW7P';
  var dest = fs.writeFile('/tmp/photo.jpg');
  drive.files.get({
    fileId: fileId,
    alt: 'media'
  })
.on('end', function () {
        console.log('Done');
      })
      .on('error', function (err) {
        console.error('Error during download', err);
      })
      .pipe(dest);
}
function uploader(auth) {
  const drive = google.drive({version: 'v3', auth});
  var fileMetadata = {
      'name': 'photo.jpg'
    };
    var media = {
      mimeType: 'image/jpeg',
      body: fs.writeFile(`./tmp/${getDate()}.jpg`)
    };
    drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id'
    }, function (err, file) {
      if (err) {
        // Handle error
        console.error(err);
      } else {
        console.log('File Id: ', file.id);
      }
    });
  }
function downloaderPdf(auth){
  const drive = google.drive({version: 'v3', auth});
    var fileId = '1t-BAP4ES1ADH-5A3-ayy2SKVz26ZEKfN';
    var d = new Date();
var dest = fs.createWriteStream(`/tmp/${d}.pdf`);
drive.files.export({
  fileId: fileId,
  mimeType: 'application/pdf'
})
    .on('end', function () {
      console.log('Done');
    })
    .on('error', function (err) {
      console.log('Error during download', err);
    })
    .pipe(dest);
  }
function createFolder(auth){
  const drive = google.drive({version: 'v3', auth});
  var fileMetadata = {
    'name': 'Invoices',
    'mimeType': 'application/vnd.google-apps.folder'
  };
  drive.files.create({
    resource: fileMetadata,
    fields: 'id'
  }, function (err, file) {
    if (err) {
      // Handle error
      console.error(err);
    } else {
      console.log('Folder Id: ', file.id);
    }
  });
}
function InsertingFileFolder(auth){
  const drive = google.drive({version: 'v3', auth});
  var folderId = '0BwwA4oUTeiV1TGRPeTVjaWRDY1E';
  var fileMetadata = {
    'name': 'photo.jpg',
    parents: [folderId]
  };
  var media = {
    mimeType: 'image/jpeg',
    body: fs.createReadStream('files/photo.jpg')
  };
  drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id'
  }, function (err, file) {
    if (err) {
      // Handle error
      console.error(err);
    } else {
      console.log('File Id: ', file.id);
    }
  });
}
function moveFilesBetweenFolders(auth){
  const drive = google.drive({version: 'v3', auth});
  fileId = '1sTWaJ_j7PkjzaBWtNc3IzovK5hQf21FbOw9yLeeLPNQ'
  folderId = '0BwwA4oUTeiV1TGRPeTVjaWRDY1E'
  // Retrieve the existing parents to remove
  drive.files.get({
    fileId: fileId,
    fields: 'parents'
  }, function (err, file) {
    if (err) {
      // Handle error
      console.error(err);
    } else {
      // Move the file to the new folder
      var previousParents = file.parents.join(',');
      drive.files.update({
        fileId: fileId,
        addParents: folderId,
        removeParents: previousParents,
        fields: 'id, parents'
      }, function (err, file) {
        if (err) {
          // Handle error
        } else {
          // File moved.
        }
      });
    }
  });
}