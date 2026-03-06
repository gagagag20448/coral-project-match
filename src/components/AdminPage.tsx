import { useState } from "react";
import {
  Settings, Truck, FileSpreadsheet, Database, Trash2, Plus, Play,
  CheckCircle2, Loader2, Upload, Power, Clock, Package, Wifi,
  ChevronRight, ArrowLeft,
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
type AdminSubPage = "suppliers" | "processing" | "vectorization";

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

/* ─── Sidebar with navigation ─── */
function AdminSidebar({
  activePage,
  onPageChange,
  activeSuppliers,
  totalProducts,
  supplierCount,
}: {
  activePage: AdminSubPage;
  onPageChange: (p: AdminSubPage) => void;
  activeSuppliers: number;
  totalProducts: number;
  supplierCount: number;
}) {
  const navItems: { id: AdminSubPage; icon: typeof Truck; label: string; desc: string }[] = [
    { id: "suppliers", icon: Truck, label: "Поставщики", desc: `${supplierCount} поставщиков` },
    { id: "processing", icon: FileSpreadsheet, label: "Обработка прайсов", desc: "Извлечение данных" },
    { id: "vectorization", icon: Database, label: "Векторизация", desc: "Умный поиск" },
  ];

  return (
    <div className="space-y-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Settings className="h-4 w-4 text-muted-foreground" />
        Панель управления
      </h3>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Поставщики", value: String(supplierCount) },
          { label: "Прайсы", value: String(activeSuppliers) },
          { label: "Товаров", value: totalProducts.toLocaleString() },
        ].map((s, i) => (
          <div key={i} className="rounded-lg bg-card border border-border p-2.5 text-center">
            <p className="text-sm font-bold text-foreground">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Nav items */}
      <div className="space-y-1.5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={`w-full flex items-center gap-3 rounded-lg p-3 text-left transition-colors ${
              activePage === item.id
                ? "bg-primary/10 border border-primary/20 text-foreground"
                : "border border-transparent hover:bg-card hover:border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg flex-shrink-0 ${
              activePage === item.id ? "bg-primary/20" : "bg-muted/50"
            }`}>
              <item.icon className={`h-4 w-4 ${activePage === item.id ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{item.label}</p>
              <p className="text-[10px] text-muted-foreground">{item.desc}</p>
            </div>
            <ChevronRight className={`h-4 w-4 flex-shrink-0 ${activePage === item.id ? "text-primary" : "text-muted-foreground/50"}`} />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Supplier Card (bigger) ─── */
function SupplierCard({ supplier, onDelete, onClick }: { supplier: Supplier; onDelete: (e: React.MouseEvent) => void; onClick: () => void }) {
  const totalRows = supplier.priceLists.filter(p => p.active).reduce((s, p) => s + p.rows, 0);
  const activePLCount = supplier.priceLists.filter(p => p.active).length;

  return (
    <div
      className="rounded-xl border border-border bg-card p-5 space-y-4 hover:border-primary/30 transition-colors cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 flex-shrink-0">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-foreground text-base truncate">{supplier.name}</h4>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Доставка: {supplier.deliveryDays} дн.</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>

      {/* Stats row */}
      <div className="flex gap-3">
        <div className="flex-1 rounded-lg bg-muted/30 p-2.5 text-center">
          <p className="text-sm font-bold text-foreground">{activePLCount}</p>
          <p className="text-[10px] text-muted-foreground">Активных прайсов</p>
        </div>
        <div className="flex-1 rounded-lg bg-muted/30 p-2.5 text-center">
          <p className="text-sm font-bold text-foreground">{totalRows > 0 ? totalRows.toLocaleString() : "—"}</p>
          <p className="text-[10px] text-muted-foreground">Позиций</p>
        </div>
      </div>

      {/* Price list pills */}
      {supplier.priceLists.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-3 text-center">
          <p className="text-xs text-muted-foreground">Нет прайс-листов</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {supplier.priceLists.map((pl, i) => (
            <div
              key={i}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${
                pl.active
                  ? "bg-emerald-500/10 border border-emerald-500/20"
                  : "bg-muted/30 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-foreground truncate">{pl.name}</span>
              </div>
              {pl.active ? (
                <span className="text-emerald-400 font-medium flex-shrink-0 text-[10px]">● Активен</span>
              ) : (
                <span className="text-muted-foreground flex-shrink-0 text-[10px]">Неактивен</span>
              )}
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

/* ─── Processing Page ─── */
function ProcessingPage({
  activeSuppliers,
  procStatus,
  procProgress,
  procStep,
  onRunProcessing,
}: {
  activeSuppliers: number;
  procStatus: "idle" | "running" | "done";
  procProgress: number;
  procStep: string;
  onRunProcessing: () => void;
}) {
  const steps = [
    { label: "Чтение файлов прайс-листов", done: procProgress > 20 },
    { label: "Извлечение данных из таблиц", done: procProgress > 40 },
    { label: "Нормализация наименований", done: procProgress > 60 },
    { label: "Сопоставление характеристик", done: procProgress > 80 },
    { label: "Сохранение в базу данных", done: procProgress >= 100 },
  ];

  return (
    <div className="p-8 space-y-8 max-w-3xl">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
          <FileSpreadsheet className="h-8 w-8 text-primary" />
          Обработка прайсов
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Извлечение данных из загруженных прайс-листов и сохранение в базу данных
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Активных прайсов", value: String(activeSuppliers), color: "text-foreground" },
          { label: "Последняя обработка", value: "19.12.2025", color: "text-foreground" },
          { label: "Статус", value: procStatus === "done" ? "Завершено" : procStatus === "running" ? "В процессе" : "Готов к запуску", color: procStatus === "done" ? "text-emerald-400" : procStatus === "running" ? "text-amber-400" : "text-muted-foreground" },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4">
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Steps */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h3 className="text-sm font-semibold text-foreground">Этапы обработки</h3>
        <div className="space-y-3">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full flex-shrink-0 text-xs font-bold ${
                step.done
                  ? "bg-emerald-500/20 text-emerald-400"
                  : procStatus === "running" && !step.done && (i === 0 || steps[i - 1].done)
                    ? "bg-primary/20 text-primary animate-pulse"
                    : "bg-muted text-muted-foreground"
              }`}>
                {step.done ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-sm ${step.done ? "text-emerald-400" : "text-foreground"}`}>{step.label}</span>
            </div>
          ))}
        </div>

        {procStatus !== "idle" && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs">
              <span className={procStatus === "done" ? "text-emerald-400 font-medium" : "text-foreground"}>{procStep}</span>
              <span className="text-muted-foreground">{Math.min(Math.round(procProgress), 100)}%</span>
            </div>
            <Progress value={Math.min(procProgress, 100)} className="h-2.5 [&>div]:bg-primary [&>div]:transition-all" />
          </div>
        )}

        <Button variant="coral" className="gap-2 w-full" onClick={onRunProcessing} disabled={procStatus === "running"}>
          {procStatus === "running" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {procStatus === "done" ? "Повторить обработку" : "Запустить обработку"}
        </Button>
      </div>
    </div>
  );
}

/* ─── Vectorization Page ─── */
function VectorizationPage({
  vecStatus,
  vecProgress,
  onRunVectorization,
}: {
  vecStatus: "idle" | "running" | "done";
  vecProgress: number;
  onRunVectorization: () => void;
}) {
  return (
    <div className="p-8 space-y-8 max-w-3xl">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
          <Database className="h-8 w-8 text-primary" />
          Векторизация
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Создание векторных представлений товаров для умного семантического поиска
        </p>
      </div>

      {/* Connection status */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Статус подключения</h3>
        <div className="flex items-center gap-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
            <Wifi className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-400">Подключено</p>
            <p className="text-xs text-muted-foreground">Векторная база данных активна</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Векторов", value: "40 356" },
            { label: "Размерность", value: "768" },
            { label: "Модель", value: "e5-large" },
          ].map((s, i) => (
            <div key={i} className="rounded-lg bg-muted/30 border border-border p-3 text-center">
              <p className="text-sm font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Run */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Запуск векторизации</h3>
        <p className="text-xs text-muted-foreground">
          Процесс создаст векторные представления для всех новых товаров в базе. Существующие векторы не будут перезаписаны.
        </p>

        {vecStatus !== "idle" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {vecStatus === "running" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                )}
                <span className={vecStatus === "done" ? "text-emerald-400 font-medium" : "text-foreground"}>
                  {vecStatus === "done" ? "Векторизация завершена" : "Обработка товаров..."}
                </span>
              </div>
              <span className="text-muted-foreground">{Math.min(Math.round(vecProgress), 100)}%</span>
            </div>
            <Progress value={Math.min(vecProgress, 100)} className="h-2.5 [&>div]:bg-primary [&>div]:transition-all" />
          </div>
        )}

        <Button variant="coral" className="gap-2 w-full" onClick={onRunVectorization} disabled={vecStatus === "running"}>
          {vecStatus === "running" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {vecStatus === "done" ? "Повторить векторизацию" : "Запустить векторизацию"}
        </Button>
      </div>
    </div>
  );
}

/* ─── Suppliers Page ─── */
function SuppliersPage({
  suppliers,
  onDelete,
  onCardClick,
  activeSuppliers,
  totalProducts,
}: {
  suppliers: Supplier[];
  onDelete: (e: React.MouseEvent, id: string) => void;
  onCardClick: (s: Supplier) => void;
  activeSuppliers: number;
  totalProducts: number;
}) {
  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
          <Truck className="h-8 w-8 text-primary" />
          Поставщики
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Всего: <span className="text-foreground font-medium">{suppliers.length}</span>
          {" · "}Активных прайсов: <span className="text-foreground font-medium">{activeSuppliers}</span>
          {" · "}Товаров: <span className="text-emerald-400 font-medium">{totalProducts.toLocaleString()}</span>
          <span className="ml-3 text-muted-foreground/60">· Нажмите на карточку для подробностей</span>
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {suppliers.map((s) => (
          <SupplierCard
            key={s.id}
            supplier={s}
            onDelete={(e) => onDelete(e, s.id)}
            onClick={() => onCardClick(s)}
          />
        ))}
        <button className="rounded-xl border-2 border-dashed border-border hover:border-primary/40 p-8 flex flex-col items-center justify-center gap-3 transition-colors group min-h-[180px]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
            <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Добавить поставщика</span>
        </button>
      </div>
    </div>
  );
}

/* ─── Main Admin Page ─── */
export function AdminPage() {
  const [subPage, setSubPage] = useState<AdminSubPage>("suppliers");
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);

  const [procStatus, setProcStatus] = useState<"idle" | "running" | "done">("idle");
  const [procProgress, setProcProgress] = useState(0);
  const [procStep, setProcStep] = useState("");

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

  const renderContent = () => {
    switch (subPage) {
      case "suppliers":
        return (
          <>
            <SuppliersPage
              suppliers={suppliers}
              onDelete={handleDelete}
              onCardClick={handleCardClick}
              activeSuppliers={activeSuppliers}
              totalProducts={totalProducts}
            />
            <SupplierDialog
              supplier={selectedSupplier}
              open={supplierDialogOpen}
              onClose={() => setSupplierDialogOpen(false)}
            />
          </>
        );
      case "processing":
        return (
          <ProcessingPage
            activeSuppliers={activeSuppliers}
            procStatus={procStatus}
            procProgress={procProgress}
            procStep={procStep}
            onRunProcessing={handleRunProcessing}
          />
        );
      case "vectorization":
        return (
          <VectorizationPage
            vecStatus={vecStatus}
            vecProgress={vecProgress}
            onRunVectorization={handleRunVectorization}
          />
        );
    }
  };

  return {
    sidebar: (
      <AdminSidebar
        activePage={subPage}
        onPageChange={setSubPage}
        activeSuppliers={activeSuppliers}
        totalProducts={totalProducts}
        supplierCount={suppliers.length}
      />
    ),
    content: (
      <div className="h-full overflow-y-auto">
        {renderContent()}
      </div>
    ),
  };
}
