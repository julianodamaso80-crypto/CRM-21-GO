# Implementar Kanban Board

Implemente um Kanban board para o Pipe: $ARGUMENTS

## Estrutura de componentes:

```
pages/pipeline/
├── PipelinePage.tsx      # Página principal com seletor de pipe
├── KanbanBoard.tsx       # Container do board (DndProvider)
├── KanbanColumn.tsx      # Coluna/fase (useDrop)
├── KanbanCard.tsx        # Card arrastável (useDrag)
├── CardDrawer.tsx        # Modal lateral para detalhes
└── CardForm.tsx          # Formulário de campos dinâmicos
```

## Implementação React DnD:

### KanbanCard (Draggable)
```tsx
import { useDrag } from 'react-dnd'

function KanbanCard({ card }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'CARD',
    item: { id: card.id, phaseId: card.phaseId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  return (
    <div
      ref={drag}
      className={`p-4 bg-white rounded-lg shadow cursor-move ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      {card.title}
    </div>
  )
}
```

### KanbanColumn (Droppable)
```tsx
import { useDrop } from 'react-dnd'

function KanbanColumn({ phase, cards, onDrop }) {
  const [{ isOver }, drop] = useDrop({
    accept: 'CARD',
    drop: (item) => onDrop(item.id, phase.id),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  })

  return (
    <div
      ref={drop}
      className={`flex-1 min-w-[300px] p-4 rounded-lg ${
        isOver ? 'bg-blue-50' : 'bg-gray-100'
      }`}
    >
      <h3 className="font-semibold mb-4">{phase.name}</h3>
      <div className="space-y-3">
        {cards.map(card => <KanbanCard key={card.id} card={card} />)}
      </div>
    </div>
  )
}
```

### KanbanBoard (Provider)
```tsx
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

function KanbanBoard({ phases, cards }) {
  const moveCard = useMoveCard()

  const handleDrop = (cardId, toPhaseId) => {
    moveCard.mutate({ cardId, toPhaseId })
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {phases.map(phase => (
          <KanbanColumn
            key={phase.id}
            phase={phase}
            cards={cards.filter(c => c.phaseId === phase.id)}
            onDrop={handleDrop}
          />
        ))}
      </div>
    </DndProvider>
  )
}
```

## API necessária:

```
GET  /api/pipes/:pipeId/cards    # Listar cards do pipe
POST /api/pipes/:pipeId/cards    # Criar card
PATCH /api/cards/:id/move        # Mover card { toPhaseId }
```

## Optimistic Update:

```tsx
const moveCard = useMutation({
  mutationFn: ({ cardId, toPhaseId }) =>
    cardsService.move(cardId, toPhaseId),
  onMutate: async ({ cardId, toPhaseId }) => {
    await queryClient.cancelQueries(['cards'])
    const previous = queryClient.getQueryData(['cards'])

    queryClient.setQueryData(['cards'], (old) =>
      old.map(card =>
        card.id === cardId ? { ...card, phaseId: toPhaseId } : card
      )
    )

    return { previous }
  },
  onError: (err, variables, context) => {
    queryClient.setQueryData(['cards'], context.previous)
    toast.error('Erro ao mover card')
  },
  onSettled: () => {
    queryClient.invalidateQueries(['cards'])
  },
})
```

## Checklist:
- [ ] Backend: API de cards com move
- [ ] Frontend: KanbanBoard component
- [ ] Frontend: KanbanColumn component
- [ ] Frontend: KanbanCard component
- [ ] Frontend: useMoveCard hook com optimistic update
- [ ] Frontend: CardDrawer para detalhes
- [ ] Testar drag & drop funcional
