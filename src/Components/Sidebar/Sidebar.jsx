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

const menuItems = [
  {
    label: "Dashboard",
    helper: "Umumiy ko'rinish",
    path: "/",
    end: true,
  },
  {
    label: "Hodimlar",
    helper: "Jamoa va rollar",
    path: "/users",
  },
  {
    label: "Mahsulotlar",
    helper: "Katalog va narxlar",
    path: "/products",
  },
  {
    label: "Ish hisoboti",
    helper: "Ishchilar ishlari",
    path: "/worker-outputs",
    allowedRoles: ["super_admin", "admin", "worker"],
  },
  {
    label: "Oyliklar",
    helper: "To'lov va balans",
    path: "/worker-payments",
    allowedRoles: ["super_admin", "admin"],
  },
  {
    label: "Mijoz savdo",
    helper: "Client qarzdorlik",
    path: "/client-sales",
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

const Sidebar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = () => {
    clearSession();
    navigate("/login", { replace: true });
  };

  const fullName = `${user?.first_name || ""} ${user?.last_name || ""}`.trim();

  return (
    <Box className="hidden h-screen w-72 shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white md:flex">
      <Box className="px-5 pb-5 pt-6">
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

      <List className="mx-4 min-h-0 flex-1 px-0 py-2">
        {menuItems
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
              className="mb-2"
              sx={{
                mx: 0,
                px: 2,
                py: 1.35,
                color: "#475569",
                border: "1px solid transparent",
                borderRadius: "14px",
                "& .MuiListItemText-primary": {
                  fontWeight: 700,
                  color: "inherit",
                },
                "& .MuiListItemText-secondary": {
                  color: "#94A3B8",
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
                "&.active .MuiListItemText-secondary": {
                  color: "rgba(255,255,255,0.72)",
                },
              }}
            >
              <ListItemText primary={item.label} secondary={item.helper} />
            </ListItemButton>
          ))}
      </List>

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
