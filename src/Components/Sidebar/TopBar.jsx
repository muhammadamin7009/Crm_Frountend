import { useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import SiteLogo from "../../images/zerr_02_logo.png";
import {
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";
import { clearSession } from "../../utils/auth";

const mobileMenuItems = [
  { label: "Dashboard", path: "/", end: true },
  { label: "Hodimlar", path: "/users" },
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();

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

          <Avatar
            src={getImageUrl(user?.user_image)}
            sx={{ width: 40, height: 40, bgcolor: "#7F1D1D" }}
          >
            {user?.first_name?.[0]?.toUpperCase() || "U"}
          </Avatar>
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
            <Box className="mx-4 mb-2 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
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
                  {roleNames[user.role] || user.role || "Role"}
                </Typography>
              </Box>
            </Box>
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
    </>
  );
};

export default TopBar;
