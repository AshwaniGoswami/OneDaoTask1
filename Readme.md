First install the necessary node modules using "npm install command" in the application directory.

Then edit the .env file details according to your setup for db connection and smtp details. For time being smtp is set to my smtp:


db_host=localhost
db_port=5432
db_name=postgres
db_username=postgres
db_password="My Password"
JWT_SECRET="MYSuperSecret"
MAIL_USER="use your smtp username"
MAIL_PASS="your smtp password "


then start the server using "nodemon app.js" or "node app.js" command 

API EndPoints Details:

Note: Only Signup and login endpoint not using authorization header. Rest endpoint will use authorization header else no data will be displayed.
You can get authorization token by login and then pass it on other endpoints


  USer Endpoints:

  #########
  Signup Endpoint:
    http://localhost:3000/api/signup
    method: POST
    Expecting data in this format:
      {
  "email": "testUSer@gmail.com",
  "password": "SecurePass123!"
 
}


####
Login Endpoint:
    http://localhost:3000/api/login
    method: POST
    Expecting data in this format:
      {
  "email": "testUSer@gmail.com",
  "password": "SecurePass123!"
 
}


### 
Get Users By Country:
http://localhost:3000/api/users/country/:country
method: GET
Here in place of :country use country name.


### 
Sending otp endpoint:
http://localhost:3000/api/otp
Method : POST
Will take email as input in json body. 
helpful to send otp seprately if otp is deleted by user


### 
Verifying OTP endpoint:

http://localhost:3000/api/otp/verify
Method : POST
Wil take email and otp as json body:
{
    "email":"testUser@gmail.com",
    "otp":"145213"
}



 Product Endpoints:
 ############
   Add a product: http://localhost:3000/api/products
   method: POST
     expecting data Sample (Left value is key and right is the value of that key) : 
     {
  "carComfort": "Normal",
  "startLocation": "New York",
  "endLocation": "Los Angeles",
  "price": 1150.00
}
##############
  Edit a product: 
   http://localhost:3000/api/products/edit/:id
   method: PUT
   expecting data in body of json:
    {
     "carComfort": "Normal",
  "startLocation": "New York",
  "endLocation": "Los Angeles",
  "price": 1150.00
}

###########
Get all products:
 http://localhost:3000/api/products
 method: GET
 can use page and limit in query params to control pagination and data offset

 ################
 Delete a product:
  http://localhost:3000/api/products/:id
  method:DELETE
