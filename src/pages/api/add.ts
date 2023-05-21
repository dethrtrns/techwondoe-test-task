import {NextApiRequest, NextApiResponse} from 'next';
import {createUser} from '../DbHelper/mongoDb';

export default async function addUser(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json('Invalid HTTP method for this route');
  }

  try {
    const user = req.body;
    // await connectMongo();
    const newUser = await createUser(user);
    console.log('new user created in Db:\n', newUser);
    res.status(201).json(newUser);
  } catch (error) {
    console.log('failed:\n', error);
    res.status(500).json(error);
  }
}
