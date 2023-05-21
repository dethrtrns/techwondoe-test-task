import {NextApiRequest, NextApiResponse} from 'next';
import {deleteUser} from '../../DbHelper/mongoDb';

export default async function deleteUserApi(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res
      .status(405)
      .json({message: 'Invalid HTTP method for this route'});
  }

  const id = req.query.id as string;
  // console.log(id);
  if (!id) {
    return res.status(400).json({message: 'Missing user ID'});
  }

  try {
    await deleteUser(id);
    res.status(200).json({message: 'User deleted successfully'});
  } catch (error) {
    if (error instanceof Error) {
      console.log('Delete user failed:\n', error);
      res
        .status(500)
        .json({message: 'Failed to delete user', error: error.message});
    } else {
      res
        .status(500)
        .json({message: 'Failed to delete user', error: 'Unexpected error'});
    }
  }
}
