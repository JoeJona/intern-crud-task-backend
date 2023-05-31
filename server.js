const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const PersonModel = require("./model/person");
const nodemailer = require("nodemailer");

const app = express();

app.use(cors());
app.use(express.json());


// const MongoDB_URL = 'mongodb+srv://root:3465@cluster0.nypmo.mongodb.net/PersonDB?retryWrites=true&w=majority'
const MongoDB_URL = 'mongodb://127.0.0.1:27017/PersonDB';
const PORT = 5000;
let allUserList = [];
let userList = [];


// MongoDB Connection
mongoose
  .connect(MongoDB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

// Get all user list
app.get("/get-all-users", async (req, res) => {
  try {
    const allUsers = await PersonModel.find();
    allUserList = allUsers;
    res.send(allUsers);
  } catch (error) {
    console.log(error);
  }
});

// Get a user
app.get("/get-user/:userId", async (req, res) => {
  const user = await PersonModel.findById(req.params.userId);
  try {
    if (user == null) {
      res.status(404).send("User Not Found");
    }
    res.send(user);
  } catch (error) {
    console.log(error);
  }
});

// Add User
app.post("/add-user", async (req, res) => {
  const newUser = new PersonModel(req.body);
  try {
    await newUser.save();
    res.status(201).send(newUser);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update User
app.put("/update-user/:userId", async (req, res) => {
  try {
      const user = await PersonModel.findByIdAndUpdate(req.params.userId, req.body);
      if (user == null) {
        res.status(404).send("User Not Found");
      }
    res.status(200).send(user);
  } catch (error) {
    console.log(error);
  }
});

// Remove/Delete User
app.delete("/delete-user/:userId", async (req, res) => {
  const user = await PersonModel.findById(req.params.userId);
  try {
    if (user == null) {
      res.status(404).send("User Not Found");
    }
    await PersonModel.findByIdAndRemove(req.params.userId);
    res.status(200).send("User Deleted Successfully");
  } catch (error) {
    console.log(error);
  }
});

app.post("/send-email", async (req, res) => {
  let send_email = '';
  let start = '';
  let end = '';
  let body = '';
  let selectedUsersList = [];

  try {
    userList = req.body['userList'];
    for(let userId in userList){
      let selectedUsers = allUserList.filter(user => user._id == userList[userId]);
      selectedUsersList.push(selectedUsers[0]);
    }

    start = `
        <style>
          table {
            font-family: arial, sans-serif;
            border-collapse: collapse;
            width: 100%;
          }
          td, th {
            border: 1px solid #dddddd;
            text-align: left;
            padding: 8px;
          }
        </style>
              <table>
                <tr>
                    <th>Name</th>
                    <th>Phone Number</th>
                    <th>Email</th>
                    <th>Hobbies</th>
                </tr>`

    for(let selecterUser in selectedUsersList) {
      body +=
              `
                <tr style="">
                <td>${selectedUsersList[selecterUser]['name']}</td>
                <td>${selectedUsersList[selecterUser]['phoneNumber']}</td>
                <td>${selectedUsersList[selecterUser]['email']}</td>
                <td>${selectedUsersList[selecterUser]['hobbies']}</td>
                </tr>
                `
              }
      
      end = `</table>`

      send_email = `${start} ${body} ${end}`;
      
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
          user: 'joejona124@gmail.com',
          pass: 'djeuxtnqkyyaehmt',
        },
      });
    
      let info = await transporter.sendMail({
        from: 'joejona124@gmail.com',
        to: "joejona124@gmail.com",
        subject: "Users List",
        text: "Selected Users List",
        html: send_email,
      });
    
    res.status(200).send("Email sent Successfully");
  } catch (error) {
    console.log(error);
  }
});

var port = PORT || 5001;

app.listen(port, () => {
  console.log(`Backend Running at ${port}`);
});
