import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { platformLogin } from "../../api/platform";

const PlatformLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const submit = async (event) => {
    event.preventDefault(); setLoading(true);
    try {
      const { data } = await platformLogin(form);
      localStorage.setItem("platform_token", data.token);
      localStorage.setItem("platform_admin", JSON.stringify(data.admin));
      navigate("/platform", { replace: true });
    } catch (error) { toast.error(error?.response?.data?.message || "Kirishda xato."); }
    finally { setLoading(false); }
  };
  return <Box className="flex min-h-screen items-center justify-center bg-slate-100 p-4"><Paper elevation={0} className="w-full max-w-md border border-slate-200 p-7" sx={{borderRadius:2}}><Typography variant="h5" fontWeight={900}>Platform boshqaruvi</Typography><Typography className="mt-1 text-slate-500">Korxonalar va obuna to'lovlarini boshqarish</Typography><Box component="form" onSubmit={submit} className="mt-6 grid gap-4"><TextField label="Username" value={form.username} onChange={e=>setForm({...form,username:e.target.value})}/><TextField type="password" label="Parol" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/><Button type="submit" variant="contained" disabled={loading}>{loading?"Kirilmoqda...":"Kirish"}</Button></Box></Paper></Box>;
};
export default PlatformLogin;
