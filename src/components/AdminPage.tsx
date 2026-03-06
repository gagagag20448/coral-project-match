import { useState } from "react";
import {
  Settings, Truck, FileSpreadsheet, Database, Trash2, Plus, Play,
  CheckCircle2, Loader2, Upload, Power, Clock, Package, Wifi, X,
  ChevronRight, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

/* ─── Types ─── */
interface PriceList {
  name: string;
  uploadedAt: string;
  rows: number;
  active: boolean;
}

interface Supplier {
  id: string;
  name: string;
  deliveryDays: number;
  priceLists: PriceList[];
}

/* ─── Data ─── */
const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: "1", name: "WoltaPro Estetica", deliveryDays: 1,
    priceLists: [
      { name: "WoltaProEstetica.xlsm", uploadedAt: "19.12.2025", rows: 12450, active: true },
      { name: "WoltaPro_old.xlsx", uploadedAt: "01.11.2025", rows: 11200, active: false },
    ],
  },
  {
    id: "2", name: "EKF Электро", deliveryDays: 3,
    priceLists: [
      { name: "EKF_catalog_2025.xlsx", uploadedAt: "20.12.2025", rows: 18900, active: true },
    ],
  },
  {
    id: "3", name: "Schneider Electric", deliveryDays: 5,
    priceLists: [],
  },
];

/* ─── Sidebar with Processing & Vectorization ─── */
function AdminSidebar({
  activeSuppliers,
  procStatus,
  procProgress,
  procStep,
  onRunProcessing,
  vecStatus,
  vecProgress,
  onRunVectorization,
}: {
  activeSuppliers: number;
  procStatus: "idle" | "running" | "done";
  procProgress: number;
  procStep: string;
  onRunProcessing: () => void;
  vecStatus: "idle" | "running" | "done";
  vecProgress: number;
  onRunVectorization: () => void;
}) {
  return (
    <div className="space-y-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Settings className="h-4 w-4 text-muted-foreground" />
        Инструменты
      </h3>

      {/* Processing */}
      <div className="rounded-lg border border-border bg-card p-3 space-y-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Обработка прайсов</span>
        </div>
        <p className="text-xs text-muted-foreground">Извлечение данных из прайс-листов</p>

        <div className="flex gap-2 text-xs">
          <div className="flex-1 rounded-md bg-muted/50 p-2 text-center">
            <p className="font-bold text-foreground">{activeSuppliers}</p>
            <p className="text-[10px] text-muted-foreground">Прайсов</p>
          </div>
          <div className="flex-1 rounded-md bg-muted/50 p-2 text-center">
            <p className="font-bold text-foreground">19.12</p>
            <p className="text-[10px] text-muted-foreground">Обработка</p>
          </div>
        </div>

        {procStatus !== "idle" && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs">
              {procStatus === "running" ? (
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
              ) : (
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              )}
              <span className={procStatus === "done" ? "text-emerald-400" : "text-foreground"}>{procStep}</span>
            </div>
            <Progress value={Math.min(procProgress, 100)} className="h-1.5 [&>div]:bg-primary [&>div]:transition-all" />
          </div>
        )}

        <Button variant="coral" size="sm" className="gap-1.5 w-full text-xs" onClick={onRunProcessing} disabled={procStatus === "running"}>
          {procStatus === "running" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
          {procStatus === "done" ? "Повторить" : "Запустить"}
        </Button>
      </div>

      {/* Vectorization */}
      <div className="rounded-lg border border-border bg-card p-3 space-y-3">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Векторизация</span>
        </div>
        <p className="text-xs text-muted-foreground">Умный поиск по товарам</p>

        <div className="flex items-center gap-2 rounded-md bg-emerald-500/5 border border-emerald-500/20 p-2 text-xs">
          <Wifi className="h-3 w-3 text-emerald-400" />
          <span className="text-emerald-400 font-medium">Подключено</span>
          <span className="text-muted-foreground ml-auto text-[10px]">40 356 · 768d</span>
        </div>

        {vecStatus !== "idle" && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs">
              {vecStatus === "running" ? (
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
              ) : (
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              )}
              <span className={vecStatus === "done" ? "text-emerald-400" : "text-foreground"}>
                {vecStatus === "done" ? "Завершено" : "Обработка..."}
              </span>
            </div>
            <Progress value={Math.min(vecProgress, 100)} className="h-1.5 [&>div]:bg-primary [&>div]:transition-all" />
          </div>
        )}

        <Button variant="coral" size="sm" className="gap-1.5 w-full text-xs" onClick={onRunVectorization} disabled={vecStatus === "running"}>
          {vecStatus === "running" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
          {vecStatus === "done" ? "Повторить" : "Запустить"}
        </Button>
      </div>
    </div>
  );
}

/* ─── Supplier Card (compact, clickable) ─── */
function SupplierCard({ supplier, onDelete, onClick }: { supplier: Supplier; onDelete: (e: React.MouseEvent) => void; onClick: () => void }) {
  const totalRows = supplier.priceLists.filter(p => p.active).reduce((s, p) => s + p.rows, 0);
  const activePLCount = supplier.priceLists.filter(p => p.active).length;

  return (
    <div
      className="rounded-xl border border-border bg-card p-4 space-y-3 hover:border-primary/30 transition-colors cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
            <Package className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-foreground text-sm truncate">{supplier.name}</h4>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{supplier.deliveryDays} дн.</span>
              <span>{activePLCount} прайс{activePLCount !== 1 ? "а" : ""}</span>
              {totalRows > 0 && <span className="text-emerald-400">{totalRows.toLocaleString()} поз.</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>

      {/* Quick status */}
      {supplier.priceLists.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-2 text-center">
          <p className="text-xs text-muted-foreground">Нет прайс-листов</p>
        </div>
      ) : (
        <div className="flex gap-1.5">
          {supplier.priceLists.map((pl, i) => (
            <div
              key={i}
              className={`flex-1 rounded-md px-2 py-1.5 text-[10px] text-center truncate ${
                pl.active
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  : "bg-muted/30 text-muted-foreground"
              }`}
              title={pl.name}
            >
              {pl.active ? "● " : ""}{pl.name.length > 15 ? pl.name.slice(0, 15) + "…" : pl.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Supplier Detail Dialog ─── */
function SupplierDialog({ supplier, open, onClose }: { supplier: Supplier | null; open: boolean; onClose: () => void }) {
  if (!supplier) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span>{supplier.name}</span>
              <p className="text-xs text-muted-foreground font-normal mt-0.5">
                Доставка: {supplier.deliveryDays} дн. · Прайс-листов: {supplier.priceLists.length}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-primary" />
            Прайс-листы
          </h4>

          {supplier.priceLists.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              <p className="text-sm text-muted-foreground">Нет загруженных прайс-листов</p>
              <Button variant="coral-outline" size="sm" className="mt-3 gap-1.5">
                <Upload className="h-3.5 w-3.5" />
                Загрузить первый прайс
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-muted-foreground">Файл</TableHead>
                    <TableHead className="text-muted-foreground w-28">Дата</TableHead>
                    <TableHead className="text-muted-foreground w-24 text-right">Позиций</TableHead>
                    <TableHead className="text-muted-foreground w-28 text-center">Статус</TableHead>
                    <TableHead className="w-28" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplier.priceLists.map((pl, i) => (
                    <TableRow key={i} className="border-b border-border">
                      <TableCell className="text-foreground text-sm flex items-center gap-2">
                        <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground" />
                        {pl.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{pl.uploadedAt}</TableCell>
                      <TableCell className="text-right text-sm text-foreground font-mono">{pl.rows.toLocaleString()}</TableCell>
                      <TableCell className="text-center">
                        {pl.active ? (
                          <span className="text-xs text-emerald-400 font-medium">● Активен</span>
                        ) : (
                          <button className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 mx-auto">
                            <Power className="h-3 w-3" /> Включить
                          </button>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground hover:text-destructive gap-1">
                          <Trash2 className="h-3 w-3" />
                          Удалить
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <Button variant="coral-outline" size="sm" className="gap-1.5 w-full text-xs">
            <Upload className="h-3.5 w-3.5" />
            Загрузить новый прайс-лист
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Main Admin Page ─── */
export function AdminPage() {
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);

  // Processing state
  const [procStatus, setProcStatus] = useState<"idle" | "running" | "done">("idle");
  const [procProgress, setProcProgress] = useState(0);
  const [procStep, setProcStep] = useState("");

  // Vectorization state
  const [vecStatus, setVecStatus] = useState<"idle" | "running" | "done">("idle");
  const [vecProgress, setVecProgress] = useState(0);

  const procSteps = [
    "Чтение файлов прайс-листов...",
    "Извлечение данных из таблиц...",
    "Нормализация наименований...",
    "Сопоставление характеристик...",
    "Сохранение в базу данных...",
  ];

  const handleRunProcessing = () => {
    setProcStatus("running");
    setProcProgress(0);
    let stepIdx = 0;
    setProcStep(procSteps[0]);
    const interval = setInterval(() => {
      setProcProgress((p) => {
        const next = p + Math.random() * 8 + 2;
        const newIdx = Math.min(Math.floor(next / 20), procSteps.length - 1);
        if (newIdx !== stepIdx) { stepIdx = newIdx; setProcStep(procSteps[stepIdx]); }
        if (next >= 100) { clearInterval(interval); setProcStatus("done"); setProcStep("Готово!"); return 100; }
        return next;
      });
    }, 300);
  };

  const handleRunVectorization = () => {
    setVecStatus("running");
    setVecProgress(0);
    const interval = setInterval(() => {
      setVecProgress((p) => {
        const next = p + Math.random() * 6 + 1;
        if (next >= 100) { clearInterval(interval); setVecStatus("done"); return 100; }
        return next;
      });
    }, 400);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  const handleCardClick = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setSupplierDialogOpen(true);
  };

  const activeSuppliers = suppliers.filter(s => s.priceLists.some(p => p.active)).length;
  const totalProducts = suppliers.reduce((sum, s) => sum + s.priceLists.filter(p => p.active).reduce((a, p) => a + p.rows, 0), 0);

  return {
    sidebar: (
      <AdminSidebar
        activeSuppliers={activeSuppliers}
        procStatus={procStatus}
        procProgress={procProgress}
        procStep={procStep}
        onRunProcessing={handleRunProcessing}
        vecStatus={vecStatus}
        vecProgress={vecProgress}
        onRunVectorization={handleRunVectorization}
      />
    ),
    content: (
      <div className="p-8 space-y-6 max-w-5xl overflow-y-auto h-full">
        {/* Header */}
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
            <Settings className="h-8 w-8 text-primary" />
            Управление системой
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Поставщиков: <span className="text-foreground font-medium">{suppliers.length}</span>
            {" · "}Активных прайсов: <span className="text-foreground font-medium">{activeSuppliers}</span>
            {" · "}Товаров в базе: <span className="text-emerald-400 font-medium">{totalProducts.toLocaleString()}</span>
          </p>
        </div>

        {/* ─── Suppliers ─── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Поставщики
            </h2>
            <p className="text-xs text-muted-foreground">Нажмите на карточку для подробностей</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {suppliers.map((s) => (
              <SupplierCard
                key={s.id}
                supplier={s}
                onDelete={(e) => handleDelete(e, s.id)}
                onClick={() => handleCardClick(s)}
              />
            ))}
            {/* Add card */}
            <button className="rounded-xl border-2 border-dashed border-border hover:border-primary/40 p-6 flex flex-col items-center justify-center gap-2 transition-colors group min-h-[120px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Добавить поставщика</span>
            </button>
          </div>
        </section>

        {/* Supplier detail dialog */}
        <SupplierDialog
          supplier={selectedSupplier}
          open={supplierDialogOpen}
          onClose={() => setSupplierDialogOpen(false)}
        />
      </div>
    ),
  };
}
