/* eslint-disable @typescript-eslint/restrict-template-expressions */

/**
 * Fields is an object mapping the names of the form inputs to the values typed in
 * e.g. for createUser, fields has properites 'username' and 'password'
 */

function viewAllFollows(fields) {
  fetch('/api/follows')
    .then(showResponse)
    .catch(showResponse);
}

function viewFollowsByFollower(fields) {
  fetch(`/api/follows?follower=${fields.follower}`)
    .then(showResponse)
    .catch(showResponse);
}

function viewFollowsByFollowee(fields) {
  fetch(`/api/follows?followee=${fields.followee}`)
    .then(showResponse)
    .catch(showResponse);
}

function createFollow(fields) {
  fetch(`/api/follows/${fields.followee}`, {method: 'POST', body: JSON.stringify(fields), headers: {'Content-Type': 'application/json'}})
    .then(showResponse)
    .catch(showResponse);
}

function deleteFollow(fields) {
  fetch(`/api/follows/${fields.id}`, {method: 'DELETE'})
    .then(showResponse)
    .catch(showResponse);
}
