import { useState, useRef, KeyboardEvent } from "react";
import { Search, Bot, Send, Lightbulb, Settings2, HelpCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const EXAMPLE_QUERIES = [
  "Выключатель белый двухклавишный 10А 250В",
  "Щит с монтажной панелью-2 IP31 500x400x220 мм, Лоток неперфорированный 100x150x3000 мм",
  "Дифференциальный автомат С50 100мА 6кА тип АС, Угол 90 градусов горизонтальный 80x400 мм 1,2 мм, Подвесной светильник IP20 под лампу GU10 Чёрный",
];

export function SearchSidebar({
  onSendQuery,
  onClear,
}: {
  onSendQuery: (q: string) => void;
  onClear: () => void;
}) {
  const [maxResults, setMaxResults] = useState(30);
  const [temperature, setTemperature] = useState(0.5);

  return (
    <div className="space-y-6">
      {/* Clear */}
      <Button variant="surface" size="sm" className="gap-2" onClick={onClear}>
        <Trash2 className="h-4 w-4" />
        Очистить разговор
      </Button>

      {/* Example queries */}
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

      {/* Search parameters */}
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
            max={100}
            min={1}
            step={1}
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
            max={1}
            min={0}
            step={0.01}
            className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_.relative>div]:bg-primary"
          />
        </div>
      </div>

      {/* Memory section */}
      <div className="border-t border-border pt-4 space-y-2">
        <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
          <span className="text-pink-400">●</span>
          Память
        </h3>
        <p className="text-sm text-muted-foreground">Нет истории разговора</p>
      </div>
    </div>
  );
}

export function SearchPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const dbCount = 40356;

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: `Я понимаю, что вы ищете следующие товары:\n\n1. Товар на основе запроса "${text.slice(0, 50)}..."\n\nВсё верно? Если нет, пожалуйста, уточните, что нужно исправить.`,
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

  return {
    sidebar: (
      <SearchSidebar
        onSendQuery={sendMessage}
        onClear={() => setMessages([])}
      />
    ),
    content: (
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="p-8 pb-4">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
            <Search className="h-8 w-8 text-primary" />
            Поиск товаров в прайс-листе
          </h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-emerald-400">✓</span>
            В базе данных {dbCount.toLocaleString()} товаров
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Введите список товаров, которые ищете
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-8 space-y-4 scrollbar-thin">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "" : ""}`}
            >
              <div
                className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                  msg.role === "user"
                    ? "bg-primary/20 text-primary"
                    : "bg-emerald-500/20 text-emerald-400"
                }`}
              >
                {msg.role === "user" ? (
                  <Search className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div
                className={`rounded-lg p-4 max-w-[80%] ${
                  msg.role === "user"
                    ? "bg-primary/10 border border-primary/30 text-foreground"
                    : "bg-card border border-border text-foreground"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
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
            <Button
              variant="coral"
              size="icon"
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    ),
  };
}
