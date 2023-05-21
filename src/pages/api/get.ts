import {NextApiRequest, NextApiResponse} from 'next';
import {getUsers} from '../../DbHelper/mongoDb';

export default async function getUsersHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json('Invalid HTTP method for this route');
  }

  try {
    // await connectMongo();
    const allUsers = await getUsers();
    // console.log("fetched all the users in users collection:\n", allUsers);
    res.status(200).json(allUsers);
  } catch (error) {
    console.log('failed to fetch users:\n', error);
    res.status(500).json(error);
  }
}
