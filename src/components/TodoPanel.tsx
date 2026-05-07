import { useState } from 'react';
import { ListTodo, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AnimatedCheck } from './AnimatedCheck';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

function todoRows(text: string) {
  const visualRows = text
    .split('\n')
    .reduce((rows, line) => rows + Math.max(1, Math.ceil(line.length / 30)), 0);
  return Math.min(6, visualRows);
}

export function TodoPanel() {
  const todos = useStore((s) => s.state.todos);
  const addTodo = useStore((s) => s.addTodo);
  const toggleTodo = useStore((s) => s.toggleTodo);
  const updateTodo = useStore((s) => s.updateTodo);
  const deleteTodo = useStore((s) => s.deleteTodo);
  const clearCompletedTodos = useStore((s) => s.clearCompletedTodos);
  const [draft, setDraft] = useState('');
  const completedCount = todos.filter((todo) => todo.done).length;

  const submit = () => {
    if (!draft.trim()) return;
    addTodo(draft);
    setDraft('');
  };

  return (
    <Card className="bg-card border-border text-card-foreground lg:sticky lg:top-24">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ListTodo size={17} className="text-primary" />
            To Do List
          </CardTitle>
          {completedCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearCompletedTodos} className="h-7 px-2 text-[12px] text-muted-foreground">
              <X size={13} className="mr-1" />
              Clear done
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
            }}
            placeholder="Add a task..."
            className="bg-background border-input"
          />
          <Button onClick={submit} size="icon" aria-label="Add todo">
            <Plus size={16} />
          </Button>
        </div>

        {todos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground">
            No tasks yet. Add the next small action here.
          </div>
        ) : (
          <div className="space-y-2">
            {todos.map((todo) => (
              <div key={todo.id} className="group flex items-start gap-2 rounded-lg border border-border bg-background/70 px-3 py-2">
                <AnimatedCheck
                  checked={todo.done}
                  onChange={() => toggleTodo(todo.id)}
                  size={20}
                  className="shrink-0 pt-1"
                />
                <Textarea
                  value={todo.text}
                  onChange={(e) => updateTodo(todo.id, e.target.value)}
                  className={cn(
                    'min-h-8 flex-1 resize-none overflow-hidden whitespace-pre-wrap break-words border-0 bg-transparent px-0 py-0 text-base leading-relaxed shadow-none focus-visible:ring-0',
                    todo.done && 'text-muted-foreground line-through'
                  )}
                  aria-label="Todo text"
                  rows={todoRows(todo.text)}
                />
                <button
                  type="button"
                  onClick={() => deleteTodo(todo.id)}
                  className="mt-1 rounded-md p-1 text-muted-foreground opacity-70 transition-colors hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  aria-label="Delete todo"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
