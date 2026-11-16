import { BACKEND_URL } from "./Helper";
import { commanrequest } from "./ApiCall";

export const signup = async (data) => {
  return await commanrequest("POST", `${BACKEND_URL}/auth/signup`, data);
};
// http://localhost:3002/signup

// export const forgetpassword = async(data) => {
//     return axios.post('http://localhost:3000/forgetpassword', data)
// }
