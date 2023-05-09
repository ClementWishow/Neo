import mongoose from "mongoose";
const Schema = mongoose.Schema;

const sessionUser = Schema({
  name: String,
  email: String,
  tel: String,
  stack: String,
  mailSend: Boolean,
});

sessionUser.set("timestamps", true);

export default mongoose.model("sessionUser", sessionUser);
