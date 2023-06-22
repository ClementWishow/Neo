import mongoose from "mongoose";
const Schema = mongoose.Schema;

const sessionUser = Schema({
  name: String,
  email: String,
  tel: String,
  stack: String,
  remuneration: String,
  mailSend: Boolean,
  enigmesReussies: [String],
  enigmesFailed: [String],
  badges: [String],
  ip: String
});

sessionUser.set("timestamps", true);

export default mongoose.model("sessionUser", sessionUser);
