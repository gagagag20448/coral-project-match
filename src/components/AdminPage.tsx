import { useState } from "react";
import {
  Settings,
  Truck,
  FileSpreadsheet,
  Database,
  Pencil,
  Trash2,
  Plus,
  Play,
  CheckCircle2,
  Loader2,
  Upload,
  Power,
  Clock,
  Package,
  Terminal,
  Wifi,
  WifiOff,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

/* ─── Types ─── */
interface PriceList {
  name: string;
  uploadedAt: string;
  active: boolean;
}

interface Supplier {
  id: string;
  name: string;
  deliveryDays: number;
  priceLists: PriceList[];
}

interface LogEntry {
  time: string;
  message: string;
  type: "info" | "success" | "error" | "warn";
}

/* ─── Data ─── */
const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: "1",
    name: "WoltaPro Estetica",
    deliveryDays: 1,
    priceLists: [
      { name: "WoltaProEstetica.xlsm", uploadedAt: "19.12.2025", active: true },
      { name: "WoltaPro_old.xlsx", uploadedAt: "01.11.2025", active: false },
    ],
  },
  {
    id: "2",
    name: "EKF Электро",
    deliveryDays: 3,
    priceLists: [
      { name: "EKF_catalog_2025.xlsx", uploadedAt: "20.12.2025", active: true },
    ],
  },
  {
    id: "3",
    name: "Schneider Electric",
    deliveryDays: 5,
    priceLists: [],
  },
];

const MOCK_LOGS: LogEntry[] = [
  { time: "14:28:01", message: "Подключение к векторной базе...", type: "info" },
  { time: "14:28:02", message: "Соединение установлено (pgvector)", type: "success" },
  { time: "14:28:03", message: "Загрузка модели embeddings...", type: "info" },
  { time: "14:28:05", message: "Модель e5-large-v2 готова", type: "success" },
  { time: "14:28:06", message: "Индекс: 40 356 векторов, 768 измерений", type: "info" },
  { time: "14:28:06", message: "Система готова к работе", type: "success" },
];

/* ─── Sidebar ─── */
export function AdminSidebar({
  activeSection,
  onSectionChange,
}: {
  activeSection: string;
  onSectionChange: (s: string) => void;
}) {
  const sections = [
    { id: "suppliers", label: "Поставщики", icon: Truck },
    { id: "extract", label: "Обработка прайсов", icon: FileSpreadsheet },
    { id: "vectorize", label: "Векторизация", icon: Database },
  ];

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <Settings className="h-4 w-4 text-muted-foreground" />
        Панель администратора
      </h3>
      <div className="space-y-1">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => onSectionChange(s.id)}
            className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-all ${
              activeSection === s.id
                ? "bg-primary/10 text-primary border border-primary/30"
                : "text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent"
            }`}
          >
            <s.icon className="h-4 w-4" />
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Supplier Card ─── */
function SupplierCard({ supplier, onDelete }: { supplier: Supplier; onDelete: () => void }) {
  const activePriceList = supplier.priceLists.find((p) => p.active);

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4 hover:border-border/80 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{supplier.name}</h4>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <Clock className="h-3 w-3" />
              Доставка: {supplier.deliveryDays} дн.
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Price lists */}
      <div className="space-y-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Прайс-листы</span>
        {supplier.priceLists.length === 0 ? (
          <p className="text-sm text-muted-foreground/60 italic">Нет загруженных прайс-листов</p>
        ) : (
          <div className="space-y-1.5">
            {supplier.priceLists.map((pl, i) => (
              <div
                key={i}
                className={`flex items-center justify-between rounded-lg p-2.5 text-sm ${
                  pl.active ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-muted/50 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{pl.name}</span>
                  <span className="text-xs text-muted-foreground">({pl.uploadedAt})</span>
                </div>
                {pl.active ? (
                  <span className="text-xs text-emerald-400 font-medium">● Активен</span>
                ) : (
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground gap-1">
                    <Power className="h-3 w-3" />
                    Активировать
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button variant="coral-outline" size="sm" className="gap-1.5 flex-1">
          <Upload className="h-3.5 w-3.5" />
          Загрузить прайс
        </Button>
        <Button variant="surface" size="sm" className="gap-1.5">
          <Pencil className="h-3.5 w-3.5" />
          Изменить
        </Button>
      </div>
    </div>
  );
}

/* ─── Processing Page ─── */
function ProcessingSection() {
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");

  const steps = [
    "Чтение файлов прайс-листов...",
    "Извлечение данных из таблиц...",
    "Нормализация наименований...",
    "Сопоставление характеристик...",
    "Сохранение в базу данных...",
  ];

  const handleRun = () => {
    setStatus("running");
    setProgress(0);
    let stepIdx = 0;
    setCurrentStep(steps[0]);

    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 8 + 2;
        const newStepIdx = Math.min(Math.floor(next / 20), steps.length - 1);
        if (newStepIdx !== stepIdx) {
          stepIdx = newStepIdx;
          setCurrentStep(steps[stepIdx]);
        }
        if (next >= 100) {
          clearInterval(interval);
          setStatus("done");
          setCurrentStep("Готово!");
          return 100;
        }
        return next;
      });
    }, 300);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Обработка прайс-листов</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Извлечение и обработка данных из всех активных прайс-листов поставщиков
        </p>
      </div>

      {/* Status card */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Поставщиков", value: "3" },
            { label: "Активных прайсов", value: "2" },
            { label: "Последняя обработка", value: "19.12.2025" },
          ].map((s, i) => (
            <div key={i} className="rounded-lg bg-muted/50 p-3 text-center">
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Progress */}
        {status !== "idle" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              {status === "running" ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              )}
              <span className={status === "done" ? "text-emerald-400" : "text-foreground"}>
                {currentStep}
              </span>
            </div>
            <Progress value={Math.min(progress, 100)} className="h-2.5 [&>div]:bg-primary [&>div]:transition-all" />
            <p className="text-xs text-muted-foreground text-right">{Math.min(Math.round(progress), 100)}%</p>
          </div>
        )}

        <Button
          variant="coral"
          className="gap-2 w-full sm:w-auto"
          onClick={handleRun}
          disabled={status === "running"}
        >
          {status === "running" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          {status === "done" ? "Запустить повторно" : "Запустить обработку"}
        </Button>
      </div>
    </div>
  );
}

/* ─── Vectorization Page ─── */
function VectorizationSection() {
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>(MOCK_LOGS);
  const [connected] = useState(true);

  const handleRun = () => {
    setStatus("running");
    setProgress(0);

    const newLogs: LogEntry[] = [
      { time: "14:30:00", message: "Запуск векторизации...", type: "info" },
    ];
    setLogs((prev) => [...prev, ...newLogs]);

    const interval = setInterval(() => {
      setProgress((p) => {
        const next = p + Math.random() * 6 + 1;
        if (next >= 100) {
          clearInterval(interval);
          setStatus("done");
          setLogs((prev) => [
            ...prev,
            { time: "14:32:15", message: "Векторизация завершена. Обработано 40 356 записей.", type: "success" },
          ]);
          return 100;
        }
        return next;
      });
    }, 400);
  };

  const logColor: Record<LogEntry["type"], string> = {
    info: "text-muted-foreground",
    success: "text-emerald-400",
    error: "text-red-400",
    warn: "text-amber-400",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Векторизация данных</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Создание векторных представлений товаров для семантического поиска
        </p>
      </div>

      {/* Connection status */}
      <div className={`flex items-center gap-3 rounded-lg p-3 border ${
        connected ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"
      }`}>
        {connected ? (
          <Wifi className="h-4 w-4 text-emerald-400" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-400" />
        )}
        <span className={`text-sm font-medium ${connected ? "text-emerald-400" : "text-red-400"}`}>
          {connected ? "Подключено к векторной базе" : "Нет подключения"}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Векторов в базе", value: "40 356" },
          { label: "Измерений", value: "768" },
          { label: "Модель", value: "e5-large" },
        ].map((s, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-3 text-center">
            <p className="text-lg font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Progress */}
      {status !== "idle" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            {status === "running" ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            )}
            <span className={status === "done" ? "text-emerald-400" : "text-foreground"}>
              {status === "done" ? "Векторизация завершена" : "Обработка..."}
            </span>
          </div>
          <Progress value={Math.min(progress, 100)} className="h-2.5 [&>div]:bg-primary [&>div]:transition-all" />
        </div>
      )}

      <Button
        variant="coral"
        className="gap-2"
        onClick={handleRun}
        disabled={status === "running"}
      >
        {status === "running" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        {status === "done" ? "Повторить векторизацию" : "Запустить векторизацию"}
      </Button>

      {/* Logs */}
      <div className="space-y-2">
        <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Terminal className="h-4 w-4 text-muted-foreground" />
          Логи системы
        </h3>
        <div className="rounded-lg border border-border bg-background p-3 max-h-64 overflow-y-auto scrollbar-thin font-mono text-xs space-y-1">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-muted-foreground/50 flex-shrink-0">[{log.time}]</span>
              <span className={logColor[log.type]}>{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Admin Page ─── */
export function AdminPage() {
  const [activeSection, setActiveSection] = useState("suppliers");
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);

  const handleDelete = (id: string) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  const renderContent = () => {
    switch (activeSection) {
      case "suppliers":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Поставщики</h2>
                <p className="text-sm text-muted-foreground mt-1">Управление поставщиками и их прайс-листами</p>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {suppliers.map((s) => (
                <SupplierCard key={s.id} supplier={s} onDelete={() => handleDelete(s.id)} />
              ))}
              {/* Add supplier card */}
              <button className="rounded-xl border-2 border-dashed border-border hover:border-primary/40 p-8 flex flex-col items-center justify-center gap-3 transition-colors group">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                  <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Добавить поставщика</span>
              </button>
            </div>
          </div>
        );
      case "extract":
        return <ProcessingSection />;
      case "vectorize":
        return <VectorizationSection />;
      default:
        return null;
    }
  };

  return {
    sidebar: <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />,
    content: (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-foreground mb-1">Административная панель</h1>
        <p className="text-muted-foreground mb-8">Управление данными и настройками системы</p>
        {renderContent()}
      </div>
    ),
  };
}
