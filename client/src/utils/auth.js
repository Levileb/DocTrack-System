import Cookies from "js-cookie";

export const getAuthToken = () => {
  const token = Cookies.get("accessToken");
  console.log("Auth token retrieved:", token ? "Present" : "Missing");
  if (token) {
    console.log("Token length:", token.length);
    console.log("Token starts with:", token.substring(0, 20) + "...");
  }
  return token;
};

export const setAuthToken = (token) => {
  Cookies.set("accessToken", token, {
    secure: true,
    sameSite: "None",
    expires: 1, // 1 day
  });
  console.log("Auth token set:", token ? "Success" : "Failed");
};

export const removeAuthToken = () => {
  Cookies.remove("accessToken");
  console.log("Auth token removed");
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};
