const fs = require('fs');
const textile = require('textile-js');
const yaml = require('js-yaml');
const config = require('../config');

const posts = new Map();
const postMatch = /^-{3,}\s([\s\S]*?)-{3,}(\s[\s\S]*|\s?)$/;
let numResets = 0;

exports.getPost = (category, postID) => {
  return new Promise((resolve, reject) => {
    let post = posts.get(`${category}/${postID}`);
    if (post) {
      resolve(post);
    } else {
      fs.readFile(`./blog/${category}/${postID}.textile`, 'utf8', (err, str) => {
        if (err) {
          console.error(err);
          return reject('404');
        }
        const data = str.match(postMatch);
        if (data.length === 3 && data[1].length > 0) {
          try {
            post = yaml.load(data[1]);
            post.id = postID;
            post.url = `${config.appURL}/${category}/${postID}`;
            post.html = textile(data[2]);
            posts.set(`${category}/${postID}`, post);
            resolve(post);
          } catch (err) {
            reject('Sintaxis incorrecta.' + err.message);
          }
        } else {
          reject('Documento mal formado.');
        }
      });
    }
  });
};

exports.resetCache = () => {
  numResets++;
  posts.clear();
  return numResets;
};
