import mongoose from "mongoose";

//we create an async function to connect to our database and also export it to be used anywhere else in our backend.
// export const connectMongo = async () =>
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDb..."))
  .catch((err) => console.error("Could not connect to MongoDb!!!", err));

// mongoose.connection.close()-->to close the connection!

// Define the Schema for your model(collection in layman's terms(mongoDb's terms)!!!) like below--->
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: String,
    required: true,
  },
  sex: {
    type: String,
    required: true,
  },
  mobile: String,
  idType: String,
  govtId: String,
  gaurdian: String,
  email: String,
  emergencyContact: String,
  address: String,
  state: String,
  city: String,
  country: String,
  pincode: String,
  occupation: String,
  religion: String,
  maritalStatus: String,
  bloodGroup: String,
  nationality: String,
  date: { type: Date, default: Date.now }, //<--note that this value if not provided, will automatically be added by mongodb.
}); //this is basically like a blueprint of how each document of your collection should look like.

// now we create a model by specifying the name of the model as first argument and the above schema as the second argument.
//**note that we name the model here with Capitalized notation and also singular but mongoose will create a collection in your database automatically and name it in small letters and also pluralize it.we can check this on the gui of atlas or compass to see what happens)
export const User = mongoose.models.User || mongoose.model("User", userSchema);
//This...^... now contains a pointer to your collection now.
//you can perform queries, add, delete etc using this.
//note that you could export this model from here and import it anywhere in any file and perform any operations on this collection/model.

/*#-->now as all operations with the database are async,
   So generally we follow this approach to create async functions for anything we want to do
   #->note that we typically send the response back wherever you see the console log. it's for testing and debugging purposes.
   for logging we don't typically use console log in production
   -->we often use third party logging services such as winston.
*/

//here we add a new document(user) to the model(collection of users).
export const createUser = async (data) => {
  try {
    const result = await new User({
      ...data,
    }).save();
    // console.log(result);
    return result; //<--this is where we typically send back the response. and here the response from mongodb is an intance of the user just created in database.
  } catch (error) {
    console.log(error);
    return error;
  }
};

//this is to get all the documents in this collection.
//yeah that's right, you can chain all this type of methods(and many more...check out the docs!) to refine or modify the returned result.
export const getUsers = async () => {
  try {
    const Users = await User.find().select({
      name: 1,
      age: 1,
      sex: 1,
      mobile: 1,
      address: 1,
      idType: 1,
      govtId: 1,
      gaurdian: 1,
      nationality: 1,
      _id: 1,
    });
    // .sort({ date: 1 })
    // console.log(Users);
    return Users;
  } catch (error) {
    console.log(error);
    return error;
  }
};
