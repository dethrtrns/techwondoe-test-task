import {NextApiRequest, NextApiResponse} from 'next';
import {updateUser} from '../DbHelper/mongoDb';

export default async function updateUserApi(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') {
    return res
      .status(405)
      .json({message: 'Invalid HTTP method for this route'});
  }

  const {id, ...userData} = req.body;
  if (!id) {
    return res.status(400).json({message: 'Missing user ID'});
  }

  try {
    const updatedUser = await updateUser(id, userData);

    if (!updatedUser) {
      return res.status(404).json({message: 'User not found'});
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log('Update user failed:\n', error);
    res
      .status(500)
      .json({message: 'Failed to update user', error: error.message});
  }
}
