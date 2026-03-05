import { useState, useRef, KeyboardEvent } from "react";
import { Search, Bot, Send, Lightbulb, Settings2, HelpCircle, Trash2, ClipboardList, Sparkles, Check, Package, X } from "lucide-react";
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
  onPasteBatch,
  hasBatchItems,
}: {
  mode: SearchMode;
  onModeChange: (m: SearchMode) => void;
  onSendQuery: (q: string) => void;
  onClear: () => void;
  onPasteBatch: (text: string) => void;
  hasBatchItems: boolean;
}) {
  const [maxResults, setMaxResults] = useState(30);
  const [temperature, setTemperature] = useState(0.5);
  const [batchText, setBatchText] = useState("");

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

          {/* Examples */}
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

          {/* Parameters */}
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
              <Slider
                value={[maxResults]}
                onValueChange={([v]) => setMaxResults(v)}
                max={100} min={1} step={1}
                className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_.relative>div]:bg-primary"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Температура LLM</span>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium text-primary">{temperature.toFixed(2)}</span>
              <Slider
                value={[temperature]}
                onValueChange={([v]) => setTemperature(v)}
                max={1} min={0} step={0.01}
                className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_.relative>div]:bg-primary"
              />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Batch mode sidebar */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Как это работает?</h3>
            <div className="space-y-2 text-sm">
              {[
                "Вставьте список товаров ниже",
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Список товаров</label>
            <textarea
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              placeholder={EXAMPLE_BATCH}
              rows={6}
              className="w-full rounded-lg border border-border bg-card p-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 resize-none transition-colors"
            />
            <p className="text-xs text-muted-foreground">Каждый товар — с новой строки</p>
          </div>

          <Button
            variant="coral"
            className="w-full gap-2"
            onClick={() => { onPasteBatch(batchText); setBatchText(""); }}
            disabled={!batchText.trim()}
          >
            <Sparkles className="h-4 w-4" />
            {hasBatchItems ? "Добавить позиции" : "Создать проект"}
          </Button>

          <button
            onClick={() => setBatchText(EXAMPLE_BATCH)}
            className="w-full text-xs text-muted-foreground hover:text-primary transition-colors text-center"
          >
            Вставить пример →
          </button>
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

  const handlePasteBatch = (text: string) => {
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
    setDialogOpen(true);
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
          ? { ...p, status: "selected", selectedProduct: result.name, supplier: result.supplier, price: result.price }
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

  return {
    sidebar: (
      <SearchSidebar
        mode={mode}
        onModeChange={setMode}
        onSendQuery={sendMessage}
        onClear={() => setMessages([])}
        onPasteBatch={handlePasteBatch}
        hasBatchItems={items.length > 0}
      />
    ),
    content: (
      <div className="flex h-full flex-col">
        {mode === "single" ? (
          /* ─── Single search mode ─── */
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
          <div className="flex h-full flex-col p-8">
            <div className="mb-6">
              <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
                <Package className="h-8 w-8 text-primary" />
                Подбор по списку
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
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-sm space-y-5">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                    <ClipboardList className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg font-semibold text-foreground">Вставьте список товаров</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Используйте панель слева — вставьте список, и система подберёт варианты из прайс-листов.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
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

            {/* Results dialog (centered table) */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="bg-card border-border max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-foreground flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    Варианты из прайс-листов
                  </DialogTitle>
                  {selectedItem && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Ищем: <span className="text-foreground">«{selectedItem.query}»</span>
                    </p>
                  )}
                </DialogHeader>

                <div className="rounded-lg border border-border overflow-hidden mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="text-muted-foreground">Товар</TableHead>
                        <TableHead className="text-muted-foreground w-32">Поставщик</TableHead>
                        <TableHead className="text-muted-foreground w-20 text-center">Совпад.</TableHead>
                        <TableHead className="text-muted-foreground w-24 text-right">Цена</TableHead>
                        <TableHead className="w-28" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOCK_RESULTS.map((r) => (
                        <TableRow key={r.id} className="border-b border-border hover:bg-primary/5">
                          <TableCell className="text-foreground text-sm font-medium">{r.name}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{r.supplier}</TableCell>
                          <TableCell className="text-center">
                            <span className="text-xs rounded-full bg-primary/15 text-primary px-2 py-0.5 font-medium">
                              {r.match}%
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm text-foreground font-semibold">
                            {r.price.toLocaleString()} ₽
                          </TableCell>
                          <TableCell>
                            <Button variant="coral" size="sm" className="gap-1.5 w-full" onClick={() => handleSelectResult(r)}>
                              <Check className="h-3.5 w-3.5" />
                              Выбрать
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    ),
  };
}
