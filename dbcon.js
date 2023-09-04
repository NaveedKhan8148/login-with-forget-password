const mongoose = require("mongoose");
const dbconection =mongoose.connect('mongodb://127.0.0.1:27017/forget-password-system',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
).then(()=>console.log("connection is sucessfully....."))
.catch((err)=>console.log(err));
module.exports = dbconection;