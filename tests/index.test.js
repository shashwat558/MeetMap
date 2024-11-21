const axios2 = require('axios');


const BACKEND_URL = "http://localhost:3000"
const WS_URL = "ws:localhost:3001"

const axios = {
    post: async (...args) => {
        try {
            const res = await axios2.post(...args)
            return res
        } catch(e) {
            return e.response
        }
    },
    get: async (...args) => {
        try {
            const res = await axios2.get(...args)
            return res
        } catch(e) {
            return e.response
        }
    },
    put: async (...args) => {
        try {
            const res = await axios2.put(...args)
            return res
        } catch(e) {
            return e.response
        }
    },
    delete: async (...args) => {
        try {
            const res = await axios2.delete(...args)
            return res
        } catch(e) {
            return e.response
        }
    },
}

describe("Authenticate", () => {
    test('User is able to sign up only once', async () => {
        const username = "kirat" + Math.random(); // kirat0.12331313
        const password = "123456";
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })

        expect(response.status).toBe(200)
        const updatedResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        })

        expect(updatedResponse.status).toBe(400);
    });

    test('Signup request fails if the username is empty', async () => {
        const username = `kirat-${Math.random()}` // kirat-0.12312313
        const password = "123456"

        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            password
        })

        expect(response.status).toBe(400)
    })

    test('Signin succeeds if the username and password are correct', async() => {
        const username = `kirat-${Math.random()}`
        const password = "123456"

        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "admin"
        });

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
        });

        expect(response.status).toBe(200)
        expect(response.data.token).toBeDefined()
        
    })
    test("Signin fails if the username is incorrect", async () => {
        const username = "nonExistentUser";
        const password = "123456456";

        try {
            await axios.post(`${BACKEND_URL}/api/v1/signin`, { username, password });
        } catch (err) {
            expect(err.response.status).toBe(403);
            expect(err.response.data.message).toBe("Invalid credentials");
        }
    });
})

describe("User metadata endpoints", () => {
    let token = "";
    let avatarId = "";

   
    
        
    beforeAll(async () => {
        const username = `kirat-${Math.random()}`
        const password = "123456"
 
        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
         username,
         password,
         type: "admin"
        });
 
        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
         username,
         password
        })
 
        token = response.data.token
        console.log(token)
 
        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
             "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
             "name": "Timmy"
         }, {
             headers: {
                 authorization: `Bearer ${token}`
             }
         })
         console.log("avatarresponse is " + avatarResponse.data.id)
 
         avatarId = avatarResponse.data.id;
         console.log("yaha tak sahi hai")
 
     })
    test("User cannot  update their metadata with wrong avatar id", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId: "123123123adsfaf"

        },{
            headers:{
                authorization: `Bearer ${token}`
            }
        })
        expect(response.status).toBe(400)
    })

    test("User can update their metadata with right avatar id", async () => {
        console.log("1")
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId

        },{
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        console.log("this is token", token)
        console.log("2")
        console.log(response.data)
        expect(response.status).toBe(200)
    })
    
    test("User cannot  update their metadata if the auth header is not present", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId

        })
        expect(response.status).toBe(403)

})
})

describe("User avatar information", () => {
      let avatarId;
      let token;
      let userId;
      beforeAll(async() => {
        
        const username = "shashwat" + Math.random();
        const password = "123456";

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username, 
            password,
            type: "admin"
        })
        userId = signupResponse.data.userId;
        console.log(userId + "this is userId")

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username, 
            password
        })


        token = response.data.token

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/avatar`, {
            
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"

        },{
            headers:{
                authorization: `Bearer ${token}`
            }
        });
        avatarId = avatarResponse.data.id;
          

        

        
    })

    test("Get back avatar information for a user", async() => {
        const res = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`);
        expect(res.data.avatars.length).toBe(1);
        expect(res.data.avatar[0].userId).toBeDefined()
        expect(res.data.avatar[0].userId).toBe(userId)

    })
    test("Availaible avatar list the recently created avatar", async () => {
        const response = await axios.get(`${BACKEND_URL}/api/v1/avatars`);
        expect(response.data.avatars.length).not.to(0);
        const currentAvatar = response.data.avatars.find(x => x.id == avatarId);
        expect(currentAvatar).toBeDefined();
    })
})

// describe("Space information", () => {
//     let mapId;
//     let elementId;
//     let element2Id;
//     let adminToken;
//     let adminId;
//     let userId;
//     let userToken;

//     beforeAll(async() => {
        
//         const username = shashwat + Math.random();
//         const password = "123456";

//         const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
//             username, 
//             password,
//             type: "admin"
//         })

       
//         userId = signupResponse.data.userId;

//         const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
//             username, 
//             password,
//             type: "User"
//         })


//         adminToken = response.data.token;

//         const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
//             username, 
//             password,
           
//         })

       
//         userId = userSignupResponse.data.userId;

//         const userResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
//             username, 
//             password
//         })

//         userToken = userResponse.data.token


//         adminToken = response.data.token;

//         const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
//             "imageurl": "",
//             "width": 1,
//             "height": 1,
//             "static": true
//         },{
//             headers: {
//                 authorization: `Bearer ${adminToken}`
//             }
//         })  

//         const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
//             "imageurl": "",
//             "width": 1,
//             "height": 1,
//             "static": true
//         },{
//             headers: {
//                 authorization: `Bearer ${adminToken}`
//             }
//         })  
//         elementId = element1Response.data.id;
//         element2Id = element2Response.data.id

//         const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            
//                 "thumbnail": "https://thumbnail.com/a.png",
//                 "dimensions": "100x200",
//                 "name": "100 person interview room",
//                 "defaultElements": [{
//                         elementId: elementId,
//                         x: 20,
//                         y: 20
//                     }, {
//                       elementId: elementId,
//                         x: 18,
//                         y: 20
//                     }, {
//                       elementId: element2Id,
//                         x: 19,
//                         y: 20
//                     }, {
//                       elementId: element2Id,
//                         x: 19,
//                         y: 20
//                     }
//                 ]
             
//         },{
//             headers: {
//                 authorization: `Bearer ${adminToken}`
//             }
//         })
//         mapId = mapResponse.data.id;
// })
//    test("User is able to create a space", async() => {
//     const res = await axios.post(`${BACKEND_URL}/api/v1/space`, {
//        "name": "Test",
//        "dimensions": "100x200",
//        "mapId": mapId
//     })
//     expect(res.spaceId).toBeDefined()
//    })
//    test("User is able to create a space but without mapId (empty space)", async() => {
//     const res = await axios.post(`${BACKEND_URL}/api/v1/space`, {
//        "name": "Test",
    
//        "mapId": mapId
//     })
//     expect(res.spaceId).toBeDefined()
//    })
//    test("User is not  able to create a space but without mapId and dimensions(empty space)", async() => {
//     const res = await axios.post(`${BACKEND_URL}/api/v1/space`, {
//        "name": "Test",
    
      
//     })
//     expect(res.status).toBe(400) 
//    })
//    test("User is not  able to delete a space that doesn't exist", async() => {
//     const res = await axios.delete(`${BACKEND_URL}/api/v1/space/randomIdDoesntExist`, {
//        "name": "Test",
    
//     })
//     expect(res.status).toBe(400)
//    })
//    test("User is able to delete a space that doesn exist", async() => {
//     const res = await axios.post(`${BACKEND_URL}/api/v1/space`, {
//        "name": "Test",
//        dimensions: "100x200",
    
//     },{
//         authorization: `Bearer ${userToken}`
//     })
//     const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${res.data.spaceId}`,{
//         headers:{
//             authorization: `Bearer ${userToken}`
//         }
//     })
//     expect(deleteResponse.status).toBe(200)
//    })
   
//    test("User should not be able to delete a space created by someone else",async() => {
//     const res = await axios.post(`${BACKEND_URL}/api/v1/space`, {
//         "name": "Test",
//         dimensions: "100x200",
     
//      },{
//          authorization: `Bearer ${userToken}`
//      })
//      const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${res.data.spaceId}`,{
//          headers:{
//              authorization: `Bearer ${adminToken}`
//          }
//      })
//      expect(deleteResponse.status).toBe(400)
//     });
//    test("Admin has no spaces intially ", async() => {
//     const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`,{
//         headers: {
//             authorization: `Bearer ${adminToken}`
//         }
//    });
//     expect(response.data.spaces.length).toBe(0);
//    })
//    test("Admin has no spaces intially ", async() => {
//     const spaceCreateResponse = await axios.post(`${BACKEND_URL}/api/v1/space/all`,{
//         "name": "Test",
//         "dimension": "!00x200"
//     },{
//         headers: {
//             authorization: `Bearer ${adminToken}`
//         }
//     });
//     const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`,{
//         headers: {
//             authorization: `Bearer ${adminToken}`
//         }
//     }); 
//     const filteredResponse = response.data.spaces.find(x => x.id == spaceCreateResponse.spaceId);
//     expect(response.data.spaces.length).toBe(1)
//     expect(filteredResponse).toBeDefined();
    
//    })


// })

// describe("Arena endpoints", () => {
//     let mapId;
//     let elementId;
//     let element2Id;
//     let adminToken;
//     let adminId;
//     let userId;
//     let userToken;
//     let spaceId;

//     beforeAll(async() => {
        
//         const username = shashwat + Math.random();
//         const password = "123456";

//         const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
//             username, 
//             password,
//             type: "admin"
//         })

       
//         userId = signupResponse.data.userId;

//         const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
//             username, 
//             password,
            
//         })


//         adminToken = response.data.token;

//         const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
//             username: username + "-user", 
//             password,
//             type: "user"
           
//         })

       
//         userId = userSignupResponse.data.userId;

//         const userResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
//             username: username + "-user", 
//             password
//         })

//         userToken = userResponse.data.token


//         adminToken = response.data.token;

//         const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
//             "imageurl": "",
//             "width": 1,
//             "height": 1,
//             "static": true
//         },{
//             headers: {
//                 authorization: `Bearer ${adminToken}`
//             }
//         })  

//         const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
//             "imageurl": "",
//             "width": 1,
//             "height": 1,
//             "static": true
//         },{
//             headers: {
//                 authorization: `Bearer ${adminToken}`
//             }
//         })  
//         elementId = element1Response.data.id;
//         element2Id = element2Response.data.id

//         const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            
//                 "thumbnail": "https://thumbnail.com/a.png",
//                 "dimensions": "100x200",
//                 "name": "100 person interview room",
//                 "defaultElements": [{
//                         elementId: elementId,
//                         x: 20,
//                         y: 20
//                     }, {
//                       elementId: elementId,
//                         x: 18,
//                         y: 20
//                     }, {
//                       elementId: element2Id,
//                         x: 19,
//                         y: 20
//                     }, {
//                       elementId: element2Id,
//                         x: 19,
//                         y: 20
//                     }
//                 ]
             
//         },{
//             headers: {
//                 authorization: `Bearer ${adminToken}`
//             }
//         })
//         mapId = mapResponse.data.id;

//         const spaceResponse = await axios.post(`${BACKEND_URL}/api/v1/space/`, {
//             "name": "Test",
//             "dimensions": "100x200",
//             "mapId": mapId
//         },{
//             headers: {
//                 authorization: `Bearer ${userToken}`
//             }
//         })
//         spaceId = spaceResponse.data.spaceId
        
// })
//        test("Incorrect spaceId returns 400", async () => {
//         const res = await axios.get(`${BACKEND_URL}/api/v1/space/123Kfhsdkh`,{
//             headers: {
//                 'autorization': `Bearer ${userToken}`
//             }
//         });
//         expect(res.status).toBe(400)

//        })

//        test("correct spaceId returns all the elements", async () => {
//         const res = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,{
//             headers: {
//                 'autorization': `Bearer ${userToken}`
//             }
//         });
//         expect(res.dimensions).toBe("100x200")
//         expect(res.data.elements.length).toBe(3) 


//        })

//        test("delete endpoint is able to delete an element", async () => {
//         const elementRes = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,{
//             headers: {
//                 'autorization': `Bearer ${userToken}`
//             }
//         })
//         await axios.delete(`${BACKEND_URL}/api/v1/space/element`,{
//             spaceId: spaceId,
//             elementId: elementRes.data.elements[0].id
//         },{
//             headers: {
//                 'autorization': `Bearer ${userToken}`
//             }
//         });

//         const newResponse = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,{
//             headers: {
//                 'autorization': `Bearer ${userToken}`
//             }
//         })

//         expect(newResponse.data.elements.length).toBe(2)


//        }) 
//        test("adding an element works as expected", async () => {
        
//         await axios.post(`${BACKEND_URL}/api/v1/space/element`,{
//             spaceId: spaceId,
//             elementId: elementId,
//             "x": 50,
//             "y": 20

//         },{
//             headers: {
//                 'autorization': `Bearer ${userToken}`
//             }
//         });

        

//         expect(newResponse.data.elements.length).toBe(3)


//        }) 
//        test("adding an element if element lies outside the dimensions", async () => {
        
//         await axios.post(`${BACKEND_URL}/api/v1/space/element`,{
//             spaceId: spaceId,
//             elementId: elementId,
//             "x": 1000,
//             "y": 1323344

//         },{
//             headers: {
//                 'autorization': `Bearer ${userToken}`
//             }
//         });

        

//         expect(newResponse.statusCode).toBe(400)


//        }) 
// })

// describe("Create an element", () => {

//     let adminToken;
//     let adminId;
//     let userId;
//     let userToken;
    

//     beforeAll(async() => {
        
//         const username = shashwat + Math.random();
//         const password = "123456";

//         const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
//             username, 
//             password,
//             type: "admin"
//         })

       
//         userId = signupResponse.data.userId;

//         const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
//             username, 
//             password,
            
//         })


//         adminToken = response.data.token;

//         const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
//             username: username + "-user", 
//             password,
//             type: "user"
           
//         })

       
//         userId = userSignupResponse.data.userId;

//         const userResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
//             username: username + "-user", 
//             password
//         })

//         userToken = userResponse.data.token


//         adminToken = response.data.token;

        
        

       
        
// })
//   test("User is not able to hit admin endpoint", async () => {
//     const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
//         "imageurl": "",
//         "width": 1,
//         "height": 1,
//         "static": true
//     },{
//         headers: {
//             authorization: `Bearer ${userToken}`
//         }
//     })  

//     expect(element1Response.status).toBe(403)

  

//     const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
        
//             "thumbnail": "https://thumbnail.com/a.png",
//             "dimensions": "100x200",
//             "name": "100 person interview room",
//             "defaultElements": []
         
//     },{
//         headers: {
//             authorization: `Bearer ${userToken}`
//         }
//     })
//     const createAvatarResponse = await axios.post(`${BACKEND_URL}/api/v1/avatar`, {
        
//         "imageUrl": "image",
//         "name": "Timmy"
     
// },{
//     headers: {
//         authorization: `Bearer ${userToken}`
//     }

    
// })
//     const updateElementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element/123`, {
        
//     "imageUrl": "image",
//     "name": "Timmy"
 
// },{
//      headers: {
//      authorization: `Bearer ${userToken}`
// }


// })
   
//     expect(element1Response.status).toBe(403)
//     expect(mapResponse.status).toBe(403)
//     expect(createAvatarResponse.status).toBe(403)
//     expect(updateElementResponse .status).toBe(403)



//   })
  
//   test("Admin is able to hit admin endpoint", async () => {
//     const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
//         "imageurl": "",
//         "width": 1,
//         "height": 1,
//         "static": true
//     },{
//         headers: {
//             authorization: `Bearer ${adminToken}`
//         }
//     })  

//     expect(element1Response.status).toBe(403)

  

//     const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
        
//             "thumbnail": "https://thumbnail.com/a.png",
//             "dimensions": "100x200",
//             "name": "100 person interview room",
//             "defaultElements": []
         
//     },{
//         headers: {
//             authorization: `Bearer ${adminToken}`
//         }
//     })
//     const createAvatarResponse = await axios.post(`${BACKEND_URL}/api/v1/avatar`, {
        
//         "imageUrl": "image",
//         "name": "Timmy"
     
// },{
//     headers: {
//         authorization: `Bearer ${adminToken}`
//     }

    
// })
   
   
//     expect(element1Response.status).toBe(200)
//     expect(mapResponse.status).toBe(200)
//     expect(createAvatarResponse.status).toBe(200)
   



//   })

//   test("Admin is able to update the imageUrl for an element", async () => {

//     const elementRes = await axios.get(`${BACKEND_URL}/api/v1/space/${spaceId}`,{
//         headers: {
//             'autorization': `Bearer ${adminToken}`
//         }
//     })
//     {
//         const updateElementResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/element/${elementResponse.data.id}`, {
        
//             "imageUrl": "image",
//             "name": "Timmy"
         
//         },{
//              headers: {
//              authorization: `Bearer ${adminToken}`
//         }
        
        
//         })
//         expect(updateElementResponse.status).toBe(200)
//     }
//   })

  



  

// })


// describe("Websocket tests", () => {
//     let element1Id;
//     let element2Id;
//     let mapId;
//     let spaceId;

//     let adminToken;
//     let adminUserId;
//     let userToken;
//     let userId;
//     let ws1;
//     let ws2;
//     let ws1Messages = [];
//     let ws2Messages = [];
//     let userX;
//     let userY;
//     let adminX;
//     let adminY;
//     function waitForAndPopLatestMessage(messageArray) {
//         return new Promise(r => {
//             if( messageArray.length > 0){
//                  return messageArray.shift()
//             }else {
//                 let interval = setTimeout(() => {
//                     if(messageArray.length > 0){
//                         resolve(messageArray.shift())
//                         clearInterval(interval)
//                     }
//                 }, 100)
//             }
//         })
//     }

//     async function setUpHTTP(){
//         const username = `shashwat-${Math.random()}`;
//         const password = '12344565'

//         const adminSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
//             username,
//             password,
//             role: "admin"
//         })
//         const adminSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
//             username,
//             password
//         })

//         adminUserId = adminSignupResponse.data.userId

//         adminToken = adminSigninResponse.data.token;

        

//         const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
//             username: username + "-user",
//             password,
            
//         })
//         const userSigninResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
//             username: username + "-user",
//             password
//         })

//         userId = userSignupResponse.data.userId

//         userToken = userSigninResponse.data.token;

//         const element1Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
//             "imageurl": "",
//             "width": 1,
//             "height": 1,
//             "static": true
//         },{
//             headers: {
//                 authorization: `Bearer ${adminToken}`
//             }
//         })  

//         const element2Response = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
//             "imageurl": "",
//             "width": 1,
//             "height": 1,
//             "static": true
//         },{
//             headers: {
//                 authorization: `Bearer ${adminToken}`
//             }
//         })  
//         element1Id = element1Response.data.id;
//         element2Id = element2Response.data.id

//         const mapResponse = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            
//                 "thumbnail": "https://thumbnail.com/a.png",
//                 "dimensions": "100x200",
//                 "name": "100 person interview room",
//                 "defaultElements": [{
//                         elementId: element1Id,
//                         x: 20,
//                         y: 20
//                     }, {
//                       elementId: element1Id,
//                         x: 18,
//                         y: 20
//                     }, {
//                       elementId: element2Id,
//                         x: 19,
//                         y: 20
//                     }, {
//                       elementId: element2Id,
//                         x: 19,
//                         y: 20
//                     }
//                 ]
             
//         },{
//             headers: {
//                 authorization: `Bearer ${adminToken}`
//             }
//         })
//         mapId = mapResponse.data.id;

//         const spaceResponse = await axios.post(`${BACKEND_URL}/api/v1/space/`, {
//             "name": "Test",
//             "dimensions": "100x200",
//             "mapId": mapId
//         },{
//             headers: {
//                 authorization: `Bearer ${userToken}`
//             }
//         })
//         spaceId = spaceResponse.data.spaceId
//     }


//     async function setUpWs(){
        
//         ws1 = new WebSocket(WS_URL);
        

//         await new Promise(r => {
//             ws1.onopen = r
//         })
//         ws1.onmessage = (event) => {
//             ws1Messages.push(JSON.parse(event.data))
//         }

//         ws2 = new WebSocket(WS_URL);

//         await new Promise(r => {
//             ws2.onopen = r
//         })

       
//         ws2.onmessage = (event) => {
//             ws2Messages.push(JSON.parse(event.data))
//         }

//         ws1.send(JSON.stringify({
//             "type":"join",
//             "payload":{
//                 "spaceId": spaceId,
//                 "token": adminToken
//             }
//         }))
//         ws2.send(JSON.stringify({
//             "type":"join",
//             "payload":{
//                 "spaceId": spaceId,
//                 "token": userToken
//             }
//         }))
        
        
        
        
//     }

//     beforeAll(async() => {
//         setUpHTTP()
//         setUpWs()
        
        

    
// })
//   test("Get back ack for joining the space", async () => {
//     ws1.send(JSON.stringify({
//         "type":"join",
//         "payload":{
//             "spaceId": spaceId,
//             "token": adminToken
//         }
//     }))
//     const message1 = await waitForAndPopLatestMessage(ws1Messages);

//     ws2.send(JSON.stringify({
//         "type":"join",
//         "payload":{
//             "spaceId": spaceId,
//             "token": userToken
//         }
//     }))

//     const message2 = await waitForAndPopLatestMessage(ws2Messages);
//     const message3 = await waitForAndPopLatestMessage(ws2Messages);


//     expect(message1.type).toBe("space-joined")
//     expect(message2.type).toBe("space-joined")

//     expect(message1.payload.users.length).toBe(0)
//     expect(message2.payload.users.length).toBe(1)
//     expect(message3.type).toBe("user-join");
//     expect(message3.payload.spawn.x).toBe(message2.payload.spawn.x);
//     expect(message3.payload.spawn.y).toBe(message2.payload.spawn.y);
//     expect(message3.payload.userId).toBe(userId);






//     adminX = message1.payload.spawn.x
//     adminY = message1.payload.spawn.y

//     userX = message2.payload.spawn.x
//     userY = message2.payload.spawn.y
//   })

//   test("User should not be able to move across the boundary of the wall", async() => {
//     ws1.send(JSON.stringify({
//         type: "movement",
//         payload:{
//             x: 100000,
//             y: 1000000,
//         }
//     }))

//     const message = await waitForAndPopLatestMessage(ws1Messages)
//     expect(message.type).toBe("movement-rejected");
//     expect(message.payload.x).toBe(adminX);
//     expect(message.payload.y).toBe(adminY);
//   })

//   test("User should not be able to move two blocks at the same time",  async() => {
//     ws1.send(JSON.stringify({
//         type: "movement",
//         payload:{
//             x: adminX + 2,
//             y: adminY,
//         }
//     }))

//     const message = await waitForAndPopLatestMessage(ws1Messages)
//     expect(message.type).toBe("movement-rejected");
//     expect(message.payload.x).toBe(adminX);
//     expect(message.payload.y).toBe(adminY);
//   })
//   test("correct movement should be broadcasted", async() => {
//     ws1.send(JSON.stringify({
//         type: "movement",
//         payload:{
//             x: adminX + 1,
//             y: adminY,
//             userId: adminUserId
//         }
//     }))

//     const message = await waitForAndPopLatestMessage(ws1Messages)
//     expect(message.type).toBe("movement");
//     expect(message.payload.x).toBe(adminX + 1);
//     expect(message.payload.y).toBe(adminY);
//   })
//   test("if a user leaves the other user receives a leave event", async() => {
//     ws1.close()

//     const message = await waitForAndPopLatestMessage(ws1Messages)
//     expect(message.type).toBe("user-left");
//     expect(message.payload.userId).toBe(adminUserId);
   
//   })
// })
