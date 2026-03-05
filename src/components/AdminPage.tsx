import { useState } from "react";
import {
  Settings, Truck, FileSpreadsheet, Database, Trash2, Plus, Play,
  CheckCircle2, Loader2, Upload, Power, Clock, Package, Terminal, Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

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

/* ─── Sidebar ─── */
function AdminSidebar() {
  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Settings className="h-4 w-4 text-muted-foreground" />
        Панель управления
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Здесь вы можете управлять поставщиками, загружать прайс-листы и запускать обработку данных.
      </p>
      <div className="space-y-2 text-sm">
        {[
          { icon: Truck, text: "Поставщики и прайс-листы — карточки вверху" },
          { icon: FileSpreadsheet, text: "Обработка прайсов — кнопка внизу" },
          { icon: Database, text: "Векторизация — после обработки" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg bg-card p-2.5 border border-border">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">
              {i + 1}
            </div>
            <item.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-foreground">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Supplier Card (compact, friendly) ─── */
function SupplierCard({ supplier, onDelete }: { supplier: Supplier; onDelete: () => void }) {
  const activePL = supplier.priceLists.find((p) => p.active);
  const totalRows = supplier.priceLists.filter(p => p.active).reduce((s, p) => s + p.rows, 0);

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3 hover:border-primary/20 transition-colors">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Package className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-sm">{supplier.name}</h4>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{supplier.deliveryDays} дн.</span>
              {totalRows > 0 && <span>{totalRows.toLocaleString()} позиций</span>}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Price lists — simplified */}
      {supplier.priceLists.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-3 text-center">
          <p className="text-xs text-muted-foreground">Нет прайс-листов</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {supplier.priceLists.map((pl, i) => (
            <div key={i} className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${
              pl.active
                ? "bg-emerald-500/10 border border-emerald-500/20"
                : "bg-muted/30 border border-transparent"
            }`}>
              <div className="flex items-center gap-2 min-w-0">
                <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-foreground truncate">{pl.name}</span>
                <span className="text-muted-foreground flex-shrink-0">{pl.uploadedAt}</span>
              </div>
              {pl.active ? (
                <span className="text-emerald-400 font-medium flex-shrink-0">● Активен</span>
              ) : (
                <button className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 flex-shrink-0">
                  <Power className="h-3 w-3" /> Включить
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action */}
      <Button variant="coral-outline" size="sm" className="gap-1.5 w-full text-xs">
        <Upload className="h-3.5 w-3.5" />
        Загрузить прайс-лист
      </Button>
    </div>
  );
}

/* ─── Main Admin Page ─── */
export function AdminPage() {
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);

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

  const handleDelete = (id: string) => setSuppliers((prev) => prev.filter((s) => s.id !== id));

  const activeSuppliers = suppliers.filter(s => s.priceLists.some(p => p.active)).length;
  const totalProducts = suppliers.reduce((sum, s) => sum + s.priceLists.filter(p => p.active).reduce((a, p) => a + p.rows, 0), 0);

  return {
    sidebar: <AdminSidebar />,
    content: (
      <div className="p-8 space-y-8 max-w-5xl">
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
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Поставщики
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {suppliers.map((s) => (
              <SupplierCard key={s.id} supplier={s} onDelete={() => handleDelete(s.id)} />
            ))}
            {/* Add card */}
            <button className="rounded-xl border-2 border-dashed border-border hover:border-primary/40 p-6 flex flex-col items-center justify-center gap-2 transition-colors group min-h-[140px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Добавить поставщика</span>
            </button>
          </div>
        </section>

        {/* ─── Processing & Vectorization — side by side ─── */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Processing */}
          <section className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Обработка прайсов</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Извлечение данных из загруженных прайс-листов и сохранение в базу
            </p>

            {/* Mini stats */}
            <div className="flex gap-3">
              {[
                { label: "Прайсов", value: String(activeSuppliers) },
                { label: "Обработка", value: "19.12.2025" },
              ].map((s, i) => (
                <div key={i} className="flex-1 rounded-lg bg-muted/50 p-2.5 text-center">
                  <p className="text-sm font-bold text-foreground">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>

            {procStatus !== "idle" && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  {procStatus === "running" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  )}
                  <span className={procStatus === "done" ? "text-emerald-400" : "text-foreground"}>
                    {procStep}
                  </span>
                </div>
                <Progress value={Math.min(procProgress, 100)} className="h-2 [&>div]:bg-primary [&>div]:transition-all" />
              </div>
            )}

            <Button variant="coral" size="sm" className="gap-2 w-full" onClick={handleRunProcessing} disabled={procStatus === "running"}>
              {procStatus === "running" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
              {procStatus === "done" ? "Повторить" : "Запустить обработку"}
            </Button>
          </section>

          {/* Vectorization */}
          <section className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">Векторизация</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Создание векторов для умного поиска по товарам
            </p>

            {/* Connection + stats */}
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-2 text-xs">
              <Wifi className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Подключено</span>
              <span className="text-muted-foreground ml-auto">40 356 векторов · 768 изм.</span>
            </div>

            {vecStatus !== "idle" && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  {vecStatus === "running" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  )}
                  <span className={vecStatus === "done" ? "text-emerald-400" : "text-foreground"}>
                    {vecStatus === "done" ? "Векторизация завершена" : "Обработка..."}
                  </span>
                </div>
                <Progress value={Math.min(vecProgress, 100)} className="h-2 [&>div]:bg-primary [&>div]:transition-all" />
              </div>
            )}

            <Button variant="coral" size="sm" className="gap-2 w-full" onClick={handleRunVectorization} disabled={vecStatus === "running"}>
              {vecStatus === "running" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
              {vecStatus === "done" ? "Повторить" : "Запустить векторизацию"}
            </Button>
          </section>
        </div>
      </div>
    ),
  };
}
