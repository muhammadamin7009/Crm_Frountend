import {
  Avatar,
  Box,
  Button,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import SiteLogo from "../../images/zerr_02_logo.png";
import { clearSession } from "../../utils/auth";

const menuGroups = [
  {
    label: "Asosiy",
    items: [{ label: "Dashboard", path: "/", end: true }],
  },
  {
    label: "Boshqaruv",
    items: [
      { label: "Hodimlar", path: "/users" },
      {
        label: "Lavozim va kelishuvlar",
        path: "/employees",
        allowedRoles: ["super_admin", "admin"],
      },
      { label: "Mahsulotlar", path: "/products" },
    ],
  },
  {
    label: "Ishlab chiqarish",
    items: [
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
    ],
  },
  {
    label: "Tashqi hisob",
    items: [
      {
        label: "Mijoz savdo",
        path: "/client-sales",
        allowedRoles: ["super_admin", "admin"],
      },
      {
        label: "Homashyo xaridi",
        path: "/material-purchases",
        allowedRoles: ["super_admin", "admin"],
      },
    ],
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

const Sidebar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();

  return (
    <Box className="hidden h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white md:flex">
      <Box className="px-5 pb-4 pt-5">
        <Box className="flex items-center gap-3">
          <Box className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
            <img width={34} src={SiteLogo} alt="Zerr Shoes" />
          </Box>

          <Box className="min-w-0">
            <Typography
              fontWeight={800}
              className="leading-tight text-slate-950"
            >
              Zerr Shoes
            </Typography>
            <Typography variant="body2" className="text-slate-500">
              Korxona CRM
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box className="min-h-0 flex-1 overflow-y-auto px-4 pb-3">
        {menuGroups.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !item.allowedRoles || item.allowedRoles.includes(user?.role),
          );

          if (!visibleItems.length) return null;

          return (
            <Box key={group.label} className="mb-4">
              <Typography
                variant="caption"
                className="mb-1.5 block px-2 font-semibold uppercase text-slate-400"
                sx={{ letterSpacing: 0 }}
              >
                {group.label}
              </Typography>
              <List disablePadding>
                {visibleItems.map((item) => (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              end={item.end}
              className="mb-1"
              sx={{
                mx: 0,
                px: 1.5,
                py: 1,
                color: "#475569",
                border: "1px solid transparent",
                borderRadius: "10px",
                "& .MuiListItemText-primary": {
                  fontWeight: 700,
                  color: "inherit",
                },
                "&:hover": {
                  backgroundColor: "#FFF7ED",
                  borderColor: "#FED7AA",
                  color: "#7F1D1D",
                  transform: "translateX(2px)",
                },
                "&.active": {
                  backgroundColor: "#7F1D1D",
                  color: "#FFFFFF",
                  boxShadow: "0 12px 26px rgba(127, 29, 29, 0.18)",
                },
              }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
                ))}
              </List>
            </Box>
          );
        })}
      </Box>

      <Box className="px-4 pb-4">
        <Divider />

        <Box className="mb-3 mt-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <Avatar
            src={getImageUrl(user?.user_image)}
            sx={{ width: 40, height: 40, bgcolor: "#7F1D1D" }}
          >
            {user?.first_name?.[0]?.toUpperCase() || "U"}
          </Avatar>

          <Box className="min-w-0 flex-1">
            <Typography className="truncate text-sm font-semibold text-slate-950">
              {fullName || user?.username || "Foydalanuvchi"}
            </Typography>
            <Typography variant="body2" className="truncate text-slate-500">
              {roleNames[user?.role] || user?.role || "Role"}
            </Typography>
          </Box>
        </Box>

        <Button
          fullWidth
          variant="outlined"
          color="error"
          sx={{ borderRadius: 2, py: 1 }}
          onClick={handleLogout}
        >
          Chiqish
        </Button>
      </Box>
    </Box>
  );
};

export default Sidebar;
