import { useState } from "react";
import {
  Settings,
  Truck,
  FileSpreadsheet,
  Zap,
  Database,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash2,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Supplier {
  id: string;
  name: string;
  deliveryDays: number;
  activePriceList: string;
  activatedAt: string;
  vectorized: boolean;
  expanded: boolean;
}

const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: "1",
    name: "Поставщик 1",
    deliveryDays: 1,
    activePriceList: "WoltaProEstetica.xlsm",
    activatedAt: "2025-12-19 14:28:55",
    vectorized: true,
    expanded: true,
  },
  {
    id: "2",
    name: "Поставщик 2",
    deliveryDays: 3,
    activePriceList: "EKF_catalog_2025.xlsx",
    activatedAt: "2025-12-20 09:15:00",
    vectorized: false,
    expanded: false,
  },
];

export function AdminSidebar({
  activeSection,
  onSectionChange,
}: {
  activeSection: string;
  onSectionChange: (s: string) => void;
}) {
  const sections = [
    { id: "suppliers", label: "Поставщики", icon: Truck },
    { id: "extract", label: "Извлечь&Обработать", icon: FileSpreadsheet },
    { id: "vectorize", label: "Векторизация", icon: Database },
  ];

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Settings className="h-4 w-4 text-muted-foreground" />
        Панель администратора
      </h3>
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        📋 Выбрать:
      </p>
      <div className="space-y-1">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => onSectionChange(s.id)}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
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

function SupplierCard({ supplier, onToggle }: { supplier: Supplier; onToggle: () => void }) {
  const statusDots = [
    "bg-emerald-400",
    "bg-emerald-500",
    "bg-emerald-400",
    "bg-emerald-500",
    supplier.vectorized ? "bg-emerald-400" : "bg-muted-foreground/30",
  ];

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-2 p-4 text-left hover:bg-accent/30 transition-colors"
      >
        {supplier.expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="font-medium text-foreground">{supplier.name}</span>
      </button>

      {supplier.expanded && (
        <div className="border-t border-border p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-muted-foreground">Поставщик:</span>
            <span className="text-foreground font-medium">{supplier.name}</span>
            <span className="text-muted-foreground">Срок доставки:</span>
            <span className="text-foreground font-medium">{supplier.deliveryDays} дн.</span>
          </div>

          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Прайс-листы</span>
            <div className="rounded-lg border border-border bg-background p-3 space-y-2">
              <p className="text-sm font-medium text-foreground">Активный прайс</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                  {supplier.activePriceList}
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                  supplier.vectorized
                    ? "bg-pink-500/20 text-pink-400"
                    : "bg-muted text-muted-foreground"
                }`}>
                  <span className="text-pink-400">●</span>
                  {supplier.vectorized ? "Векторизован" : "Не векторизован"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Активирован: {supplier.activatedAt}
              </p>
              <div className="flex gap-1">
                {statusDots.map((cls, i) => (
                  <div key={i} className={`status-dot ${cls}`} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground italic">
                Для работы с прайс-листами перейдите в редактирование
              </p>
              <div className="flex items-center justify-between pt-2">
                <Button variant="surface" size="icon" className="h-8 w-8">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="surface" size="icon" className="h-8 w-8">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProcessSection({ title, description, icon: Icon, buttonLabel }: {
  title: string;
  description: string;
  icon: React.ElementType;
  buttonLabel: string;
}) {
  const [status, setStatus] = useState<"idle" | "running" | "done">("idle");
  const [progress, setProgress] = useState(0);

  const handleRun = () => {
    setStatus("running");
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setStatus("done");
          return 100;
        }
        return p + Math.random() * 15;
      });
    }, 400);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {status === "running" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-amber-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Обработка в процессе...
          </div>
          <Progress value={Math.min(progress, 100)} className="h-2 [&>div]:bg-primary" />
        </div>
      )}

      {status === "done" && (
        <div className="flex items-center gap-2 text-sm text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          Завершено успешно
        </div>
      )}

      <Button
        variant={status === "idle" ? "coral" : "surface"}
        className="gap-2"
        onClick={handleRun}
        disabled={status === "running"}
      >
        {status === "running" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        {buttonLabel}
      </Button>
    </div>
  );
}

export function AdminPage() {
  const [activeSection, setActiveSection] = useState("suppliers");
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);

  const toggleSupplier = (id: string) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, expanded: !s.expanded } : s))
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case "suppliers":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Управление поставщиками</h2>
              <Button variant="coral-outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Характеристика
              </Button>
            </div>
            <h3 className="text-lg font-medium text-foreground">Список поставщиков</h3>
            <div className="space-y-3">
              {suppliers.map((s) => (
                <SupplierCard key={s.id} supplier={s} onToggle={() => toggleSupplier(s.id)} />
              ))}
            </div>
            <Button variant="surface" className="gap-2">
              <Plus className="h-4 w-4" />
              Добавить поставщика
            </Button>
          </div>
        );
      case "extract":
        return (
          <ProcessSection
            title="Извлечение и обработка прайс-листов"
            description="Извлечение и обработка активных прайс-листов поставщиков"
            icon={FileSpreadsheet}
            buttonLabel="Извлечь & Обработать"
          />
        );
      case "vectorize":
        return (
          <ProcessSection
            title="Векторизация данных"
            description="Создание векторных представлений для быстрого поиска"
            icon={Database}
            buttonLabel="Запустить векторизацию"
          />
        );
      default:
        return null;
    }
  };

  return {
    sidebar: <AdminSidebar activeSection={activeSection} onSectionChange={setActiveSection} />,
    content: (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Административная панель</h1>
        <p className="text-muted-foreground mb-8">
          Пожалуйста, выберите пункт в боковом меню
        </p>
        {renderContent()}
      </div>
    ),
  };
}
