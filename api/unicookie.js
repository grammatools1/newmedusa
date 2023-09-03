"use server"

import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'universal-cookie';

export default (req: NextApiRequest, res: NextApiResponse) => {
  const cookies = new Cookies(req.headers.cookie); // Parse cookies from the request headers
  const cartId = cookies.get('cartId'); // Get the cartId from cookies

  // Now you can send the cartId as a JSON response
  res.status(200).json({ cartId });
};
