import mongoose, {Document, Model} from 'mongoose';

interface IUser extends Document {
  name: string;
  avatar: string;
  email: string;
  role: string;
  date: Date;
}

const userSchema = new mongoose.Schema({
  name: String,
  avatar: String,
  email: String,
  role: String,
  date: {type: Date, default: Date.now},
});

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export const connectMongo = async (): Promise<void> => {
  try {
    const mongoURI: string = process.env.MONGO_URI as string;
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB...');
  } catch (error) {
    console.error('Could not connect to MongoDB!!!', error);
  }
};

connectMongo();

export const createUser = async (
  data: Partial<IUser>
): Promise<IUser | Error> => {
  try {
    const result = await new User({
      ...data,
    }).save();
    return result;
  } catch (error: unknown) {
    console.log(error);
    return error as Error;
  }
};

export const getUsers = async (): Promise<IUser[] | Error> => {
  try {
    const users = await User.find().select({
      name: 1,
      avatar: 1,
      email: 1,
      role: 1,
      date: 1,
      _id: 1,
    });
    return users;
  } catch (error) {
    console.log(error);
    return error as Error;
  }
};

// find by id and update User name and role
export const updateUser = async (
  id: string,
  data: Partial<IUser>
): Promise<IUser | Error | null> => {
  try {
    const result = await User.findByIdAndUpdate(
      id,
      {
        $set: {...data},
      },
      {new: true}
    ); // Add new: true to get the updated document back
    return result;
  } catch (error) {
    console.log(error);
    return error as Error;
  }
};

// delete a user from users
export const deleteUser = async (id: string): Promise<void | Error> => {
  try {
    const result = await User.findByIdAndDelete(id);
    if (!result) {
      throw new Error('User not found');
    }
  } catch (error) {
    console.log(error);
    return error as Error;
  }
};
