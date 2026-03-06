import { useState, useRef, KeyboardEvent, useMemo } from "react";
import { Search, Bot, Send, Lightbulb, Settings2, HelpCircle, Trash2, ClipboardList, Sparkles, Check, Package, ArrowRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

// ─── Types ───
type SearchMode = "single" | "batch";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ProjectItem {
  id: number;
  query: string;
  status: "pending" | "searching" | "found" | "selected";
  selectedProduct?: string;
  supplier?: string;
  price?: number;
  article?: string;
  unit?: string;
}

interface SearchResult {
  id: string;
  name: string;
  supplier: string;
  price: number;
  match: number;
  article: string;
  unit: string;
  inStock: boolean;
  deliveryDays: number;
}

const MOCK_RESULTS: SearchResult[] = [
  { id: "1", name: "Автомат дифференциальный C50 100мА 6кА AC", supplier: "WoltaPro", price: 2450, match: 95, article: "АВДТ-50-С", unit: "шт", inStock: true, deliveryDays: 1 },
  { id: "2", name: "Автомат диф. C50 100мА 6кА тип AC IEK", supplier: "EKF Электро", price: 2680, match: 88, article: "IEK-АВДТ-50", unit: "шт", inStock: true, deliveryDays: 3 },
  { id: "3", name: "АВДТ С50 100мА 6кА АС Schneider", supplier: "Schneider", price: 3100, match: 82, article: "SE-АВДТ-50AC", unit: "шт", inStock: false, deliveryDays: 5 },
  { id: "4", name: "Автомат дифф. C50 100мА ABB", supplier: "WoltaPro", price: 3450, match: 78, article: "ABB-DS50", unit: "шт", inStock: true, deliveryDays: 2 },
];

const EXAMPLE_QUERIES = [
  "Выключатель белый двухклавишный 10А 250В",
  "Щит с монтажной панелью-2 IP31 500x400x220 мм",
  "Дифференциальный автомат С50 100мА 6кА тип АС",
];

const EXAMPLE_BATCH = `Автомат дифференциальный С50 100мА
Кабель ВВГнг 3x2.5
Розетка двойная с заземлением`;

// ─── Sidebar ───
function SearchSidebar({
  mode,
  onModeChange,
  onSendQuery,
  onClear,
}: {
  mode: SearchMode;
  onModeChange: (m: SearchMode) => void;
  onSendQuery: (q: string) => void;
  onClear: () => void;
}) {
  const [maxResults, setMaxResults] = useState(30);
  const [temperature, setTemperature] = useState(0.5);

  return (
    <div className="space-y-5">
      {/* Mode switcher */}
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        <button
          onClick={() => onModeChange("single")}
          className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
            mode === "single"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Search className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
          Один товар
        </button>
        <button
          onClick={() => onModeChange("batch")}
          className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
            mode === "batch"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ClipboardList className="inline h-3.5 w-3.5 mr-1.5 -mt-0.5" />
          Список товаров
        </button>
      </div>

      {mode === "single" ? (
        <>
          <Button variant="surface" size="sm" className="gap-2" onClick={onClear}>
            <Trash2 className="h-4 w-4" />
            Очистить разговор
          </Button>

          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Lightbulb className="h-4 w-4 text-amber-400" />
              Примеры запросов
            </h3>
            <div className="space-y-2">
              {EXAMPLE_QUERIES.map((q, i) => (
                <button
                  key={i}
                  onClick={() => onSendQuery(q)}
                  className="w-full text-left rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
                >
                  <span className="text-primary mr-1">●</span> {q}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              Параметры поиска
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Максимум результатов</span>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium text-primary">{maxResults}</span>
              <Slider value={[maxResults]} onValueChange={([v]) => setMaxResults(v)} max={100} min={1} step={1}
                className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_.relative>div]:bg-primary" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Температура LLM</span>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium text-primary">{temperature.toFixed(2)}</span>
              <Slider value={[temperature]} onValueChange={([v]) => setTemperature(v)} max={1} min={0} step={0.01}
                className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_.relative>div]:bg-primary" />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Как это работает?</h3>
            <div className="space-y-2 text-sm">
              {[
                "Вставьте список товаров в поле по центру",
                "Нажмите на строку в таблице",
                "Выберите подходящий вариант",
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg bg-card p-2.5 border border-border">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-xs font-bold">
                    {i + 1}
                  </div>
                  <span className="text-foreground">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-2">
            <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
              <span className="text-pink-400">●</span>
              Подсказка
            </h3>
            <p className="text-sm text-muted-foreground">
              Каждый товар вводите с новой строки. Система найдёт ближайшие совпадения в прайс-листах поставщиков.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ───
export function SearchPage() {
  const [mode, setMode] = useState<SearchMode>("single");

  // Single mode state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dbCount = 40356;

  // Batch mode state
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ProjectItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [batchInput, setBatchInput] = useState("");

  // Search filters
  const [batchSearch, setBatchSearch] = useState("");
  const [dialogSearch, setDialogSearch] = useState("");

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: `Я понимаю, что вы ищете следующие товары:\n\n1. Товар на основе запроса "${text.slice(0, 50)}..."\n\nВсё верно?`,
    };
    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handlePasteBatch = () => {
    if (!batchInput.trim()) return;
    const lines = batchInput.split("\n").filter((l) => l.trim());
    const newItems: ProjectItem[] = lines.map((line, i) => ({
      id: items.length + i + 1,
      query: line.trim(),
      status: "pending",
    }));
    setItems((prev) => [...prev, ...newItems]);
    setBatchInput("");
  };

  const handleRowClick = (item: ProjectItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
    setDialogSearch("");
    setItems((prev) =>
      prev.map((p) => (p.id === item.id ? { ...p, status: "searching" } : p))
    );
    setTimeout(() => {
      setItems((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, status: "found" } : p))
      );
    }, 600);
  };

  const handleSelectResult = (result: SearchResult) => {
    if (!selectedItem) return;
    setItems((prev) =>
      prev.map((p) =>
        p.id === selectedItem.id
          ? { ...p, status: "selected", selectedProduct: result.name, supplier: result.supplier, price: result.price, article: result.article, unit: result.unit }
          : p
      )
    );
    setDialogOpen(false);
  };

  const statusConfig: Record<ProjectItem["status"], { label: string; cls: string }> = {
    pending: { label: "Ожидает", cls: "bg-muted text-muted-foreground" },
    searching: { label: "Поиск...", cls: "bg-amber-500/20 text-amber-400 animate-pulse" },
    found: { label: "Найдено", cls: "bg-blue-500/20 text-blue-400" },
    selected: { label: "✓ Выбрано", cls: "bg-emerald-500/20 text-emerald-400" },
  };

  const selectedCount = items.filter((i) => i.status === "selected").length;

  // Filtered items for batch table
  const filteredItems = useMemo(() => {
    if (!batchSearch.trim()) return items;
    const q = batchSearch.toLowerCase();
    return items.filter(
      (item) =>
        item.query.toLowerCase().includes(q) ||
        (item.selectedProduct && item.selectedProduct.toLowerCase().includes(q)) ||
        (item.supplier && item.supplier.toLowerCase().includes(q)) ||
        (item.article && item.article.toLowerCase().includes(q))
    );
  }, [items, batchSearch]);

  // Filtered results for dialog
  const filteredResults = useMemo(() => {
    if (!dialogSearch.trim()) return MOCK_RESULTS;
    const q = dialogSearch.toLowerCase();
    return MOCK_RESULTS.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.supplier.toLowerCase().includes(q) ||
        r.article.toLowerCase().includes(q)
    );
  }, [dialogSearch]);

  return {
    sidebar: (
      <SearchSidebar
        mode={mode}
        onModeChange={setMode}
        onSendQuery={sendMessage}
        onClear={() => setMessages([])}
      />
    ),
    content: (
      <div className="flex h-full flex-col">
        {mode === "single" ? (
          <>
            <div className="p-8 pb-4">
              <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
                <Search className="h-8 w-8 text-primary" />
                Поиск товаров
              </h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-emerald-400">✓</span>
                В базе данных {dbCount.toLocaleString()} товаров
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-8 space-y-4 scrollbar-thin">
              {messages.map((msg) => (
                <div key={msg.id} className="flex gap-3">
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                    msg.role === "user" ? "bg-primary/20 text-primary" : "bg-emerald-500/20 text-emerald-400"
                  }`}>
                    {msg.role === "user" ? <Search className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`rounded-lg p-4 max-w-[80%] ${
                    msg.role === "user"
                      ? "bg-primary/10 border border-primary/30 text-foreground"
                      : "bg-card border border-border text-foreground"
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 pt-4">
              <div className="flex items-end gap-2 rounded-lg border border-border bg-card p-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Введите ваш запрос..."
                  rows={1}
                  className="flex-1 resize-none bg-transparent p-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <Button variant="coral" size="icon" onClick={() => sendMessage(input)} disabled={!input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* ─── Batch mode ─── */
          <div className="flex h-full flex-col">
            <div className="p-8 pb-4">
              <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
                <Package className="h-8 w-8 text-primary" />
                Подбор по списку
              </h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <span className="text-emerald-400">✓</span>
                В базе данных {dbCount.toLocaleString()} товаров
                {items.length > 0 && (
                  <>
                    {" · "}Позиций: <span className="text-foreground font-medium">{items.length}</span>
                    {selectedCount > 0 && (
                      <> · Подобрано: <span className="text-emerald-400 font-medium">{selectedCount}</span></>
                    )}
                  </>
                )}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-8 scrollbar-thin">
              {items.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center max-w-sm space-y-4">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                      <ClipboardList className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground">Вставьте список товаров ниже</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Введите названия товаров (каждый с новой строки) в поле внизу, и система подберёт варианты из прайс-листов.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <ArrowRight className="h-4 w-4 text-primary" />
                      <span>Поле ввода находится внизу</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Search filter for batch table */}
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
                    <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <input
                      value={batchSearch}
                      onChange={(e) => setBatchSearch(e.target.value)}
                      placeholder="Поиск по таблице..."
                      className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                    {batchSearch && (
                      <button onClick={() => setBatchSearch("")} className="text-xs text-muted-foreground hover:text-foreground">
                        ✕
                      </button>
                    )}
                    <span className="text-xs text-muted-foreground">{filteredItems.length} из {items.length}</span>
                  </div>

                  <div className="rounded-lg border border-border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-card hover:bg-card border-b border-border">
                          <TableHead className="text-muted-foreground w-12">№</TableHead>
                          <TableHead className="text-muted-foreground">Что ищем</TableHead>
                          <TableHead className="text-muted-foreground w-28">Статус</TableHead>
                          <TableHead className="text-muted-foreground">Найденный товар</TableHead>
                          <TableHead className="text-muted-foreground w-24">Артикул</TableHead>
                          <TableHead className="text-muted-foreground">Поставщик</TableHead>
                          <TableHead className="text-muted-foreground w-16 text-center">Ед.</TableHead>
                          <TableHead className="text-muted-foreground w-24 text-right">Цена</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredItems.map((item) => {
                          const st = statusConfig[item.status];
                          return (
                            <TableRow
                              key={item.id}
                              className={`cursor-pointer border-b border-border transition-colors ${
                                item.status === "selected" ? "hover:bg-emerald-500/5" : "hover:bg-primary/5"
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
                              <TableCell className="text-foreground text-sm">
                                {item.selectedProduct || <span className="text-muted-foreground/50">нажмите для подбора</span>}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-xs font-mono">{item.article || "—"}</TableCell>
                              <TableCell className="text-muted-foreground text-sm">{item.supplier || "—"}</TableCell>
                              <TableCell className="text-muted-foreground text-sm text-center">{item.unit || "—"}</TableCell>
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
            </div>

            {/* Input area */}
            <div className="p-8 pt-4">
              <div className="flex items-end gap-2 rounded-lg border border-border bg-card p-2">
                <textarea
                  value={batchInput}
                  onChange={(e) => setBatchInput(e.target.value)}
                  placeholder={`Введите товары, каждый с новой строки...\nНапример:\nАвтомат дифференциальный С50 100мА\nКабель ВВГнг 3x2.5`}
                  rows={3}
                  className="flex-1 resize-none bg-transparent p-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <div className="flex flex-col gap-1">
                  <Button variant="coral" className="gap-2" onClick={handlePasteBatch} disabled={!batchInput.trim()}>
                    <Sparkles className="h-4 w-4" />
                    {items.length > 0 ? "Добавить" : "Найти"}
                  </Button>
                  <button
                    onClick={() => setBatchInput(EXAMPLE_BATCH)}
                    className="text-[10px] text-muted-foreground hover:text-primary transition-colors"
                  >
                    Пример
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results dialog — centered table with search */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="bg-card border-border max-w-4xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Варианты из прайс-листов
              </DialogTitle>
              {selectedItem && (
                <p className="text-sm text-muted-foreground mt-1">
                  Ищем: <span className="text-foreground font-medium">«{selectedItem.query}»</span>
                </p>
              )}
            </DialogHeader>

            {/* Search in dialog */}
            <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 mt-2">
              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <input
                value={dialogSearch}
                onChange={(e) => setDialogSearch(e.target.value)}
                placeholder="Фильтр по названию, поставщику, артикулу..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              {dialogSearch && (
                <button onClick={() => setDialogSearch("")} className="text-xs text-muted-foreground hover:text-foreground">
                  ✕
                </button>
              )}
            </div>

            <div className="rounded-lg border border-border overflow-hidden mt-2">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-muted-foreground">Товар</TableHead>
                    <TableHead className="text-muted-foreground w-28">Артикул</TableHead>
                    <TableHead className="text-muted-foreground w-28">Поставщик</TableHead>
                    <TableHead className="text-muted-foreground w-20 text-center">Совпад.</TableHead>
                    <TableHead className="text-muted-foreground w-20 text-center">Наличие</TableHead>
                    <TableHead className="text-muted-foreground w-20 text-center">Доставка</TableHead>
                    <TableHead className="text-muted-foreground w-14 text-center">Ед.</TableHead>
                    <TableHead className="text-muted-foreground w-24 text-right">Цена</TableHead>
                    <TableHead className="w-24" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        Ничего не найдено
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredResults.map((r) => (
                      <TableRow key={r.id} className="border-b border-border hover:bg-primary/5 transition-colors">
                        <TableCell className="text-foreground text-sm font-medium">{r.name}</TableCell>
                        <TableCell className="text-muted-foreground text-xs font-mono">{r.article}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{r.supplier}</TableCell>
                        <TableCell className="text-center">
                          <span className="text-xs rounded-full bg-primary/15 text-primary px-2 py-0.5 font-medium">
                            {r.match}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {r.inStock ? (
                            <span className="text-xs text-emerald-400 font-medium">В наличии</span>
                          ) : (
                            <span className="text-xs text-amber-400 font-medium">Под заказ</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-xs text-muted-foreground">{r.deliveryDays} дн.</TableCell>
                        <TableCell className="text-center text-xs text-muted-foreground">{r.unit}</TableCell>
                        <TableCell className="text-right font-mono text-sm text-foreground font-semibold">
                          {r.price.toLocaleString()} ₽
                        </TableCell>
                        <TableCell>
                          <Button variant="coral" size="sm" className="gap-1 w-full text-xs" onClick={() => handleSelectResult(r)}>
                            <Check className="h-3.5 w-3.5" />
                            Выбрать
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    ),
  };
}
