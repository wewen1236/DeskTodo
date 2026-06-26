import { Plus } from 'lucide-react'
import { useTodoStore } from '@/store/todoStore'
import { useListStore } from '@/store/listStore'
import { Todo } from '@/types'
import { TodoItem } from './TodoItem'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

interface TodoListProps {
  todos: Todo[]
  onToggleComplete: (id: string) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
  onAdd: () => void
}

export function TodoList({ todos, onToggleComplete, onEdit, onDelete, onAdd }: TodoListProps) {
  const { searchQuery, filterCompleted, filterPriority, filterTag, getFilteredTodos, reorderTodos } = useTodoStore()
  const { activeListId } = useListStore()

  const filteredTodos = getFilteredTodos(activeListId || 'default')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      reorderTodos(active.id as string, over.id as string)
    }
  }

  const completedTodos = filteredTodos.filter((t) => t.completed)
  const activeTodos = filteredTodos.filter((t) => !t.completed)

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3">
        <span className="text-sm font-medium text-win-text-secondary">
          {filteredTodos.length > 0
            ? `${filteredTodos.length} 项待办 · ${completedTodos.length} 已完成`
            : '暂无待办'}
        </span>
        <button className="win-btn win-btn-primary text-sm" onClick={onAdd}>
          <Plus size={15} />
          <span>新建待办</span>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        {filteredTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-win-text-secondary gap-3">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.3">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
            </svg>
            <p className="text-sm">
              {searchQuery || filterCompleted !== 'all' || filterPriority !== 'all'
                ? '没有匹配的待办'
                : '点击上方按钮创建第一个待办'}
            </p>
          </div>
        ) : (
          <>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filteredTodos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-1">
                  {activeTodos.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggleComplete={onToggleComplete}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                  {completedTodos.length > 0 && (
                    <div className="pt-3 pb-1">
                      <span className="text-xs text-win-text-secondary font-medium px-1">
                        已完成 · {completedTodos.length}
                      </span>
                    </div>
                  )}
                  {completedTodos.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggleComplete={onToggleComplete}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </>
        )}
      </div>
    </div>
  )
}
