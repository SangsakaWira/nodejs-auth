const mongoose = require("mongoose")

mongoose.connect("mongodb://localhost/shop-app",{
    useCreateIndex:true
})


