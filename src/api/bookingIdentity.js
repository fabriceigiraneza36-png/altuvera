const API_BASE = import.meta.env.VITE_API_URL || "https://backend-jd8f.onrender.com/api";
const TOKEN_KEY = "altuvera_auth_token";
const token = () => localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || "";

const call = async (url, options={}) => {
  const res=await fetch(API_BASE+url,{...options,headers:{Authorization:"Bearer "+token(),...(options.headers||{})}});
  const data=await res.json().catch(()=>({}));
  if(!res.ok) throw new Error(data?.message||data?.error||"Request failed");
  return data;
};
export const bookingIdentityAPI={
  request:(id)=>call("/booking-identity/"+id+"/request",{method:"POST"}),
  get:(id)=>call("/booking-identity/"+id),
  upload:(id,file)=>{
    const form=new FormData(); form.append("portrait",file);
    return call("/booking-identity/"+id+"/upload",{method:"POST",body:form});
  },
  confirm:(id)=>call("/booking-identity/"+id+"/confirm",{method:"POST"})
};
export default bookingIdentityAPI;
