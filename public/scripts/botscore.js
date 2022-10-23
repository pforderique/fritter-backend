/* eslint-disable @typescript-eslint/restrict-template-expressions */

/**
 * Fields is an object mapping the names of the form inputs to the values typed in
 * e.g. for createUser, fields has properites 'username' and 'password'
 */

function viewAllBotscores(fields) {
  fetch('/api/botscores')
    .then(showResponse)
    .catch(showResponse);
}

function viewBotscoreByUsername(fields) {
  fetch(`/api/botscores?username=${fields.username}`)
    .then(showResponse)
    .catch(showResponse);
}

function createBotscore(fields) {
  fetch('/api/botscores', {method: 'POST', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
    .then(showResponse)
    .catch(showResponse);
}

function editBotscore(fields) {
  fetch(`/api/botscores/${fields.id}`, {method: 'PUT', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
    .then(showResponse)
    .catch(showResponse);
}

