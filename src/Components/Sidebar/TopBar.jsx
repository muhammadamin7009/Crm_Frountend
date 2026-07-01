import { useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import SiteLogo from "../../images/zerr_02_logo.png";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";
import { clearSession } from "../../utils/auth";
import { updateMe, updateUserImage } from "../../api/getUsers";
import { toast } from "react-toastify";

const mobileMenuItems = [
  { label: "Bosh sahifa", path: "/", end: true },
  {
    label: "Hodimlar",
    path: "/users",
    allowedRoles: ["super_admin", "admin", "worker"],
  },
  { label: "Mahsulotlar", path: "/products" },
  {
    label: "Ish hisoboti",
    path: "/worker-outputs",
    allowedRoles: ["super_admin", "admin", "worker"],
  },
  {
    label: "Oyliklar",
    path: "/worker-payments",
    allowedRoles: ["super_admin", "admin"],
  },
];

const roleNames = {
  super_admin: "Super admin",
  admin: "Admin",
  client: "Mijoz",
  supplier: "Ta'minotchi",
  customer: "Xaridor",
  worker: "Ishchi",
};

const getImageUrl = (path) => {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;

  const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

const TopBar = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [profileForm, setProfileForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    phone: "",
    password: "",
  });

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();

  const openProfile = () => {
    setProfileForm({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      username: user?.username || "",
      phone: user?.phone || "",
      password: "",
    });
    setImageFile(null);
    setImagePreview("");
    setProfileOpen(true);
  };

  const handleProfileChange = (field) => (event) => {
    setProfileForm((previous) => ({ ...previous, [field]: event.target.value }));
  };

  const handleProfileImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const saveProfile = async () => {
    if (!profileForm.first_name.trim() || !profileForm.last_name.trim() || !profileForm.username.trim()) {
      return toast.error("Ism, familiya va username majburiy.");
    }

    setProfileSaving(true);
    try {
      const payload = {
        first_name: profileForm.first_name.trim(),
        last_name: profileForm.last_name.trim(),
        username: profileForm.username.trim(),
        phone: profileForm.phone.trim() || null,
      };
      if (profileForm.password) payload.password = profileForm.password;

      const profileResponse = await updateMe(payload);
      let updatedUser = profileResponse.data.updated_user || profileResponse.data.user;

      if (imageFile) {
        const imageResponse = await updateUserImage(imageFile);
        updatedUser = imageResponse.data.user || updatedUser;
      }

      const nextUser = { ...user, ...updatedUser };
      localStorage.setItem("user", JSON.stringify(nextUser));
      setUser(nextUser);
      setProfileOpen(false);
      toast.success("Profil ma'lumotlari yangilandi.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Profilni yangilashda xato.");
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <>
      <div className="m-3 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm md:m-6 md:px-5">
        <Box className="flex min-w-0 items-center gap-3">
          <Button
            variant="outlined"
            size="small"
            sx={{
              display: { xs: "inline-flex", md: "none" },
              borderRadius: 2,
              color: "#7F1D1D",
              borderColor: "#FCA5A5",
              minWidth: 76,
            }}
            onClick={() => setMenuOpen(true)}
          >
            Menyu
          </Button>

          <Box className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 sm:flex">
            <img width={28} src={SiteLogo} alt="Zerr Shoes" />
          </Box>

          <Box className="min-w-0">
            <Typography className="truncate text-sm font-semibold text-slate-950 sm:text-base">
              {user ? `Salom, ${user.first_name}` : "Zerr Shoes"}
            </Typography>
            <Typography
              variant="body2"
              className="hidden truncate text-slate-500 sm:block"
            >
              {user
                ? roleNames[user.role] || user.role || "CRM foydalanuvchi"
                : "Korxona CRM"}
            </Typography>
          </Box>
        </Box>

        <Box className="flex items-center gap-3">
          {user && (
            <Box className="hidden text-right sm:block">
              <Typography className="text-sm font-semibold text-slate-900">
                {fullName || user.username || "Foydalanuvchi"}
              </Typography>
              <Typography variant="body2" className="text-slate-500">
                Online
              </Typography>
            </Box>
          )}

          <Button
            onClick={openProfile}
            title="Profilni tahrirlash"
            sx={{ minWidth: 0, p: 0, borderRadius: "50%" }}
          >
            <Avatar
              src={getImageUrl(user?.user_image)}
              sx={{ width: 40, height: 40, bgcolor: "#7F1D1D" }}
            >
              {user?.first_name?.[0]?.toUpperCase() || "U"}
            </Avatar>
          </Button>
        </Box>
      </div>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)}>
        <Box className="flex h-full w-72 flex-col bg-white">
          <Box className="px-5 py-6">
            <Typography variant="h6" fontWeight={700}>
              Zerr Shoes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Korxona boshqaruvi
            </Typography>
          </Box>

          {user && (
            <Button
              fullWidth
              onClick={() => { setMenuOpen(false); openProfile(); }}
              className="mx-4 mb-2"
              sx={{ justifyContent: "flex-start", textTransform: "none", color: "inherit", width: "calc(100% - 32px)", borderRadius: 2, border: "1px solid #E2E8F0", backgroundColor: "#F8FAFC", p: 1.5 }}
            >
              <Avatar
                src={getImageUrl(user.user_image)}
                sx={{ width: 40, height: 40, bgcolor: "#7F1D1D" }}
              >
                {user.first_name?.[0]?.toUpperCase() || "U"}
              </Avatar>
              <Box className="min-w-0">
                <Typography className="truncate text-sm font-semibold text-slate-950">
                  {fullName || user.username || "Foydalanuvchi"}
                </Typography>
                <Typography variant="body2" className="truncate text-slate-500">
                  {roleNames[user.role] || user.role || "Ruxsat turi"}
                </Typography>
              </Box>
            </Button>
          )}

          <Divider />

          <List className="flex-1 px-4 py-4">
            {mobileMenuItems
              .filter(
                (item) =>
                  !item.allowedRoles || item.allowedRoles.includes(user?.role),
              )
              .map((item) => (
                <ListItemButton
                  key={item.path}
                  component={NavLink}
                  to={item.path}
                  end={item.end}
                  onClick={() => setMenuOpen(false)}
                  sx={{
                    mb: 1,
                    borderRadius: "14px",
                    color: "#475569",
                    "&:hover": { backgroundColor: "#FFF7ED", color: "#7F1D1D" },
                    "&.active": {
                      backgroundColor: "#7F1D1D",
                      color: "#fff",
                    },
                  }}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              ))}
          </List>

          <Box className="p-4">
            <Button
              fullWidth
              color="error"
              variant="outlined"
              onClick={handleLogout}
            >
              Chiqish
            </Button>
          </Box>
        </Box>
      </Drawer>

      <Dialog open={profileOpen} onClose={() => setProfileOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 800 }}>Profilni tahrirlash</DialogTitle>
        <DialogContent>
          <Stack spacing={2} className="pt-2">
            <Box className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <Avatar
                src={imagePreview || getImageUrl(user?.user_image)}
                sx={{ width: 72, height: 72, bgcolor: "#7F1D1D", fontSize: 28 }}
              >
                {profileForm.first_name?.[0]?.toUpperCase() || "U"}
              </Avatar>
              <Box>
                <Button component="label" variant="outlined">
                  Rasm tanlash
                  <input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={handleProfileImage} />
                </Button>
                <Typography variant="body2" className="mt-1 text-slate-500">
                  JPEG, PNG yoki WebP, ko'pi bilan 5 MB
                </Typography>
              </Box>
            </Box>
            <TextField label="Ism" value={profileForm.first_name} onChange={handleProfileChange("first_name")} />
            <TextField label="Familiya" value={profileForm.last_name} onChange={handleProfileChange("last_name")} />
            <TextField label="Username" value={profileForm.username} onChange={handleProfileChange("username")} />
            <TextField label="Telefon" value={profileForm.phone} onChange={handleProfileChange("phone")} />
            <TextField type="password" label="Yangi parol" value={profileForm.password} onChange={handleProfileChange("password")} helperText="O'zgartirmasangiz bo'sh qoldiring" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProfileOpen(false)}>Bekor qilish</Button>
          <Button variant="contained" onClick={saveProfile} disabled={profileSaving}>
            {profileSaving ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TopBar;
