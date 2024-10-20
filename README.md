# RUN ALL MICROSERVICES IN THE FOLLOW ORDER
```bash



Move to project folder root:
1. Open a terminal for run a micoservice
    cd storage-microservice/src/users 
    Run npm install --force
    Run npm start

2. Open a new terminal for run a micoservice
    cd storage-microservice/src/images 
    npm install --force
    npm start

3. Open a new terminal for run a micoservice
   cd storage-microservice/src/auth 
   npm install --force
   npm start
   
4. Open a new terminal for run a micoservice
   cd storage-microservice/src/gateway 
   npm install --force
   npm start
 
IMPORTANT: THE GATEWAY MICROSERVICES IS THE "ENTRY POINT" 
           OF API REST.
           YOU MUST RUN THIS MICOSERVICE AT LAST       
```

## Project Description

This project provides a scalable and efficient image storage microservice, featuring:

- **Image upload** (with type and size validation).
- **Storage in Firebase Storage**.
- **Image retrieval** via public URLs.
- **Security with JWT authentication** to protect access to the endpoints (Mocked data, not real authentication process required).


### Additional Features (Optional)

- Thumbnail generation (for image resizing).
- Audit logs to track who uploaded which file and when.
- **Redis integration** to cache URLs and improve performance.


   
**.env variables**
- You should update this point to include env names needed.


    
**Final considerations and recomendations**
- Keep it simple.
- Be organized in your code.
- Don't forget to provide the necessary environment variable names needed to run and test the project.
- Good luck :).

   
