import { useState } from "react";
import { ClipboardList, Search, Check, Package, X } from "lucide-react";
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

export function ProjectSidebar({ onPaste }: { onPaste: (text: string) => void }) {
  const [text, setText] = useState("");

  const handlePaste = () => {
    if (!text.trim()) return;
    onPaste(text);
    setText("");
  };

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
        <ClipboardList className="h-4 w-4 text-primary" />
        Вставьте список товаров
      </h3>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Каждый товар с новой строки..."
        rows={8}
        className="w-full rounded-lg border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 resize-none"
      />
      <Button variant="coral" className="w-full" onClick={handlePaste} disabled={!text.trim()}>
        Создать проект
      </Button>

      <div className="border-t border-border pt-4 text-sm text-muted-foreground">
        <p>Вставьте список товаров — каждая строка станет отдельной позицией в таблице проекта.</p>
        <p className="mt-2">Нажмите на строку для поиска и выбора товара из прайс-листов.</p>
      </div>
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
    // Simulate searching
    setItems((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, status: "searching" } : p))
    );
    setTimeout(() => {
      setItems((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, status: "found" } : p))
      );
    }, 800);
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

  const statusBadge = (status: ProjectItem["status"]) => {
    const map = {
      pending: { label: "Ожидает", cls: "bg-muted text-muted-foreground" },
      searching: { label: "Поиск...", cls: "bg-amber-500/20 text-amber-400" },
      found: { label: "Найдено", cls: "bg-blue-500/20 text-blue-400" },
      selected: { label: "Выбрано", cls: "bg-emerald-500/20 text-emerald-400" },
    };
    const s = map[status];
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>
        {s.label}
      </span>
    );
  };

  return {
    sidebar: <ProjectSidebar onPaste={handlePaste} />,
    content: (
      <div className="flex h-full flex-col p-8">
        <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground mb-2">
          <Package className="h-8 w-8 text-primary" />
          Проектный подбор
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Вставьте список товаров в боковой панели, затем выберите подходящие варианты из прайс-листов
        </p>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-3">
              <ClipboardList className="h-16 w-16 text-muted-foreground mx-auto opacity-30" />
              <p className="text-muted-foreground">Вставьте список товаров в боковой панели для начала работы</p>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-card hover:bg-card border-b border-border">
                  <TableHead className="text-muted-foreground w-12">№</TableHead>
                  <TableHead className="text-muted-foreground">Запрос</TableHead>
                  <TableHead className="text-muted-foreground w-28">Статус</TableHead>
                  <TableHead className="text-muted-foreground">Выбранный товар</TableHead>
                  <TableHead className="text-muted-foreground">Поставщик</TableHead>
                  <TableHead className="text-muted-foreground w-24 text-right">Цена</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer hover:bg-accent/50 border-b border-border transition-colors"
                    onClick={() => handleRowClick(item)}
                  >
                    <TableCell className="font-mono text-muted-foreground">{item.id}</TableCell>
                    <TableCell className="text-foreground font-medium">{item.query}</TableCell>
                    <TableCell>{statusBadge(item.status)}</TableCell>
                    <TableCell className="text-foreground">{item.selectedProduct || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{item.supplier || "—"}</TableCell>
                    <TableCell className="text-right font-mono text-foreground">
                      {item.price ? `${item.price.toLocaleString()} ₽` : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Search results sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="bg-card border-border w-[480px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle className="text-foreground flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Результаты поиска
              </SheetTitle>
              {selectedItem && (
                <p className="text-sm text-muted-foreground">
                  Запрос: «{selectedItem.query}»
                </p>
              )}
            </SheetHeader>

            <div className="mt-6 space-y-3">
              {MOCK_RESULTS.map((r) => (
                <div
                  key={r.id}
                  className="rounded-lg border border-border bg-background p-4 space-y-2 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-medium text-foreground">{r.name}</h4>
                    <span className="text-xs rounded-full bg-primary/20 text-primary px-2 py-0.5">
                      {r.match}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{r.supplier}</span>
                    <span className="font-mono text-foreground">{r.price.toLocaleString()} ₽</span>
                  </div>
                  <Button
                    variant="coral"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => handleSelect(r)}
                  >
                    <Check className="h-4 w-4" />
                    Выбрать вариант
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
