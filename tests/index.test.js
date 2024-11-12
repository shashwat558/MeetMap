const { default: axios } = require('axios');


const BACKEND_URL = "http://localhost:3000"

describe("Authenticate", () => {
    test("User able to sing in", async () => {
        const username = shashwat + Math.random();
        const password = "123456"

        const res = await axios.post(`${BACKEND_URL}/api/vi/signup`, {
            username: username,
            password: password
        })
        expect(res.statusCode).toBe(200)

        const updatedres = await axios.post(`${BACKEND_URL}/api/vi/signup`, {
            username: username,
            password: password
        })
        expect(res.statusCode).toBe(400)
        
    })
    
    test("User is not able to signup without username", async () => {
        const username = shashwat + Math.random();
        const password = "123456";

        const res = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            password
        })

        expect(res.statusCode).toBe(400)
    })

    test("Singin is succesfull if the username and password is correct", async () => {
        const username = shashwat + Math.random();
        const password = "123456";

         await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password
        })

        const res = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password
               
    })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
    })
    test("singin fails if the username is incorrect", async () => {
        const username = sdjffjdf;
        const password = "123456";

        await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            username,
            password
        });

        const res = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username: "wrongUsername",
            password
        })
        expect(res.status).toBe(403)
    })
})

describe("User metadata endpoints", () => {
    let token = "";
    let avatarId = "";

   
    beforeAll(async() => {
        
        const username = shashwat + Math.random();
        const password = "123456";

        await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username, 
            password,
            type: "admin"
        })

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username, 
            password
        })


        token = response.data.token

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/avatar`, {
            
            "imageUrl": "",
            "name": "Timmy"

        })

        avatarId = avatarResponse.data.imageUrl;

        

        
    })
    test("User can update their metadata with wrong avatar id", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId: "123123123"

        },{
            headers:{
                "authorization": `Bearer ${token}`
            }
        })
        expect(response.status).toBe(400)
    })

    test("User can update their metadata with right avatar id", async () => {
        const response = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`, {
            avatarId

        },{
            headers: {
                "authorization": `Bearer ${token}`
            }
        })
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
        
        const username = shashwat + Math.random();
        const password = "123456";

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username, 
            password,
            type: "admin"
        })
        userId = signupResponse.data.userId;

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username, 
            password
        })


        token = response.data.token

        const avatarResponse = await axios.post(`${BACKEND_URL}/api/v1/avatar`, {
            
            "imageUrl": "",
            "name": "Timmy"

        });
          

        

        
    })

    test("Get back avatar information for a user", async() => {
        const res = await axios.get(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`);
        expect(res.data.avatar.length).toBe(1);
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

describe("Space information", () => {
    let mapId;
    let elementId;
    let element2Id;
    let adminToken;
    let adminId;
    let userId;
    let userToken;

    beforeAll(async() => {
        
        const username = shashwat + Math.random();
        const password = "123456";

        const signupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username, 
            password,
            type: "admin"
        })

       
        userId = signupResponse.data.userId;

        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username, 
            password
        })


        adminToken = response.data.token;

        const userSignupResponse = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username, 
            password,
           
        })

       
        userId = userSignupResponse.data.userId;

        const userResponse = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username, 
            password
        })

        userToken = userResponse.data.token


        adminToken = response.data.token;

        const element1 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageurl": "",
            "width": 1,
            "height": 1,
            "static": true
        },{
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        })  

        const element2 = await axios.post(`${BACKEND_URL}/api/v1/admin/element`, {
            "imageurl": "",
            "width": 1,
            "height": 1,
            "static": true
        },{
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        })  
        elementId = element1.id;
        element2Id = element2.id

        const map = await axios.post(`${BACKEND_URL}/api/v1/admin/map`, {
            
                "thumbnail": "https://thumbnail.com/a.png",
                "dimensions": "100x200",
                "name": "100 person interview room",
                "defaultElements": [{
                        elementId: elementId,
                        x: 20,
                        y: 20
                    }, {
                      elementId: elementId,
                        x: 18,
                        y: 20
                    }, {
                      elementId: element2Id,
                        x: 19,
                        y: 20
                    }, {
                      elementId: element2Id,
                        x: 19,
                        y: 20
                    }
                ]
             
        },{
            headers: {
                authorization: `Bearer ${adminToken}`
            }
        })
        mapId = map.id;
})
   test("User is able to create a space", async() => {
    const res = await axios.post(`${BACKEND_URL}/api/v1/space`, {
       "name": "Test",
       "dimensions": "100x200",
       "mapId": mapId
    })
    expect(res.spaceId).toBeDefined()
   })
   test("User is able to create a space but without mapId (empty space)", async() => {
    const res = await axios.post(`${BACKEND_URL}/api/v1/space`, {
       "name": "Test",
    
       "mapId": mapId
    })
    expect(res.spaceId).toBeDefined()
   })
   test("User is not  able to create a space but without mapId and dimensions(empty space)", async() => {
    const res = await axios.post(`${BACKEND_URL}/api/v1/space`, {
       "name": "Test",
    
      
    })
    expect(res.status).toBe(400) 
   })
   test("User is not  able to delete a space that doesn't exist", async() => {
    const res = await axios.delete(`${BACKEND_URL}/api/v1/space/randomIdDoesntExist`, {
       "name": "Test",
    
    })
    expect(res.status).toBe(400)
   })
   test("User is able to delete a space that doesn exist", async() => {
    const res = await axios.post(`${BACKEND_URL}/api/v1/space`, {
       "name": "Test",
       dimensions: "100x200",
    
    },{
        authorization: `Bearer ${userToken}`
    })
    const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${res.data.spaceId}`,{
        headers:{
            authorization: `Bearer ${userToken}`
        }
    })
    expect(deleteResponse.status).toBe(200)
   })
   
   test("User should not be able to delete a space created by someone else",async() => {
    const res = await axios.post(`${BACKEND_URL}/api/v1/space`, {
        "name": "Test",
        dimensions: "100x200",
     
     },{
         authorization: `Bearer ${userToken}`
     })
     const deleteResponse = await axios.delete(`${BACKEND_URL}/api/v1/space/${res.data.spaceId}`,{
         headers:{
             authorization: `Bearer ${adminToken}`
         }
     })
     expect(deleteResponse.status).toBe(400)
    });
   test("Admin has no spaces intially ", async() => {
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`,{
        headers: {
            authorization: `Bearer ${adminToken}`
        }
   });
    expect(response.data.spaces.length).toBe(0);
   })
   test("Admin has no spaces intially ", async() => {
    const spaceCreateResponse = await axios.post(`${BACKEND_URL}/api/v1/space/all`,{
        "name": "Test",
        "dimension": "!00x200"
    },{
        headers: {
            authorization: `Bearer ${adminToken}`
        }
    });
    const response = await axios.get(`${BACKEND_URL}/api/v1/space/all`,{
        headers: {
            authorization: `Bearer ${adminToken}`
        }
   }); 
    const filteredResponse = response.data.spaces.find(x => x.id == spaceCreateResponse.spaceId);
    expect(response.data.spaces.length).toBe(1)
    
   })

})