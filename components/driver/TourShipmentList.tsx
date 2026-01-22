"use client";

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IShipment } from '@/types';
import { GripVertical, MapPin, Phone, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface SortableItemProps {
  id: string;
  shipment: IShipment;
  index: number;
}

function SortableShipmentItem({ id, shipment, index }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-[#111111] border border-zinc-800 rounded-2xl p-4 flex items-center gap-4 group hover:border-zinc-700 transition-colors ${isDragging ? 'shadow-2xl shadow-green-500/20 ring-1 ring-green-500/50' : ''}`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="text-zinc-700 group-hover:text-zinc-500 cursor-grab active:cursor-grabbing p-1"
      >
        <GripVertical className="h-5 w-5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="bg-zinc-900/50 text-zinc-400 font-mono text-[10px] px-2 py-0 border-zinc-800 h-5">
            Stop {index + 1}
          </Badge>
          <h3 className="text-sm font-bold truncate">
            {(shipment.client as any)?.companyName || (shipment.client as any)?.firstName + ' ' + (shipment.client as any)?.lastName || "Recipient"}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <MapPin className="h-3 w-3" />
          <span className="truncate">
            {typeof shipment.receiverAddress === 'object' 
              ? `${shipment.receiverAddress.street}, ${shipment.receiverAddress.city}`
              : shipment.receiverAddress || "Address unavailable"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-500 hover:text-green-500 hover:bg-green-500/5 rounded-full">
          <Phone className="h-4 w-4" />
        </Button>
        <Button size="icon" className="h-9 w-9 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-full">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

interface TourShipmentListProps {
  shipments: IShipment[];
  tourId: string;
  onReorder: (newShipments: IShipment[]) => void;
}

export function TourShipmentList({ shipments: initialShipments, tourId, onReorder }: TourShipmentListProps) {
  const [items, setItems] = useState(initialShipments);

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item._id.toString() === active.id);
      const newIndex = items.findIndex((item) => item._id.toString() === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      try {
        const response = await fetch(`/api/tours/${tourId}/reorder`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shipmentIds: newItems.map(s => s._id.toString()) }),
        });

        if (!response.ok) throw new Error('Failed to update order');
        
        toast.success('Sequence updated');
        onReorder(newItems);
      } catch (error) {
        toast.error('Could not sync new sequence');
        setItems(initialShipments); // Rollback
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map(s => s._id.toString())}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {items.map((shipment, index) => (
            <SortableShipmentItem 
              key={shipment._id.toString()} 
              id={shipment._id.toString()} 
              shipment={shipment} 
              index={index}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
