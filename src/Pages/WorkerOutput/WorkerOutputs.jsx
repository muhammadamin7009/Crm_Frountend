import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useAuth } from "../../Context/AuthContext";
import { uzbekPaginationProps } from "../../utils/pagination";
import { getUsers } from "../../api/getUsers";
import { getProducts } from "../../api/products";
import { getDepartments } from "../../api/departments";
import {
  createWorkerOutput,
  deleteWorkerOutput,
  getWorkerOutputs,
  getWorkerOutputsSummary,
  updateWorkerOutput,
} from "../../api/workerOutputs";

const emptyForm = {
  worker_id: "",
  product_id: "",
  department_id: "",
  quantity: "",
  worked_at: new Date().toISOString().slice(0, 10),
  note: "",
};

const roleNames = {
  super_admin: "Super admin",
  admin: "Admin",
  worker: "Ishchi",
};

const getLocalUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const formatMoney = (value) => {
  if (value === null || value === undefined || value === "") return "0 so'm";
  return `${new Intl.NumberFormat("uz-UZ").format(Number(value))} so'm`;
};

const formatNumber = (value) =>
  new Intl.NumberFormat("uz-UZ").format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("uz-UZ");
};

const WorkerOutputs = () => {
  const auth = useAuth();
  const currentUser = auth?.user || getLocalUser();
  const canManage = ["super_admin", "admin"].includes(currentUser?.role);

  const [outputs, setOutputs] = useState([]);
  const [summary, setSummary] = useState([]);
  const [pageInfo, setPageInfo] = useState({ total: 0, offset: 0, limit: 10 });
  const [totals, setTotals] = useState({ total_quantity: 0, total_amount: 0 });
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [workers, setWorkers] = useState([]);
  const [products, setProducts] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [filters, setFilters] = useState({
    q: "",
    worker_id: "",
    product_id: "",
    department_id: "",
    date_from: "",
    date_to: "",
    sort_by: "worked_at",
    sort_order: "desc",
    group_by: "worker",
  });

  const [form, setForm] = useState(emptyForm);
  const [selectedOutput, setSelectedOutput] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const page = Math.floor(pageInfo.offset / pageInfo.limit);

  const selectedProduct = useMemo(
    () =>
      products.find(
        (product) => Number(product.id) === Number(form.product_id),
      ),
    [form.product_id, products],
  );

  const selectedDepartment = useMemo(
    () =>
      departments.find(
        (department) => Number(department.id) === Number(form.department_id),
      ),
    [departments, form.department_id],
  );

  const fetchSelectData = useCallback(async () => {
    try {
      const [usersRes, productsRes, departmentsRes] = await Promise.all([
        getUsers({
          offset: 0,
          limit: 100,
          sort_by: "created_at",
          sort_order: "desc",
        }),
        getProducts({
          offset: 0,
          limit: 100,
          sort_by: "name",
          sort_order: "asc",
          is_active: true,
        }),
        getDepartments({
          offset: 0,
          limit: 100,
          sort_by: "sort_order",
          sort_order: "asc",
          is_active: true,
        }),
      ]);

      setWorkers(
        (usersRes.data.users || usersRes.data.list || []).filter(
          (user) => user.role === "worker",
        ),
      );
      setProducts(productsRes.data.products || []);
      setDepartments(departmentsRes.data.departments || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Tanlov ma'lumotlarini olishda xato.",
      );
    }
  }, []);

  const buildParams = useCallback(
    (offset = 0, limit = pageInfo.limit) => {
      const params = {
        offset,
        limit,
        sort_by: filters.sort_by,
        sort_order: filters.sort_order,
      };

      for (const key of [
        "q",
        "worker_id",
        "product_id",
        "department_id",
        "date_from",
        "date_to",
      ]) {
        if (filters[key] !== "") params[key] = filters[key];
      }

      return params;
    },
    [filters, pageInfo.limit],
  );

  const fetchOutputs = useCallback(
    async (offset = 0, limit = pageInfo.limit) => {
      setLoading(true);

      try {
        const { data } = await getWorkerOutputs(buildParams(offset, limit));
        setOutputs(data.worker_outputs || []);
        setTotals(data.totals || { total_quantity: 0, total_amount: 0 });
        setPageInfo(data.pageInfo || { total: 0, offset, limit });
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Ish yozuvlarini olishda xato.",
        );
      } finally {
        setLoading(false);
      }
    },
    [buildParams, pageInfo.limit],
  );

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);

    try {
      const params = buildParams(0, 100);
      delete params.offset;
      delete params.limit;
      params.group_by = filters.group_by;

      const { data } = await getWorkerOutputsSummary(params);
      setSummary(data.summary || []);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Summary olishda xato.");
    } finally {
      setSummaryLoading(false);
    }
  }, [buildParams, filters.group_by]);

  useEffect(() => {
    fetchSelectData();
  }, [fetchSelectData]);

  useEffect(() => {
    fetchOutputs(0, pageInfo.limit);
    fetchSummary();
  }, [filters.sort_by, filters.sort_order, filters.group_by]);

  const handleFilterChange = (field) => (event) => {
    setFilters((previous) => ({ ...previous, [field]: event.target.value }));
  };

  const handleFormChange = (field) => (event) => {
    setForm((previous) => ({ ...previous, [field]: event.target.value }));
  };

  const refreshPage = () => {
    fetchOutputs(pageInfo.offset, pageInfo.limit);
    fetchSummary();
  };

  const openCreateModal = () => {
    setSelectedOutput(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (output) => {
    setSelectedOutput(output);
    setForm({
      worker_id: output.worker_id || "",
      product_id: output.product_id || "",
      department_id: output.department_id || "",
      quantity: output.quantity ?? "",
      worked_at: output.worked_at
        ? String(output.worked_at).slice(0, 10)
        : emptyForm.worked_at,
      note: output.note || "",
    });
    setModalOpen(true);
  };

  const closeModals = () => {
    setModalOpen(false);
    setDeleteOpen(false);
    setSelectedOutput(null);
    setForm(emptyForm);
  };

  const validateForm = () => {
    if (!form.worker_id) return (toast.error("Ishchini tanlang."), false);
    if (!form.product_id) return (toast.error("Mahsulotni tanlang."), false);
    if (!form.department_id) return (toast.error("Bo'limni tanlang."), false);
    if (!form.quantity || Number(form.quantity) <= 0) {
      toast.error("Miqdorni to'g'ri kiriting.");
      return false;
    }
    return true;
  };

  const buildPayload = () => ({
    worker_id: Number(form.worker_id),
    product_id: Number(form.product_id),
    department_id: Number(form.department_id),
    quantity: Number(form.quantity),
    worked_at: form.worked_at || undefined,
    note: form.note.trim() || null,
  });

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);

    try {
      if (selectedOutput) {
        await updateWorkerOutput(selectedOutput.id, buildPayload());
        toast.success("Ish yozuvi yangilandi.");
      } else {
        await createWorkerOutput(buildPayload());
        toast.success("Ish yozuvi qo'shildi.");
      }

      closeModals();
      refreshPage();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Ish yozuvini saqlashda xato.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedOutput) return;
    setDeleting(true);

    try {
      await deleteWorkerOutput(selectedOutput.id);
      toast.success("Ish yozuvi o'chirildi.");
      closeModals();
      refreshPage();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Ish yozuvini o'chirishda xato.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const applyFilters = () => {
    fetchOutputs(0, pageInfo.limit);
    fetchSummary();
  };

  return (
    <Box className="flex h-full min-h-0 flex-col">
      <Box className="mb-5 flex shrink-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <Box>
          <Typography variant="h5" fontWeight={800} className="text-slate-950">
            Ish hisoboti
          </Typography>
          <Typography variant="body2" className="mt-1 text-slate-500">
            Ishchilar bajargan mahsulot ishlari va oylik hisob-kitobi
          </Typography>
        </Box>

        <Box className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Box className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <Typography variant="body2" className="text-slate-500">
              Yozuvlar
            </Typography>
            <Typography variant="h6" fontWeight={800}>
              {pageInfo.total}
            </Typography>
          </Box>
          <Box className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <Typography variant="body2" className="text-slate-500">
              Miqdor
            </Typography>
            <Typography variant="h6" fontWeight={800}>
              {formatNumber(totals.total_quantity)}
            </Typography>
          </Box>
          <Box className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:block">
            <Typography variant="body2" className="text-slate-500">
              Summa
            </Typography>
            <Typography variant="h6" fontWeight={800}>
              {formatMoney(totals.total_amount)}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Paper
        elevation={0}
        className="mb-4 shrink-0 rounded-2xl border border-slate-200 p-4"
      >
        <Box className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <Box className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
            <TextField
              size="small"
              label="Qidirish"
              value={filters.q}
              onChange={handleFilterChange("q")}
            />
            <TextField
              select
              size="small"
              label="Ishchi"
              value={filters.worker_id}
              onChange={handleFilterChange("worker_id")}
            >
              <MenuItem value="">Barchasi</MenuItem>
              {workers.map((worker) => (
                <MenuItem key={worker.id} value={worker.id}>
                  {worker.first_name} {worker.last_name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Mahsulot"
              value={filters.product_id}
              onChange={handleFilterChange("product_id")}
            >
              <MenuItem value="">Barchasi</MenuItem>
              {products.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  {product.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Bo'lim"
              value={filters.department_id}
              onChange={handleFilterChange("department_id")}
            >
              <MenuItem value="">Barchasi</MenuItem>
              {departments.map((department) => (
                <MenuItem key={department.id} value={department.id}>
                  {department.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              type="date"
              label="Dan"
              value={filters.date_from}
              onChange={handleFilterChange("date_from")}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
            <TextField
              size="small"
              type="date"
              label="Gacha"
              value={filters.date_to}
              onChange={handleFilterChange("date_to")}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />
            <TextField
              select
              size="small"
              label="Summary"
              value={filters.group_by}
              onChange={handleFilterChange("group_by")}
            >
              <MenuItem value="worker">Ishchi</MenuItem>
              <MenuItem value="department">Bo'lim</MenuItem>
              <MenuItem value="product">Mahsulot</MenuItem>
              <MenuItem value="day">Kun</MenuItem>
            </TextField>
            <Button variant="outlined" onClick={applyFilters}>
              Filterlash
            </Button>
          </Box>

          {canManage && (
            <Button
              variant="contained"
              onClick={openCreateModal}
              sx={{ borderRadius: 2, width: "360px" }}
            >
              Ish yozuvi qo'shish
            </Button>
          )}
        </Box>
      </Paper>

      <Box className="mb-4 grid shrink-0 grid-cols-1 gap-3 md:grid-cols-4">
        {summaryLoading ? (
          <Paper
            elevation={0}
            className="rounded-2xl border border-slate-200 p-4 md:col-span-4"
          >
            <CircularProgress size={24} />
          </Paper>
        ) : summary.length ? (
          summary.slice(0, 4).map((item) => (
            <Paper
              key={String(item.group_id)}
              elevation={0}
              className="rounded-2xl border border-slate-200 p-4"
            >
              <Typography variant="body2" className="truncate text-slate-500">
                {item.group_name || "-"}
              </Typography>
              <Typography className="mt-1 text-slate-950" fontWeight={800}>
                {formatMoney(item.total_amount)}
              </Typography>
              <Typography variant="body2" className="mt-1 text-slate-500">
                {formatNumber(item.total_quantity)} dona / {item.entries_count}{" "}
                yozuv
              </Typography>
            </Paper>
          ))
        ) : (
          <Paper
            elevation={0}
            className="rounded-2xl border border-slate-200 p-4 md:col-span-4"
          >
            <Typography variant="body2" className="text-slate-500">
              Summary uchun ma'lumot topilmadi.
            </Typography>
          </Paper>
        )}
      </Box>

      <Paper
        elevation={0}
        className="flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-200 bg-white"
      >
        <Box className="min-h-0 flex-1 overflow-auto">
          <Table sx={{ minWidth: 1120 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Ishchi</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Mahsulot</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Bo'lim</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Miqdor</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Narx</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Summa</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Sana</TableCell>
                {canManage && (
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Amallar
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={canManage ? 8 : 7} align="center">
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : outputs.length ? (
                outputs.map((output) => (
                  <TableRow key={output.id} hover>
                    <TableCell>
                      <Box className="flex items-center gap-3">
                        <Avatar
                          sx={{ width: 40, height: 40, bgcolor: "#7F1D1D" }}
                        >
                          {output.worker_name?.[0]?.toUpperCase() || "I"}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={700}>
                            {output.worker_name}
                          </Typography>
                          <Typography
                            variant="body2"
                            className="text-slate-500"
                          >
                            @{output.worker_username || "worker"}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={700}>
                        {output.product_name}
                      </Typography>
                      <Typography variant="body2" className="text-slate-500">
                        {output.product_sku || output.product_model || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={output.department_name || "-"}
                      />
                    </TableCell>
                    <TableCell>{formatNumber(output.quantity)}</TableCell>
                    <TableCell>{formatMoney(output.price_per_unit)}</TableCell>
                    <TableCell>
                      <Typography fontWeight={800}>
                        {formatMoney(output.total_amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(output.worked_at)}</TableCell>
                    {canManage && (
                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ justifyContent: "flex-end" }}
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => openEditModal(output)}
                          >
                            O'zgartirish
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={() => {
                              setSelectedOutput(output);
                              setDeleteOpen(true);
                            }}
                          >
                            O'chirish
                          </Button>
                        </Stack>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={canManage ? 8 : 7} align="center">
                    Ish yozuvlari topilmadi
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>

        <TablePagination
          {...uzbekPaginationProps}
          className="shrink-0 border-t border-slate-200"
          component="div"
          count={pageInfo.total}
          page={page}
          rowsPerPage={pageInfo.limit}
          onPageChange={(_, nextPage) =>
            fetchOutputs(nextPage * pageInfo.limit, pageInfo.limit)
          }
          onRowsPerPageChange={(event) =>
            fetchOutputs(0, Number(event.target.value))
          }
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Paper>

      <Dialog open={modalOpen} onClose={closeModals} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 800 }}>
          {selectedOutput ? "Ish yozuvini tahrirlash" : "Ish yozuvi qo'shish"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} className="pt-2">
            <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                select
                required
                label="Ishchi"
                value={form.worker_id}
                onChange={handleFormChange("worker_id")}
              >
                {workers.map((worker) => (
                  <MenuItem key={worker.id} value={worker.id}>
                    {worker.first_name} {worker.last_name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                required
                label="Mahsulot"
                value={form.product_id}
                onChange={handleFormChange("product_id")}
              >
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                required
                label="Bo'lim"
                value={form.department_id}
                onChange={handleFormChange("department_id")}
              >
                {departments.map((department) => (
                  <MenuItem key={department.id} value={department.id}>
                    {department.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                required
                type="number"
                label="Miqdor"
                value={form.quantity}
                onChange={handleFormChange("quantity")}
                slotProps={{ htmlInput: { min: 0, step: 1 } }}
              />
              <TextField
                type="date"
                label="Sana"
                value={form.worked_at}
                onChange={handleFormChange("worked_at")}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Box className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <Typography variant="body2" className="text-slate-500">
                Tanlangan
              </Typography>
              <Typography fontWeight={800} className="mt-1">
                {selectedProduct?.name || "Mahsulot tanlanmagan"} /{" "}
                {selectedDepartment?.name || "Bo'lim tanlanmagan"}
              </Typography>
              <Typography variant="body2" className="mt-1 text-slate-500">
                Narx backenddan mahsulot va bo'lim bo'yicha olinadi, summa
                avtomatik hisoblanadi.
              </Typography>
            </Box>

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Izoh"
              value={form.note}
              onChange={handleFormChange("note")}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModals}>Bekor qilish</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteOpen} onClose={closeModals} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 800 }}>
          Ish yozuvini o'chirish
        </DialogTitle>
        <DialogContent>
          <Typography>
            {selectedOutput?.worker_name} yozuvini o'chirmoqchimisiz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModals}>Bekor qilish</Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "O'chirilmoqda..." : "O'chirish"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkerOutputs;
