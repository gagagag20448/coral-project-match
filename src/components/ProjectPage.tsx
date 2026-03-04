import { useState } from "react";
import { ClipboardList, Search, Check, Package, ArrowRight, Sparkles, MousePointerClick, ListChecks, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface ProjectItem {
  id: number;
  query: string;
  status: "pending" | "searching" | "found" | "selected";
  selectedProduct?: string;
  supplier?: string;
  price?: number;
}

interface SearchResult {
  id: string;
  name: string;
  supplier: string;
  price: number;
  match: number;
}

const MOCK_RESULTS: SearchResult[] = [
  { id: "1", name: "Автомат дифференциальный C50 100мА 6кА AC", supplier: "Поставщик 1", price: 2450, match: 95 },
  { id: "2", name: "Автомат диф. C50 100мА 6кА тип AC IEK", supplier: "Поставщик 2", price: 2680, match: 88 },
  { id: "3", name: "АВДТ С50 100мА 6кА АС Schneider", supplier: "Поставщик 1", price: 3100, match: 82 },
];

const EXAMPLE_ITEMS = `Автомат дифференциальный С50 100мА
Кабель ВВГнг 3x2.5
Розетка двойная с заземлением`;

export function ProjectSidebar({ onPaste, hasItems }: { onPaste: (text: string) => void; hasItems: boolean }) {
  const [text, setText] = useState("");

  const handlePaste = () => {
    if (!text.trim()) return;
    onPaste(text);
    setText("");
  };

  return (
    <div className="space-y-5">
      {/* Instructions */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Как это работает?</h3>
        <div className="space-y-2">
          {[
            { icon: FileText, text: "Вставьте список товаров ниже" },
            { icon: MousePointerClick, text: "Нажмите на строку в таблице" },
            { icon: ListChecks, text: "Выберите подходящий вариант" },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg bg-card p-2.5 border border-border">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">
                {i + 1}
              </div>
              <step.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-foreground">{step.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Список товаров</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={EXAMPLE_ITEMS}
          rows={6}
          className="w-full rounded-lg border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 resize-none transition-colors"
        />
        <p className="text-xs text-muted-foreground">Каждый товар — с новой строки</p>
      </div>

      <Button variant="coral" className="w-full gap-2" onClick={handlePaste} disabled={!text.trim()}>
        <Sparkles className="h-4 w-4" />
        {hasItems ? "Добавить позиции" : "Создать проект"}
      </Button>

      {/* Quick paste example */}
      <button
        onClick={() => setText(EXAMPLE_ITEMS)}
        className="w-full text-xs text-muted-foreground hover:text-primary transition-colors text-center"
      >
        Вставить пример →
      </button>
    </div>
  );
}

export function ProjectPage() {
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ProjectItem | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const handlePaste = (text: string) => {
    const lines = text.split("\n").filter((l) => l.trim());
    const newItems: ProjectItem[] = lines.map((line, i) => ({
      id: items.length + i + 1,
      query: line.trim(),
      status: "pending",
    }));
    setItems((prev) => [...prev, ...newItems]);
  };

  const handleRowClick = (item: ProjectItem) => {
    setSelectedItem(item);
    setSheetOpen(true);
    setItems((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, status: "searching" } : p))
    );
    setTimeout(() => {
      setItems((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, status: "found" } : p))
      );
    }, 600);
  };

  const handleSelect = (result: SearchResult) => {
    if (!selectedItem) return;
    setItems((prev) =>
      prev.map((p) =>
        p.id === selectedItem.id
          ? {
              ...p,
              status: "selected",
              selectedProduct: result.name,
              supplier: result.supplier,
              price: result.price,
            }
          : p
      )
    );
    setSheetOpen(false);
  };

  const statusConfig: Record<ProjectItem["status"], { label: string; cls: string }> = {
    pending: { label: "Ожидает", cls: "bg-muted text-muted-foreground" },
    searching: { label: "Поиск...", cls: "bg-amber-500/20 text-amber-400 animate-pulse" },
    found: { label: "Найдено", cls: "bg-blue-500/20 text-blue-400" },
    selected: { label: "✓ Выбрано", cls: "bg-emerald-500/20 text-emerald-400" },
  };

  const selectedCount = items.filter((i) => i.status === "selected").length;

  return {
    sidebar: <ProjectSidebar onPaste={handlePaste} hasItems={items.length > 0} />,
    content: (
      <div className="flex h-full flex-col p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
            <Package className="h-8 w-8 text-primary" />
            Проектный подбор
          </h1>
          {items.length > 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              Позиций: <span className="text-foreground font-medium">{items.length}</span>
              {selectedCount > 0 && (
                <> · Подобрано: <span className="text-emerald-400 font-medium">{selectedCount}</span></>
              )}
              {" · "}
              <span className="text-primary">Нажмите на строку</span> чтобы подобрать товар
            </p>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty state */
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md space-y-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                <ClipboardList className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-foreground">Начните новый проект</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Вставьте список нужных товаров в боковую панель слева. 
                  Система подберёт подходящие варианты из прайс-листов поставщиков.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <ArrowRight className="h-4 w-4 text-primary" />
                <span>Используйте панель слева для начала</span>
              </div>
            </div>
          </div>
        ) : (
          /* Table */
          <div className="rounded-lg border border-border overflow-hidden flex-1">
            <div className="overflow-auto h-full scrollbar-thin">
              <Table>
                <TableHeader>
                  <TableRow className="bg-card hover:bg-card border-b border-border">
                    <TableHead className="text-muted-foreground w-12">№</TableHead>
                    <TableHead className="text-muted-foreground">Что ищем</TableHead>
                    <TableHead className="text-muted-foreground w-28">Статус</TableHead>
                    <TableHead className="text-muted-foreground">Найденный товар</TableHead>
                    <TableHead className="text-muted-foreground">Поставщик</TableHead>
                    <TableHead className="text-muted-foreground w-24 text-right">Цена</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const st = statusConfig[item.status];
                    return (
                      <TableRow
                        key={item.id}
                        className={`cursor-pointer border-b border-border transition-colors ${
                          item.status === "selected"
                            ? "hover:bg-emerald-500/5"
                            : "hover:bg-primary/5"
                        }`}
                        onClick={() => handleRowClick(item)}
                      >
                        <TableCell className="font-mono text-muted-foreground text-xs">{item.id}</TableCell>
                        <TableCell className="text-foreground">{item.query}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${st.cls}`}>
                            {st.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-foreground text-sm">{item.selectedProduct || <span className="text-muted-foreground/50">нажмите для подбора</span>}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{item.supplier || "—"}</TableCell>
                        <TableCell className="text-right font-mono text-sm text-foreground">
                          {item.price ? `${item.price.toLocaleString()} ₽` : "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Search results sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="bg-card border-border w-[480px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle className="text-foreground flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Варианты из прайс-листов
              </SheetTitle>
              {selectedItem && (
                <p className="text-sm text-muted-foreground mt-1">
                  Ищем: <span className="text-foreground">«{selectedItem.query}»</span>
                </p>
              )}
            </SheetHeader>

            <div className="mt-6 space-y-3">
              {MOCK_RESULTS.map((r) => (
                <div
                  key={r.id}
                  className="group rounded-lg border border-border bg-background p-4 space-y-3 hover:border-primary/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium text-foreground leading-snug">{r.name}</h4>
                    <span className="flex-shrink-0 text-xs rounded-full bg-primary/15 text-primary px-2 py-0.5 font-medium">
                      {r.match}% совпад.
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{r.supplier}</span>
                    <span className="font-mono font-semibold text-foreground">{r.price.toLocaleString()} ₽</span>
                  </div>
                  <Button
                    variant="coral"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => handleSelect(r)}
                  >
                    <Check className="h-4 w-4" />
                    Выбрать этот вариант
                  </Button>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    ),
  };
}
