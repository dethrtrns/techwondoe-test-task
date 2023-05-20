/**
 *
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */

import { connectMongo, getUsers } from "@/DbHelper/mongoDb";

export default async function addUser(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json("inValid HTTP method for this route");
  }

  try {
    // await connectMongo();
    const allUsers = await getUsers();
    // console.log("fetched all the users in users collection:-\n" + allUsers);
    res.status(200).json(allUsers);
  } catch (error) {
    console.log("failed to fetch users:-\n" + error);
    res.status(500).json(error);
  }
}
