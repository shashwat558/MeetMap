const { default: axios } = require('axios');
const sum = require('./index');

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});

const BACKEND_URL = "http://localhost:3000"

describe("Authenticate", () => {
    test("User able to sing in", () => {
        const username = shashwat + Math.random();
        const password = "123456"

        axios.post(BACKEND_URL + "/api/vi/user/signup", {
            username: username,
            password: password
        })
    })
})