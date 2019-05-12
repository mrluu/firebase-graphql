const firebase = require('firebase');
const admin = require('firebase-admin');
const functions = require('firebase-functions');

admin.initializeApp(functions.config().firebase);
const foldersRef = admin.database().ref('folders');

// Initialize Firebase
var config = {
  apiKey: "AIzaSyAb1J8fK0uSwf-zz95h8G0Mu1fD9gT70_k",
  authDomain: "graphql-sample.firebaseapp.com",
  databaseURL: "https://graphql-sample.firebaseio.com",
  projectId: "graphql-sample",
  storageBucket: "graphql-sample.appspot.com",
  messagingSenderId: "233011101239",
  appId: "1:233011101239:web:ad02a29ac7bb5e3d"
};
const app = firebase.initializeApp(config);
const db = firebase.firestore(app);

module.exports = {
  Query: {
    folders() {
      console.log("folders() ");
      var collectionRef = db.collection("folders");
      return collectionRef.get().then((results) => {
        console.log("RESULTS size: " + results.size);

        if (results.size > 0) {
          let folders = [];

          return results.docs.map(doc => {
              let target = Object.assign({id: doc.id}, {name: doc.data().name});
              console.log(target);
              return target;
          });
        }
        else {
          return [];
        }
      });
    }
  },
  Mutation: {
    createFolder(_, { input }) {
      return (
        new Promise((resolve) => {
          const folder = foldersRef.push(input, () => {
            resolve(Object.assign({ id: folder.key }, input)
            );
          });
        })
      );
    },
    updateFolder(_, { input }) {
      const folderRef = foldersRef.child(input.id);
      return folderRef.once('value')
        .then(snapshot => {
          const folder = snapshot.val();
          if (folder === null) throw new Error('404');
          return folder;
        })
        .then((folder) => {
          const update = Object.assign(folder, input);
          delete update.id;
          return folderRef.set(update).then(() => (Object.assign({ id: input.id }, update)));
        });
    },
    deleteFolder(_, { input }) {
      const folderRef = foldersRef.child(input.id);
      return folderRef.once('value')
        .then((snapshot) => {
          const folder = snapshot.val();
          if (folder === null) throw new Error('404');
          return Object.assign({ id: input.id }, folder);
        })
        .then(folder => folderRef.remove().then(() => (folder)));
    }
  }
};
