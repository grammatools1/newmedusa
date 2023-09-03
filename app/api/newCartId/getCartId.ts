// Import necessary modules and setup universal-cookie
import { NextApiRequest, NextApiResponse } from 'next';
import Cookies from 'universal-cookie';

// Define the API route handler as a function
export default (req: NextApiRequest, res: NextApiResponse) => {
  // Create an instance of the universal-cookie library, passing the request headers
  const cookies = new Cookies(req.headers.cookie);

  // Use the cookies instance to get the 'cartId' from cookies
  const cartId = cookies.get('cartId');

  // Now you can send the 'cartId' as a JSON response
  res.status(200).json({ cartId });
};
