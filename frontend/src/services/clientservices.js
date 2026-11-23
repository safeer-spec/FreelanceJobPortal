import { axiosInstance } from "../axios/axiosinstance";

export const listCourses = () =>
  axiosInstance.get("/course/listcourse");

export const userSignup = (data) =>
  axiosInstance.post("/user/register", data, { withCredentials: true });

export const userLogin = (data) =>
  axiosInstance.post("/user/login", data, { withCredentials: true });

export const userLogout = () =>
  axiosInstance.post("/user/logout", {}, { withCredentials: true });

export const addtocart = (courseId) =>
  axiosInstance.post("/cart/addtocart/" + courseId, {}, { withCredentials: true });

export const listCources = listCourses;