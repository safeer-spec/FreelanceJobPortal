import axios from "axios"

const url = import.meta.env.VITE_BASE_UTL 
console.log(url  , "baseURL")


const axiosInstance = axios.create({
    baseURL : url, 
    //cookies
    withCredentials : true
})



export {axiosInstance}