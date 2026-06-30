import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import { getUser } from "../../api/getUsers";

const roleNames = {
  super_admin: "Super admin",
  admin: "Admin",
  client: "Mijoz",
  supplier: "Ta'minotchi",
  customer: "Xaridor",
  worker: "Ishchi",
};

const getRoleColor = (role) => {
  if (role === "super_admin") return "error";
  if (role === "admin") return "warning";
  if (role === "client") return "success";
  if (role === "supplier") return "info";
  return "default";
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Intl.DateTimeFormat("uz-UZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
};

const getImageUrl = (path) => {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;

  const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
  const imagePath = path.startsWith("/") ? path : `/${path}`;
  return `${apiUrl}${imagePath}`;
};

const InfoItem = ({ label, value }) => (
  <Box className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
    <Typography variant="body2" className="text-slate-500">
      {label}
    </Typography>
    <Typography className="mt-1 wrap-break-word text-slate-950" fontWeight={700}>
      {value || "-"}
    </Typography>
  </Box>
);

const User = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await getUser(id);
      const receivedUser = data?.user || data?.found_user || data?.result || data;
      setEmployee(receivedUser);
    } catch (error) {
      const status = error?.response?.status;

      if (status === 403) setError("Bu hodim ma'lumotlarini ko'rishga ruxsatingiz yo'q.");
      else if (status === 404) setError("Hodim topilmadi.");
      else {
        setError(
          error?.response?.data?.message ||
            "Hodim ma'lumotlarini olishda xatolik yuz berdi.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (loading) {
    return (
      <Box className="flex min-h-72 items-center justify-center">
        <CircularProgress size={34} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error">{error}</Alert>
        <Button variant="outlined" className="mt-4" onClick={() => navigate("/users")}>
          Hodimlarga qaytish
        </Button>
      </Box>
    );
  }

  if (!employee) return <Alert severity="warning">Hodim topilmadi.</Alert>;

  const fullName = `${employee.first_name || ""} ${employee.last_name || ""}`.trim();

  return (
    <Box>
      <Box className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <Box>
          <Typography variant="h5" fontWeight={800} className="text-slate-950">
            Hodim ma'lumotlari
          </Typography>
          <Typography variant="body2" className="mt-1 text-slate-500">
            Hodimning shaxsiy va tizimdagi ma'lumotlari
          </Typography>
        </Box>

        <Button variant="outlined" onClick={() => navigate("/users")} sx={{ borderRadius: 2 }}>
          Orqaga
        </Button>
      </Box>

      <Paper elevation={0} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <Box className="border-b border-slate-200 bg-slate-50 px-5 py-6 sm:px-6">
          <Box className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Box className="flex items-center gap-4">
              <Avatar
                src={getImageUrl(employee.user_image)}
                alt={fullName}
                sx={{ width: 92, height: 92, fontSize: 32, bgcolor: "#7F1D1D" }}
              >
                {employee.first_name?.[0]?.toUpperCase()}
              </Avatar>

              <Box>
                <Typography variant="h4" fontWeight={800} className="text-slate-950">
                  {fullName || "Nomsiz hodim"}
                </Typography>
                <Typography className="mt-1 text-slate-500">
                  @{employee.username || "username"}
                </Typography>
              </Box>
            </Box>

            <Chip
              label={roleNames[employee.role] || employee.role || "Ruxsat turi berilmagan"}
              color={getRoleColor(employee.role)}
              variant={employee.role === "customer" ? "outlined" : "filled"}
            />
          </Box>
        </Box>

        <Box className="p-5 sm:p-6">
          <Box className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem label="ID" value={employee.id} />
            <InfoItem label="Ism" value={employee.first_name} />
            <InfoItem label="Familiya" value={employee.last_name} />
            <InfoItem label="Username" value={employee.username} />
            <InfoItem label="Telefon raqami" value={employee.phone} />
            <InfoItem label="Lavozimi" value={roleNames[employee.role] || employee.role} />
          </Box>

          <Divider />

          <Box className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoItem label="Yaratilgan vaqt" value={formatDate(employee.created_at)} />
            <InfoItem label="Yangilangan vaqt" value={formatDate(employee.updated_at)} />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default User;
