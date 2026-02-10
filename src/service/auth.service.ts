import axios from "axios";

export const getProfileDetails = async function () {
  const profileResponse = await axios.get(
    "/api/v0/employee/loggedInUserProfile",
    {
      withCredentials: true,
      timeout: 5000,
    }
  );
  return profileResponse.data;
};

export const selectRole = async function (roleId: string) {
  const response = await axios.post(
    "/api/v0/employee/switch-role",
    {
      roleId: roleId, // Backend expects 'roleId' field
    },
    {
      withCredentials: true,
      timeout: 10000,
    }
  );
  return response.data;
};

export const createLogin = async function (email: string, password: string) {
  const response = await axios.post("/api/v0/employee/login", {
    email: email,
    password: password,
  });
  return response.data;
};
