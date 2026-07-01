import { useCallback, useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { getUsers } from "../../api/getUsers";
import { getProducts } from "../../api/products";
import {
  getWorkerOutputs,
  getWorkerOutputsSummary,
} from "../../api/workerOutputs";
import { getWorkerBalance } from "../../api/workerPayments";
import {
  getClientBalance,
  getClientSales,
  getClientSalesSummary,
} from "../../api/clientSales";
import {
  getMaterialPurchases,
  getSupplierBalance,
} from "../../api/materialPurchases";

const money = (value) =>
  `${new Intl.NumberFormat("uz-UZ").format(Number(value || 0))} so'm`;
const number = (value) =>
  new Intl.NumberFormat("uz-UZ").format(Number(value || 0));
const getFinishedQuantity = (summary = []) => {
  const finalDepartment = summary.find((item) => {
    const value = `${item.group_code || ""} ${item.group_name || ""}`.toLowerCase();
    return /upakov|upakof|qadoq|pack/.test(value);
  });

  return Number(finalDepartment?.total_quantity || 0);
};
const date = (value) =>
  value ? new Date(value).toLocaleDateString("uz-UZ") : "-";
const monthRange = () => {
  const now = new Date();
  return {
    date_from: new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .slice(0, 10),
    date_to: new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10),
  };
};
const previousMonthRange = () => {
  const now = new Date();
  return {
    date_from: new Date(now.getFullYear(), now.getMonth() - 1, 1)
      .toISOString()
      .slice(0, 10),
    date_to: new Date(now.getFullYear(), now.getMonth(), 0)
      .toISOString()
      .slice(0, 10),
  };
};

const Card = ({ label, value, helper, tone = "default" }) => {
  const colors =
    tone === "danger"
      ? "border-red-200 bg-red-50"
      : tone === "success"
        ? "border-emerald-200 bg-emerald-50"
        : "border-slate-200 bg-white";
  return (
    <Paper elevation={0} className={`rounded-xl border px-4 py-4 ${colors}`}>
      <Typography variant="body2" className="text-slate-500">
        {label}
      </Typography>
      <Typography variant="h6" fontWeight={800} className="mt-1 text-slate-950">
        {value}
      </Typography>
      <Typography variant="body2" className="mt-1 text-slate-500">
        {helper}
      </Typography>
    </Paper>
  );
};

const Empty = ({ children }) => (
  <Box className="flex min-h-32 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
    <Typography variant="body2" className="text-slate-500">
      {children}
    </Typography>
  </Box>
);

const AdminOverview = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [filterForm, setFilterForm] = useState(monthRange);
  const [appliedRange, setAppliedRange] = useState(monthRange);
  const [sectionFilter, setSectionFilter] = useState("all");
  const [data, setData] = useState({
    users: 0,
    products: 0,
    productionQuantity: 0,
    productionAmount: 0,
    salaryEarned: 0,
    salaryPaid: 0,
    salaryRemaining: 0,
    advances: 0,
    sales: 0,
    clientIncome: 0,
    clientDebt: 0,
    salesCount: 0,
    purchases: 0,
    supplierPaid: 0,
    supplierDebt: 0,
    purchasesCount: 0,
  });
  const [clients, setClients] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [purchases, setPurchases] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const range = appliedRange;
      const [
        usersRes,
        productsRes,
        outputsRes,
        workerRes,
        departmentRes,
        salaryMonthRes,
        salaryAllRes,
        salesRes,
        clientDebtRes,
        clientRes,
        purchasesRes,
        supplierMonthRes,
        supplierDebtRes,
      ] = await Promise.all([
        getUsers({ offset: 0, limit: 1 }),
        getProducts({ offset: 0, limit: 1 }),
        getWorkerOutputs({ ...range, offset: 0, limit: 1 }),
        getWorkerOutputsSummary({ ...range, group_by: "worker" }),
        getWorkerOutputsSummary({ ...range, group_by: "department" }),
        getWorkerBalance(range),
        getWorkerBalance({}),
        getClientSales({ ...range, offset: 0, limit: 1 }),
        getClientBalance({}),
        getClientSalesSummary({ ...range, group_by: "client" }),
        getMaterialPurchases({ ...range, offset: 0, limit: 6 }),
        getSupplierBalance(range),
        getSupplierBalance({}),
      ]);

      const departmentSummary = departmentRes.data.summary || [];

      setData({
        users: usersRes.data.pageInfo?.total || 0,
        products: productsRes.data.pageInfo?.total || 0,
        productionQuantity: getFinishedQuantity(departmentSummary),
        productionAmount: outputsRes.data.totals?.total_amount || 0,
        salaryEarned: salaryMonthRes.data.balance?.total_earned || 0,
        salaryPaid: salaryMonthRes.data.balance?.total_paid || 0,
        salaryRemaining: salaryAllRes.data.balance?.remaining || 0,
        advances: salaryAllRes.data.balance?.remaining_advance || 0,
        sales: salesRes.data.totals?.total_amount || 0,
        clientIncome: salesRes.data.totals?.paid_amount || 0,
        clientDebt: clientDebtRes.data.balance?.debt_amount || 0,
        salesCount: salesRes.data.pageInfo?.total || 0,
        purchases: supplierMonthRes.data.total_purchase || 0,
        supplierPaid: supplierMonthRes.data.total_paid || 0,
        supplierDebt: supplierDebtRes.data.debt_amount || 0,
        purchasesCount: purchasesRes.data.pageInfo?.total || 0,
      });
      setClients(clientRes.data.summary || []);
      setWorkers(workerRes.data.summary || []);
      setDepartments(departmentSummary);
      setPurchases(purchasesRes.data.material_purchases || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Bosh sahifa ma'lumotlarini olishda xato.",
      );
    } finally {
      setLoading(false);
    }
  }, [appliedRange]);

  useEffect(() => {
    load();
  }, [load]);
  if (loading)
    return (
      <Box className="flex h-full items-center justify-center">
        <CircularProgress size={34} />
      </Box>
    );

  const obligations = Number(data.supplierDebt) + Number(data.salaryRemaining);
  const balanceDifference = Number(data.clientDebt) - obligations;
  const showClient = ["all", "clients"].includes(sectionFilter);
  const showSupplier = ["all", "suppliers"].includes(sectionFilter);
  const showWorkers = ["all", "workers"].includes(sectionFilter);
  const showExternalSummary = sectionFilter === "all";

  return (
    <Box className="h-full overflow-auto pr-1">
      <Box className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Bosh sahifa
          </Typography>
          <Typography variant="body2" className="mt-1 text-slate-500">
            Salom, {user?.first_name || "Admin"}. Korxonaning asosiy hisoblari
            bir joyda.
          </Typography>
        </Box>
        <Paper elevation={0} className="rounded-xl border border-slate-200 p-3">
          <Box className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                const range = monthRange();
                setFilterForm(range);
                setAppliedRange(range);
              }}
            >
              Bu oy
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                const range = previousMonthRange();
                setFilterForm(range);
                setAppliedRange(range);
              }}
            >
              O'tgan oy
            </Button>
            <TextField
              size="small"
              type="date"
              label="Dan"
              value={filterForm.date_from}
              onChange={(e) =>
                setFilterForm((p) => ({ ...p, date_from: e.target.value }))
              }
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              size="small"
              type="date"
              label="Gacha"
              value={filterForm.date_to}
              onChange={(e) =>
                setFilterForm((p) => ({ ...p, date_to: e.target.value }))
              }
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Button
              size="small"
              variant="contained"
              onClick={() => {
                if (!filterForm.date_from || !filterForm.date_to)
                  return toast.error("Boshlanish va tugash sanasini kiriting.");
                if (
                  new Date(filterForm.date_from) > new Date(filterForm.date_to)
                )
                  return toast.error(
                    "Boshlanish sanasi tugash sanasidan katta bo'lmasin.",
                  );
                setAppliedRange({ ...filterForm });
              }}
            >
              Filterlash
            </Button>
          </Box>
        </Paper>
      </Box>

      <Typography variant="body2" className="mb-3 text-slate-500">
        Ko'rsatilgan davr: {date(appliedRange.date_from)} -{" "}
        {date(appliedRange.date_to)}. Jami qarzlar davrga bog'liq emas.
      </Typography>

      <Paper elevation={0} className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center sm:justify-between">
        <Box>
          <Typography fontWeight={700}>Ko'rinish</Typography>
          <Typography variant="body2" className="text-slate-500">Kerakli yo'nalishni tanlang</Typography>
        </Box>
        <Box className="flex flex-wrap rounded-lg bg-slate-100 p-1">
        {[
          ["all", "Hammasi"],
          ["workers", "Ishchilar"],
          ["clients", "Mijozlar"],
          ["suppliers", "Ta'minotchilar"],
        ].map(([value, label]) => (
          <Button
            key={value}
            size="small"
            variant={sectionFilter === value ? "contained" : "text"}
            onClick={() => setSectionFilter(value)}
            sx={{ borderRadius: 1.5, px: 2 }}
          >
            {label}
          </Button>
        ))}
        </Box>
      </Paper>

      {showExternalSummary && (
        <Box className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Card
            label="Olinadigan pul"
            value={money(data.clientDebt)}
            helper="Mijozlarning jami qarzi"
            tone="success"
          />
          <Card
            label="Beriladigan pul"
            value={money(obligations)}
            helper="Ta'minotchi qarzi va ish haqi"
            tone="danger"
          />
          <Card
            label="Hisob farqi"
            value={money(balanceDifference)}
            helper="Bu foyda emas, qarzlar farqi"
          />
        </Box>
      )}

      {(showClient || showSupplier) && (
        <>
          <Box className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
            {showClient && (
              <>
                <Card
                  label="Mijozlarga savdo"
                  value={money(data.sales)}
                  helper={`${data.salesCount} ta savdo, tanlangan davr`}
                />
                <Card
                  label="Mijozlardan tushum"
                  value={money(data.clientIncome)}
                  helper="Tanlangan davrda olingan"
                  tone="success"
                />
                <Card
                  label="Mijozlar qarzi"
                  value={money(data.clientDebt)}
                  helper="Barcha davr"
                />
              </>
            )}
            {showSupplier && (
              <>
                <Card
                  label="Homashyo xaridi"
                  value={money(data.purchases)}
                  helper={`${data.purchasesCount} ta xarid, tanlangan davr`}
                />
                <Card
                  label="Ta'minotchiga berildi"
                  value={money(data.supplierPaid)}
                  helper="Tanlangan davrdagi chiqim"
                />
                <Card
                  label="Ta'minotchilar qarzi"
                  value={money(data.supplierDebt)}
                  helper="Barcha davr"
                  tone="danger"
                />
              </>
            )}
          </Box>
        </>
      )}

      {showWorkers && (
        <>
          <Box className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <Card
              label="Hodimlar"
              value={number(data.users)}
              helper="Tizimdagi foydalanuvchilar"
            />
            <Card
              label="Mahsulotlar"
              value={number(data.products)}
              helper="Katalog"
            />
            <Card
              label="Ishlab chiqarildi"
              value={number(data.productionQuantity)}
              helper="Bu oy, dona"
            />
            <Card
              label="Hisoblangan ish"
              value={money(data.productionAmount)}
              helper="Mahsulotbay ish"
            />
            <Card
              label="Ish haqi berildi"
              value={money(data.salaryPaid)}
              helper={`Hisoblandi: ${money(data.salaryEarned)}`}
            />
            <Card
              label="Qolgan avans"
              value={money(data.advances)}
              helper={`Ish haqi qoldig'i: ${money(data.salaryRemaining)}`}
            />
          </Box>
        </>
      )}

      <Box className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-2">
        {showClient && (
          <Paper
            elevation={0}
            className="rounded-xl border border-slate-200 p-5"
          >
            <Typography fontWeight={800} className="mb-3">
              Mijozlar bo‘yicha
            </Typography>
            {clients.length ? (
              <Box className="space-y-2">
                {clients.slice(0, 6).map((item) => (
                  <Box
                    key={item.group_id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                  >
                    <Box className="flex items-center gap-3">
                      <Avatar
                        sx={{ bgcolor: "#7F1D1D", width: 36, height: 36 }}
                      >
                        {item.group_name?.[0] || "C"}
                      </Avatar>
                      <Box>
                        <Typography fontWeight={700}>
                          {item.group_name}
                        </Typography>
                        <Typography variant="body2" className="text-slate-500">
                          {item.sales_count} ta savdo
                        </Typography>
                      </Box>
                    </Box>
                    <Box className="text-right">
                      <Typography fontWeight={800}>
                        {money(item.total_amount)}
                      </Typography>
                      <Typography variant="body2" className="text-red-600">
                        Qarz: {money(item.debt_amount)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Empty>Tanlangan davrda client savdosi yo‘q.</Empty>
            )}
          </Paper>
        )}
        {showSupplier && (
          <Paper
            elevation={0}
            className="rounded-xl border border-slate-200 p-5"
          >
            <Typography fontWeight={800} className="mb-3">
              Oxirgi homashyo xaridlari
            </Typography>
            {purchases.length ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Ta'minotchi</TableCell>
                    <TableCell>Homashyo</TableCell>
                    <TableCell>Jami</TableCell>
                    <TableCell>Sana</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purchases.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.supplier_name}</TableCell>
                      <TableCell>
                        {item.items?.map((row) => row.material_name).join(", ")}
                      </TableCell>
                      <TableCell>{money(item.subtotal)}</TableCell>
                      <TableCell>{date(item.purchased_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Empty>Tanlangan davrda homashyo xaridi yo‘q.</Empty>
            )}
          </Paper>
        )}
      </Box>

      {showWorkers && (
        <Box className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Paper
            elevation={0}
            className="rounded-xl border border-slate-200 p-5"
          >
            <Typography fontWeight={800} className="mb-3">
              Ishchilar natijasi
            </Typography>
            {workers.length ? (
              workers.slice(0, 6).map((item) => (
                <Box
                  key={item.group_id}
                  className="mb-2 flex justify-between rounded-lg bg-slate-50 p-3"
                >
                  <Typography fontWeight={700}>{item.group_name}</Typography>
                  <Typography fontWeight={800}>
                    {number(item.total_quantity)} dona /{" "}
                    {money(item.total_amount)}
                  </Typography>
                </Box>
              ))
            ) : (
              <Empty>Bu oy ish yozuvi yo‘q.</Empty>
            )}
          </Paper>
          <Paper
            elevation={0}
            className="rounded-xl border border-slate-200 p-5"
          >
            <Typography fontWeight={800} className="mb-3">
              Bo‘limlar natijasi
            </Typography>
            {departments.length ? (
              departments.map((item) => (
                <Box
                  key={item.group_id}
                  className="mb-2 flex justify-between rounded-lg bg-slate-50 p-3"
                >
                  <Typography fontWeight={700}>{item.group_name}</Typography>
                  <Typography fontWeight={800}>
                    {number(item.total_quantity)} dona /{" "}
                    {money(item.total_amount)}
                  </Typography>
                </Box>
              ))
            ) : (
              <Empty>Bu oy bo‘lim hisoboti yo‘q.</Empty>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default AdminOverview;
