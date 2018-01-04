import * as mongoose from "mongoose";

export interface IUser {
    UPN: String,
    Email: String,
    DisplayName: String,
    LicenseType: String
}

export type UserModel = IUser & mongoose.Document & {
  };
  
const userSchema = new mongoose.Schema({
    UPN: { type: String, unique: true },
    Email: String,
    DisplayName: String,
    LicenseType: String
}, { timestamps: true });

// export const User: UserType = mongoose.model<UserType>('User', userSchema);
const User = mongoose.model<UserModel>("User", userSchema);
export default User;