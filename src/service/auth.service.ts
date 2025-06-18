import axios from "axios";

export const getProfileDetails = async function () {
  const profileResponse = await axios.get("/api/v0/employee/loggedInUserProfile", {
    withCredentials: true,
    timeout: 5000,
  });
  return profileResponse.data;
};
